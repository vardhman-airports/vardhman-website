import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx/.test(file.originalname.toLowerCase()) && /pdf|doc|docx/.test(file.mimetype);
        cb(allowed ? null : new Error('Only PDF, DOC, and DOCX files allowed'), allowed);
    }
});

// Helper functions
const getAdminData = async () => {
    try {
        let { data } = await supabase.from('admin_users').select('*').eq('role', 'career_admin').single();
        
        if (!data) {
            const { data: newAdmin } = await supabase.from('admin_users').insert([{
                role: 'career_admin',
                password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
                created_at: new Date().toISOString()
            }]).select().single();
            return newAdmin;
        }
        return data;
    } catch { return null; }
};

const isAdmin = (req, res, next) => {
    if (req.session?.isCareerAdmin) return next();
    res.redirect('/careers/admin/login');
};

// Public Routes
router.get('/', async (req, res) => {
    try {
        const { data: careers } = await supabase.from('careers').select('*').eq('status', 'active').order('created_at', { ascending: false });
        res.render('careers/index', { careers: careers || [] });
    } catch {
        res.render('careers/index', { careers: [] });
    }
});

router.get('/job/:id', async (req, res) => {
    try {
        const { data: job } = await supabase.from('careers').select('*').eq('id', req.params.id).single();
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/apply/:id', upload.single('resume'), async (req, res) => {
    try {
        const { data: job } = await supabase.from('careers').select('*').eq('id', req.params.id).single();
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const { name, email, mobile, message, reference } = req.body;
        
        if (!name || !email || !mobile || !req.file) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Upload resume
        const resumeFileName = `${Date.now()}-${uuidv4()}-${req.file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('resumes')
            .upload(resumeFileName, req.file.buffer, { contentType: req.file.mimetype });
            
        if (uploadError) return res.status(500).json({ error: 'Error uploading resume' });

        // Store application
        const applicationData = {
            id: uuidv4(),
            job_id: job.id,
            job_title: job.title,
            name, email, mobile,
            message: message || '',
            reference: reference || '',
            resume_file: uploadData.path,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('applications').insert([applicationData]);

        if (error) {
            await supabaseAdmin.storage.from('resumes').remove([uploadData.path]);
            return res.status(500).json({ error: 'Error storing application' });
        }

        // Send email notification
        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                throw new Error('Email service not configured');
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                tls: { rejectUnauthorized: false }
            });

            await transporter.verify();

            await transporter.sendMail({
                from: `"Careers Portal" <${process.env.EMAIL_USER}>`,
                to: 'careers@vardhmanairports.com',
                subject: `New Application for ${job.title}`,
                html: `
                    <h2>New Job Application Received</h2>
                    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Job Title:</td><td style="padding: 8px; border: 1px solid #ddd;">${job.title}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Applicant Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Mobile:</td><td style="padding: 8px; border: 1px solid #ddd;">${mobile}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Message:</td><td style="padding: 8px; border: 1px solid #ddd;">${(message || 'No message provided').replace(/\n/g, '<br>')}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Reference:</td><td style="padding: 8px; border: 1px solid #ddd;">${reference || 'No reference provided'}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Application ID:</td><td style="padding: 8px; border: 1px solid #ddd;">${applicationData.id}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Submitted at:</td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
                    </table>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">Resume file: ${req.file.originalname} (attached)</p>
                `,
                attachments: [{ filename: req.file.originalname, content: req.file.buffer, contentType: req.file.mimetype }]
            });
        } catch (emailError) {
            console.error('Email error:', emailError);
        }

        res.json({ success: true, message: 'Application submitted successfully!', applicationId: applicationData.id });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Routes
router.get('/admin/login', (req, res) => res.render('careers/admin/login'));

router.post('/admin/login', async (req, res) => {
    try {
        const adminData = await getAdminData();
        const match = adminData && await bcrypt.compare(req.body.password, adminData.password_hash);
        
        if (match) {
            req.session.isCareerAdmin = true;
            req.session.save(() => res.redirect('/careers/admin'));
        } else {
            res.render('careers/admin/login', { error: 'Invalid password' });
        }
    } catch {
        res.render('careers/admin/login', { error: 'An error occurred' });
    }
});

router.get('/admin', isAdmin, async (req, res) => {
    try {
        const { data: careers } = await supabase.from('careers').select('*').order('created_at', { ascending: false });
        const { data: applications } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
        res.render('careers/admin/dashboard', { careers: careers || [], applications: applications || [] });
    } catch {
        res.render('careers/admin/dashboard', { careers: [], applications: [] });
    }
});

router.post('/admin/logout', (req, res) => {
    req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/careers');
    });
});

router.get('/admin/add', isAdmin, (req, res) => res.render('careers/admin/add'));

router.post('/admin/add', isAdmin, async (req, res) => {
    try {
        const { title, department, location, type, experience, description, responsibilities, requirements, qualifications, benefits } = req.body;
        
        if (!title || !department || !location || !type || !description) {
            return res.render('careers/admin/add', { error: 'All required fields must be filled' });
        }
        
        const { error } = await supabase.from('careers').insert([{
            id: uuidv4(), title, department, location, type,
            experience: experience || '', description,
            responsibilities: responsibilities || '',
            requirements: requirements || '',
            qualifications: qualifications || '',
            benefits: benefits || '',
            status: 'active',
            created_at: new Date().toISOString()
        }]);
            
        if (error) return res.render('careers/admin/add', { error: 'Failed to add job' });
        res.redirect('/careers/admin');
    } catch {
        res.render('careers/admin/add', { error: 'Failed to add job' });
    }
});

router.get('/admin/edit/:id', isAdmin, async (req, res) => {
    try {
        const { data: job } = await supabase.from('careers').select('*').eq('id', req.params.id).single();
        if (!job) return res.redirect('/careers/admin');
        res.render('careers/admin/edit', { job });
    } catch {
        res.redirect('/careers/admin');
    }
});

router.post('/admin/edit/:id', isAdmin, async (req, res) => {
    try {
        const { title, department, location, type, experience, description, responsibilities, requirements, qualifications, benefits, status } = req.body;
        
        if (!title || !department || !location || !type || !description) {
            const { data: job } = await supabase.from('careers').select('*').eq('id', req.params.id).single();
            return res.render('careers/admin/edit', { job, error: 'All required fields must be filled' });
        }
        
        await supabase.from('careers').update({
            title, department, location, type,
            experience: experience || '', description,
            responsibilities: responsibilities || '',
            requirements: requirements || '',
            qualifications: qualifications || '',
            benefits: benefits || '',
            status: status || 'active',
            updated_at: new Date().toISOString()
        }).eq('id', req.params.id);
            
        res.redirect('/careers/admin');
    } catch {
        res.redirect('/careers/admin');
    }
});

router.post('/admin/delete/:id', isAdmin, async (req, res) => {
    try {
        await supabase.from('careers').delete().eq('id', req.params.id);
    } catch {}
    res.redirect('/careers/admin');
});

router.get('/admin/applications', isAdmin, async (req, res) => {
    try {
        const { data: applications } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
        res.render('careers/admin/applications', { applications: applications || [] });
    } catch {
        res.render('careers/admin/applications', { applications: [] });
    }
});

router.post('/admin/applications/:id/status', isAdmin, async (req, res) => {
    try {
        await supabase.from('applications').update({
            status: req.body.status,
            updated_at: new Date().toISOString()
        }).eq('id', req.params.id);
    } catch {}
    res.redirect('/careers/admin/applications');
});

router.get('/admin/download-resume/:id', isAdmin, async (req, res) => {
    try {
        const { data: application } = await supabase.from('applications').select('*').eq('id', req.params.id).single();
        
        if (!application?.resume_file) return res.status(404).send('Resume not found');
        
        const { data: signedUrlData } = await supabase.storage.from('resumes').createSignedUrl(application.resume_file, 60);
        res.redirect(signedUrlData.signedUrl);
    } catch {
        res.status(500).send('Internal server error');
    }
});

export default router;