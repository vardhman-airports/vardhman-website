import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// File paths
const CAREERS_FILE = path.join(__dirname, '../data/careers.json');
const APPLICATIONS_FILE = path.join(__dirname, '../data/applications.json');
const ADMIN_FILE = path.join(__dirname, '../data/admin.json');

// Multer config for resume uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/resumes');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: multer.memoryStorage(), // Store in memory instead of disk
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
    }
});

// Helper functions
function readCareersFile() {
    try {
        if (fs.existsSync(CAREERS_FILE)) {
            const data = fs.readFileSync(CAREERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading careers file:', error);
    }
    return [];
}
function writeCareersFile(data) {
    try {
        fs.writeFileSync(CAREERS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing careers file:', error);
    }
}
function readApplicationsFile() {
    try {
        if (fs.existsSync(APPLICATIONS_FILE)) {
            const data = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading applications file:', error);
    }
    return [];
}
function writeApplicationsFile(data) {
    try {
        fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing applications file:', error);
    }
}
const readAdminFile = () => {
    try { 
        if (fs.existsSync(ADMIN_FILE)) {
            const data = fs.readFileSync(ADMIN_FILE, 'utf8');
            return JSON.parse(data);
        }
        // Default admin password: "admin123" (hashed)
        const defaultPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
        const defaultData = { password: defaultPassword };
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    } catch (error) {
        console.error('Error reading admin data:', error);
        return null;
    }
};

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    // Check if session exists and user is admin
    if (req.session && req.session.isCareerAdmin === true) {
        return next();
    }
    
    // If session might not be fully loaded, try to reload it
    if (req.session) {
        req.session.reload((err) => {
            if (err) {
                console.error('Session reload error:', err);
            }
            
            // Check again after reload
            if (req.session && req.session.isCareerAdmin === true) {
                return next();
            }
            
            // Not authenticated, redirect to login
            res.redirect('/careers/admin/login');
        });
    } else {
        // No session at all, redirect to login
        res.redirect('/careers/admin/login');
    }
}

// Main careers page
router.get('/', (req, res) => {
    const careers = readCareersFile();
    res.render('careers/index', { careers });
});

// Get job details (for modal)
router.get('/job/:id', (req, res) => {
    const careers = readCareersFile();
    const job = careers.find(c => c.id === req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
});

// Apply for job (with email)
router.post('/apply/:id', upload.single('resume'), async (req, res) => {
    try {
        const careers = readCareersFile();
        const job = careers.find(c => c.id === req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const { name, email, mobile, message, reference } = req.body;
        if (!name || !email || !mobile || !req.file) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Email config
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Careers Portal" <${process.env.EMAIL_USER}>`,
            to: 'aryankansal15@gmail.com',
            subject: `New Application for ${job.title}`,
            text: `
A new application has been submitted.

Job Title: ${job.title}
Applicant Name: ${name}
Email: ${email}
Mobile: ${mobile}
Message: ${message || ''}
Reference: ${reference || ''}
            `,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer, // Use buffer instead of path
                    contentType: req.file.mimetype
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Application submitted and emailed successfully!' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin login page
router.get('/admin/login', (req, res) => {
    res.render('careers/admin/login');
});

// Admin login POST (bcrypt check, session set)
router.post('/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const adminData = readAdminFile();
        
        if (!adminData || !adminData.password) {
            return res.render('careers/admin/login', { error: 'Admin not configured' });
        }
        
        const match = await bcrypt.compare(password, adminData.password);
        
        if (match) {
            // Set session data
            req.session.isCareerAdmin = true;
            
            // IMPORTANT: Save the session before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.render('careers/admin/login', { error: 'Login failed. Please try again.' });
                }
                
                // Session is now saved, safe to redirect
                res.redirect('/careers/admin');
            });
        } else {
            res.render('careers/admin/login', { error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('careers/admin/login', { error: 'An error occurred. Please try again.' });
    }
});

// Admin dashboard
router.get('/admin', isAdmin, (req, res) => {
    const careers = readCareersFile();
    const applications = readApplicationsFile();
    res.render('careers/admin/dashboard', { careers, applications });
});

// Admin logout
router.post('/admin/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                // Even if destroy fails, clear the session data
                req.session = null;
            }
            // Clear the session cookie
            res.clearCookie('connect.sid'); // Default session cookie name
            res.redirect('/careers');
        });
    } else {
        res.redirect('/careers');
    }
});

// Add new job
router.get('/admin/add', isAdmin, (req, res) => {
    res.render('careers/admin/add');
});
router.post('/admin/add', isAdmin, (req, res) => {
    try {
        const { title, department, location, type, experience, description, responsibilities, requirements, qualifications, benefits } = req.body;
        if (!title || !department || !location || !type || !description) {
            return res.render('careers/admin/add', { error: 'All required fields must be filled' });
        }
        const careers = readCareersFile();
        const newJob = {
            id: uuidv4(),
            title,
            department,
            location,
            type,
            experience: experience || '',
            description,
            responsibilities: responsibilities || '',
            requirements: requirements || '',
            qualifications: qualifications || '',
            benefits: benefits || '',
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        careers.push(newJob);
        writeCareersFile(careers);
        res.redirect('/careers/admin');
    } catch (error) {
        console.error('Error adding job:', error);
        res.render('careers/admin/add', { error: 'Failed to add job' });
    }
});

// Edit job
router.get('/admin/edit/:id', isAdmin, (req, res) => {
    const careers = readCareersFile();
    const job = careers.find(c => c.id === req.params.id);
    if (!job) {
        return res.redirect('/careers/admin');
    }
    res.render('careers/admin/edit', { job });
});
router.post('/admin/edit/:id', isAdmin, (req, res) => {
    try {
        const { title, department, location, type, experience, description, responsibilities, requirements, qualifications, benefits, status } = req.body;
        if (!title || !department || !location || !type || !description) {
            const careers = readCareersFile();
            const job = careers.find(c => c.id === req.params.id);
            return res.render('careers/admin/edit', { job, error: 'All required fields must be filled' });
        }
        const careers = readCareersFile();
        const jobIndex = careers.findIndex(c => c.id === req.params.id);
        if (jobIndex === -1) {
            return res.redirect('/careers/admin');
        }
        careers[jobIndex] = {
            ...careers[jobIndex],
            title,
            department,
            location,
            type,
            experience: experience || '',
            description,
            responsibilities: responsibilities || '',
            requirements: requirements || '',
            qualifications: qualifications || '',
            benefits: benefits || '',
            status: status || 'active',
            updatedAt: new Date().toISOString()
        };
        writeCareersFile(careers);
        res.redirect('/careers/admin');
    } catch (error) {
        console.error('Error editing job:', error);
        res.redirect('/careers/admin');
    }
});

// Delete job
router.post('/admin/delete/:id', isAdmin, (req, res) => {
    try {
        const careers = readCareersFile();
        const filteredCareers = careers.filter(c => c.id !== req.params.id);
        writeCareersFile(filteredCareers);
        res.redirect('/careers/admin');
    } catch (error) {
        console.error('Error deleting job:', error);
        res.redirect('/careers/admin');
    }
});

// View applications
router.get('/admin/applications', isAdmin, (req, res) => {
    const applications = readApplicationsFile();
    res.render('careers/admin/applications', { applications });
});

// Update application status
router.post('/admin/applications/:id/status', isAdmin, (req, res) => {
    try {
        const { status } = req.body;
        const applications = readApplicationsFile();
        const appIndex = applications.findIndex(app => app.id === req.params.id);
        if (appIndex !== -1) {
            applications[appIndex].status = status;
            applications[appIndex].updatedAt = new Date().toISOString();
            writeApplicationsFile(applications);
        }
        res.redirect('/careers/admin/applications');
    } catch (error) {
        console.error('Error updating application status:', error);
        res.redirect('/careers/admin/applications');
    }
});

// Download resume
router.get('/admin/download-resume/:filename', isAdmin, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/uploads/resumes', filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

export default router;