import express from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Configure multer
const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        cb(file.mimetype === 'application/pdf' ? null : new Error('Only PDF files allowed'), file.mimetype === 'application/pdf');
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch { return 'Invalid Date'; }
};

const getAdminData = async () => {
    try {
        let { data, error } = await supabase.from('admin_users').select('*').eq('role', 'pov_admin').single();
        
        if (!data) {
            const { data: newAdmin } = await supabase.from('admin_users').insert([{
                role: 'pov_admin',
                password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
                created_at: new Date().toISOString()
            }]).select().single();
            return newAdmin;
        }
        return data;
    } catch { return null; }
};

// Middleware
const requireAdmin = (req, res, next) => {
    if (req.session?.isPOVAdmin) return next();
    res.redirect('/pov/admin/login');
};

// Public Routes
router.get('/', async (req, res) => {
    try {
        const { data: povPosts } = await supabase.from('pov_posts').select('*').order('created_at', { ascending: false });
        
        const formattedPosts = (povPosts || []).map(post => ({
            ...post,
            created_at_display: formatDate(post.created_at),
            updated_at_display: formatDate(post.updated_at),
            has_pdf: !!post.pdf_file
        }));
        
        res.render('pov/index', { povPosts: formattedPosts, title: 'Point of View' });
    } catch {
        res.render('pov/index', { povPosts: [], title: 'Point of View' });
    }
});

router.get('/post/:id', async (req, res) => {
    try {
        const { data: post } = await supabase.from('pov_posts').select('*').eq('id', req.params.id).single();
        
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        res.json({
            ...post,
            created_at_display: formatDate(post.created_at),
            updated_at_display: formatDate(post.updated_at),
            has_pdf: !!post.pdf_file
        });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/download/:id', async (req, res) => {
    try {
        const { data: post } = await supabase.from('pov_posts').select('*').eq('id', req.params.id).single();
        
        if (!post?.pdf_file) return res.status(404).json({ error: 'PDF not found' });
        
        try {
            const { data: fileData } = await supabase.storage.from('pov-pdfs').download(post.pdf_file);
            const buffer = Buffer.from(await fileData.arrayBuffer());
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${post.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf"`);
            res.send(buffer);
        } catch {
            const { data: signedUrlData } = await supabase.storage.from('pov-pdfs').createSignedUrl(post.pdf_file, 300);
            res.redirect(signedUrlData.signedUrl);
        }
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Routes
router.get('/admin/login', (req, res) => {
    res.render('pov/admin/login', { error: null, title: 'Admin Login' });
}); 

router.post('/admin/login', async (req, res) => {
    try {
        const adminData = await getAdminData();
        const match = adminData && await bcrypt.compare(req.body.password, adminData.password_hash);
        
        if (match) {
            req.session.isPOVAdmin = true;
            req.session.save(() => res.redirect('/pov/admin'));
        } else {
            res.render('pov/admin/login', { error: 'Invalid password', title: 'Admin Login' });
        }
    } catch {
        res.render('pov/admin/login', { error: 'An error occurred', title: 'Admin Login' });
    }
});

router.get('/admin', requireAdmin, async (req, res) => {
    try {
        const { data: povPosts } = await supabase.from('pov_posts').select('*').order('created_at', { ascending: false });
        
        const formattedPosts = (povPosts || []).map(post => ({
            ...post,
            created_at_display: formatDate(post.created_at),
            updated_at_display: formatDate(post.updated_at),
            has_pdf: !!post.pdf_file,
            pdf_status: post.pdf_file ? '✓' : '✗'
        }));
        
        res.render('pov/admin/dashboard', { povPosts: formattedPosts, title: 'Admin Dashboard' });
    } catch {
        res.render('pov/admin/dashboard', { povPosts: [], title: 'Admin Dashboard' });
    }
});

router.post('/admin/logout', (req, res) => {
    req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/pov');
    });
});

router.get('/admin/add', requireAdmin, (req, res) => {
    res.render('pov/admin/add', { title: 'Add New Post', error: null });
});

router.post('/admin/add', requireAdmin, upload.single('pdf'), async (req, res) => {
    try {
        const { title, description, content, author } = req.body;
        
        if (!title || !description || !content || !author) {
            return res.render('pov/admin/add', { error: 'All fields required', title: 'Add New Post' });
        }

        let pdfFileName = null;
        
        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { data: uploadData, error } = await supabase.storage
                .from('pov-pdfs')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
                
            if (error) return res.render('pov/admin/add', { error: 'Error uploading PDF', title: 'Add New Post' });
            pdfFileName = uploadData.path;
        }
        
        const currentTime = new Date().toISOString();
        const { error } = await supabase.from('pov_posts').insert([{
            title, description, content, author, pdf_file: pdfFileName,
            created_at: currentTime, updated_at: currentTime
        }]);
            
        if (error) {
            if (pdfFileName) await supabase.storage.from('pov-pdfs').remove([pdfFileName]);
            return res.render('pov/admin/add', { error: 'Error saving post', title: 'Add New Post' });
        }
        
        res.redirect('/pov/admin');
    } catch {
        res.render('pov/admin/add', { error: 'Unexpected error', title: 'Add New Post' });
    }
});

router.get('/admin/edit/:id', requireAdmin, async (req, res) => {
    try {
        const { data: post } = await supabase.from('pov_posts').select('*').eq('id', req.params.id).single();
        
        if (!post) return res.redirect('/pov/admin');
        
        res.render('pov/admin/edit', {
            post: { ...post, has_pdf: !!post.pdf_file, created_at_display: formatDate(post.created_at), updated_at_display: formatDate(post.updated_at) },
            title: 'Edit Post',
            error: null
        });
    } catch {
        res.redirect('/pov/admin');
    }
});

router.post('/admin/edit/:id', requireAdmin, upload.single('pdf'), async (req, res) => {
    try {
        const { title, description, content, author } = req.body;
        
        if (!title || !description || !content || !author) {
            const { data: post } = await supabase.from('pov_posts').select('*').eq('id', req.params.id).single();
            return res.render('pov/admin/edit', { post, error: 'All fields required', title: 'Edit Post' });
        }
        
        const { data: existingPost } = await supabase.from('pov_posts').select('*').eq('id', req.params.id).single();
        if (!existingPost) return res.redirect('/pov/admin');
        
        let pdfFileName = existingPost.pdf_file;
        
        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { data: uploadData, error } = await supabase.storage
                .from('pov-pdfs')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
                
            if (error) {
                return res.render('pov/admin/edit', { post: existingPost, error: 'Error uploading PDF', title: 'Edit Post' });
            }
            
            if (existingPost.pdf_file) await supabase.storage.from('pov-pdfs').remove([existingPost.pdf_file]);
            pdfFileName = uploadData.path;
        }
        
        const { error } = await supabase.from('pov_posts').update({
            title, description, content, author, pdf_file: pdfFileName, updated_at: new Date().toISOString()
        }).eq('id', req.params.id);
            
        if (error) {
            return res.render('pov/admin/edit', { post: existingPost, error: 'Error updating post', title: 'Edit Post' });
        }
        
        res.redirect('/pov/admin');
    } catch {
        res.redirect('/pov/admin');
    }
});

router.post('/admin/delete/:id', requireAdmin, async (req, res) => {
    try {
        const { data: post } = await supabase.from('pov_posts').select('*').eq('id', req.params.id).single();
        
        if (post?.pdf_file) await supabase.storage.from('pov-pdfs').remove([post.pdf_file]);
        await supabase.from('pov_posts').delete().eq('id', req.params.id);
    } catch {}
    
    res.redirect('/pov/admin');
});

export default router;