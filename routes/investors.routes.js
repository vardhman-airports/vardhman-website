import { Router } from "express";
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import requireAdmin from '../middleware/requireAdmin.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
// anon key for public reads; service role for privileged admin writes and
// storage (private bucket) — bypasses RLS on the investor_documents table.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
});

const CATEGORY_LABELS = {
    'notices':                        'Notices',
    'annual-report':                  'Annual Report',
    'board-meeting-outcome':          'Board Meeting Outcome',
    'voting-results':                 'Voting Results',
    'financial-results/board-report': 'Financial Results → Board Report',
    'financial-results/balance-sheet':'Financial Results → Balance Sheet',
    'financial-results/aoc4':         'Financial Results → Form AOC-4',
    'shareholding-pattern':           'Shareholding Pattern',
    'annual-return':                  'Annual Return',
    'corporate-governance':           'Corporate Governance',
    'company-policies':               'Company Policies',
    'offer-documents/drhp':           'Offer Documents → DRHP',
    'offer-documents/rhp':            'Offer Documents → RHP',
    'offer-documents/prospectus':     'Offer Documents → Prospectus',
    'offer-documents/other-documents':'Offer Documents → Other Documents',
    'media-press':                    'Media & Press',
};

const docPage = (title, breadcrumb, documents = []) => ({
    currentTitle: `${title} | Investors`,
    pageTitle: title,
    breadcrumb,
    documents
});

const inv = (label, href) => ({ label, href });

// fetch docs from Supabase and map to { label, file } shape the template expects
const getDocsByCategory = async (categories) => {
    const cats = Array.isArray(categories) ? categories : [categories];
    const { data } = await supabase
        .from('investor_documents')
        .select('*')
        .in('category', cats)
        .order('created_at', { ascending: true });

    return (data || []).map(doc => ({
        label: doc.label,
        file: `/investors/doc/${doc.id}`,
    }));
};

// ── Serve uploaded files ───────────────────────────────────────────────────

router.get('/doc/:id', async (req, res) => {
    try {
        const { data: doc } = await supabase
            .from('investor_documents')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (!doc) return res.status(404).send('Document not found');

        const { data: fileData } = await supabaseAdmin.storage
            .from('investor-docs')
            .download(doc.file_url);

        const buffer = Buffer.from(await fileData.arrayBuffer());
        const ext = doc.file_url.split('.').pop().toLowerCase();
        const mimeMap = {
            pdf:  'application/pdf',
            doc:  'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls:  'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.label.replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}"`);
        res.send(buffer);
    } catch {
        res.status(500).send('Error serving document');
    }
});

// ── Admin routes ───────────────────────────────────────────────────────────

router.get('/admin/login', (req, res) => {
    res.redirect('/auth/login?returnTo=' + encodeURIComponent('/investors/admin'));
});

router.post('/admin/logout', (req, res) => {
    req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/investors');
    });
});

router.get('/admin', requireAdmin, async (req, res) => {
    try {
        const { data: docs } = await supabase
            .from('investor_documents')
            .select('*')
            .order('category', { ascending: true })
            .order('created_at', { ascending: true });

        const grouped = {};
        (docs || []).forEach(doc => {
            if (!grouped[doc.category]) {
                grouped[doc.category] = { label: CATEGORY_LABELS[doc.category] || doc.category, docs: [] };
            }
            grouped[doc.category].docs.push(doc);
        });

        res.render('investors/admin/dashboard', { grouped, categoryLabels: CATEGORY_LABELS, title: 'Investors Admin' });
    } catch {
        res.render('investors/admin/dashboard', { grouped: {}, categoryLabels: CATEGORY_LABELS, title: 'Investors Admin' });
    }
});

router.get('/admin/add', requireAdmin, (req, res) => {
    res.render('investors/admin/add', { categoryLabels: CATEGORY_LABELS, error: null, title: 'Add Document' });
});

router.post('/admin/add', requireAdmin, upload.single('file'), async (req, res) => {
    try {
        const { label, category } = req.body;

        if (!label || !category || !req.file) {
            return res.render('investors/admin/add', { categoryLabels: CATEGORY_LABELS, error: 'Label, category, and file are all required', title: 'Add Document' });
        }

        if (!CATEGORY_LABELS[category]) {
            return res.render('investors/admin/add', { categoryLabels: CATEGORY_LABELS, error: 'Invalid category selected', title: 'Add Document' });
        }

        const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${category.replace(/\//g, '-')}/${Date.now()}-${safeName}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('investor-docs')
            .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });

        if (uploadError) {
            return res.render('investors/admin/add', { categoryLabels: CATEGORY_LABELS, error: 'Error uploading file to storage', title: 'Add Document' });
        }

        const { error: dbError } = await supabaseAdmin.from('investor_documents').insert([{
            label,
            category,
            file_url: uploadData.path,
            created_at: new Date().toISOString()
        }]);

        if (dbError) {
            await supabaseAdmin.storage.from('investor-docs').remove([uploadData.path]);
            return res.render('investors/admin/add', { categoryLabels: CATEGORY_LABELS, error: 'Error saving document record', title: 'Add Document' });
        }

        res.redirect('/investors/admin');
    } catch {
        res.render('investors/admin/add', { categoryLabels: CATEGORY_LABELS, error: 'Unexpected error', title: 'Add Document' });
    }
});

router.get('/admin/edit/:id', requireAdmin, async (req, res) => {
    try {
        const { data: doc } = await supabaseAdmin.from('investor_documents').select('*').eq('id', req.params.id).single();
        if (!doc) return res.redirect('/investors/admin');
        res.render('investors/admin/edit', { doc, categoryLabels: CATEGORY_LABELS, error: null, title: 'Edit Document' });
    } catch {
        res.redirect('/investors/admin');
    }
});

router.post('/admin/edit/:id', requireAdmin, upload.single('file'), async (req, res) => {
    try {
        const { label, category } = req.body;

        const { data: doc } = await supabaseAdmin.from('investor_documents').select('*').eq('id', req.params.id).single();
        if (!doc) return res.redirect('/investors/admin');

        if (!label || !category) {
            return res.render('investors/admin/edit', { doc, categoryLabels: CATEGORY_LABELS, error: 'Label and category are required', title: 'Edit Document' });
        }
        if (!CATEGORY_LABELS[category]) {
            return res.render('investors/admin/edit', { doc, categoryLabels: CATEGORY_LABELS, error: 'Invalid category selected', title: 'Edit Document' });
        }

        let fileUrl = doc.file_url;

        // A new file is optional — only replace when one is uploaded.
        if (req.file) {
            const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            const storagePath = `${category.replace(/\//g, '-')}/${Date.now()}-${safeName}`;

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('investor-docs')
                .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });

            if (uploadError) {
                return res.render('investors/admin/edit', { doc, categoryLabels: CATEGORY_LABELS, error: 'Error uploading file to storage', title: 'Edit Document' });
            }
            fileUrl = uploadData.path;
        }

        const { error: dbError } = await supabaseAdmin.from('investor_documents')
            .update({ label, category, file_url: fileUrl })
            .eq('id', req.params.id);

        if (dbError) {
            // Roll back the newly uploaded file if the DB update failed.
            if (req.file && fileUrl !== doc.file_url) {
                await supabaseAdmin.storage.from('investor-docs').remove([fileUrl]);
            }
            return res.render('investors/admin/edit', { doc, categoryLabels: CATEGORY_LABELS, error: 'Error saving changes', title: 'Edit Document' });
        }

        // Remove the old stored file once the replacement is committed.
        if (req.file && doc.file_url && doc.file_url !== fileUrl) {
            await supabaseAdmin.storage.from('investor-docs').remove([doc.file_url]);
        }

        res.redirect('/investors/admin');
    } catch {
        res.redirect('/investors/admin');
    }
});

router.post('/admin/delete/:id', requireAdmin, async (req, res) => {
    try {
        const { data: doc } = await supabaseAdmin.from('investor_documents').select('*').eq('id', req.params.id).single();
        if (doc) {
            await supabaseAdmin.storage.from('investor-docs').remove([doc.file_url]);
        }
        await supabaseAdmin.from('investor_documents').delete().eq('id', req.params.id);
    } catch {}

    res.redirect('/investors/admin');
});

// ── Public routes ──────────────────────────────────────────────────────────

router.get("/", (req, res) => {
    res.render("investors/index.ejs", {
        currentTitle: "Investors",
        style: req.query.style === "b" ? "b" : "a",
    });
});

router.get("/notices", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Notices",
        [inv("Investors", "/investors"), inv("Notices")],
        await getDocsByCategory('notices')
    ));
});

router.get("/annual-report", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Annual Report",
        [inv("Investors", "/investors"), inv("Annual Report")],
        await getDocsByCategory('annual-report')
    ));
});

router.get("/board-meeting-outcome", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Board Meeting Outcome",
        [inv("Investors", "/investors"), inv("Board Meeting Outcome")],
        await getDocsByCategory('board-meeting-outcome')
    ));
});

router.get("/voting-results", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Voting Results",
        [inv("Investors", "/investors"), inv("Voting Results")],
        await getDocsByCategory('voting-results')
    ));
});

router.get("/financial-results", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Financial Results",
        [inv("Investors", "/investors"), inv("Financial Results")],
        await getDocsByCategory(['financial-results/board-report', 'financial-results/balance-sheet', 'financial-results/aoc4'])
    ));
});

router.get("/financial-results/board-report", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Board Report",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Board Report")],
        await getDocsByCategory('financial-results/board-report')
    ));
});

router.get("/financial-results/balance-sheet", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Balance Sheet",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Balance Sheet")],
        await getDocsByCategory('financial-results/balance-sheet')
    ));
});

router.get("/financial-results/form-aoc4", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Form AOC-4",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Form AOC-4")],
        await getDocsByCategory('financial-results/aoc4')
    ));
});

router.get("/shareholding-pattern", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Shareholding Pattern",
        [inv("Investors", "/investors"), inv("Shareholding Pattern")],
        await getDocsByCategory('shareholding-pattern')
    ));
});

router.get("/annual-return", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Annual Return (MGT-7)",
        [inv("Investors", "/investors"), inv("Annual Return")],
        await getDocsByCategory('annual-return')
    ));
});

router.get("/corporate-governance", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Corporate Governance",
        [inv("Investors", "/investors"), inv("Corporate Governance")],
        await getDocsByCategory('corporate-governance')
    ));
});

router.get("/company-policies", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Company Policies",
        [inv("Investors", "/investors"), inv("Company Policies")],
        await getDocsByCategory('company-policies')
    ));
});

router.get("/offer-documents", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Offer Documents",
        [inv("Investors", "/investors"), inv("Offer Documents")],
        await getDocsByCategory(['offer-documents/drhp', 'offer-documents/rhp', 'offer-documents/prospectus', 'offer-documents/other-documents'])
    ));
});

router.get("/offer-documents/drhp", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Draft Red Herring Prospectus (DRHP)",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("DRHP")],
        await getDocsByCategory('offer-documents/drhp')
    ));
});

router.get("/offer-documents/rhp", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Red Herring Prospectus (RHP)",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("RHP")],
        await getDocsByCategory('offer-documents/rhp')
    ));
});

router.get("/offer-documents/prospectus", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Prospectus",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("Prospectus")],
        await getDocsByCategory('offer-documents/prospectus')
    ));
});

router.get("/offer-documents/other-documents", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Other Documents",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("Other Documents")],
        await getDocsByCategory('offer-documents/other-documents')
    ));
});

router.get("/investor-enquiry", (req, res) => {
    res.render("investors/enquiry.ejs");
});

router.get("/investor-grievance", (req, res) => {
    res.redirect(301, "/investors/investor-enquiry");
});

router.get("/media-press", async (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Media & Press",
        [inv("Investors", "/investors"), inv("Media & Press")],
        await getDocsByCategory('media-press')
    ));
});

export default router;
