import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// File paths
const POV_DATA_FILE = path.join(__dirname, '../out/pov.json');
const ADMIN_PASSWORD_FILE = path.join(__dirname, '../data/admin.json');
const UPLOADS_DIR = path.join(__dirname, '../out');

// =================== SAFE FILE HANDLER ===================
class SafeFileHandler {
  // Ensure directory exists
  async ensureDirectory(dirPath) {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Error creating directory:', error);
        throw error;
      }
    }
  }

  // Safe read with automatic file creation
  async readJSONFile(filePath, defaultData = []) {
    try {
      // Ensure the directory exists first
      await this.ensureDirectory(path.dirname(filePath));
      
      // Try to read the file
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create it with default data
        console.log(`File ${path.basename(filePath)} not found. Creating with default data.`);
        await this.writeJSONFile(filePath, defaultData);
        return defaultData;
      } else if (error instanceof SyntaxError) {
        // Invalid JSON, backup the corrupted file and create new one
        console.error(`Invalid JSON in ${path.basename(filePath)}. Creating backup and new file.`);
        const backupPath = filePath + '.backup.' + Date.now();
        try {
          await fs.promises.copyFile(filePath, backupPath);
        } catch (backupError) {
          console.error('Could not create backup:', backupError);
        }
        await this.writeJSONFile(filePath, defaultData);
        return defaultData;
      } else {
        console.error('Error reading file:', error);
        throw error;
      }
    }
  }

  // Safe write
  async writeJSONFile(filePath, data) {
    try {
      // Ensure the directory exists
      await this.ensureDirectory(path.dirname(filePath));
      
      // Write the file with pretty formatting
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  }

  // Synchronous versions for compatibility with existing code
  readJSONFileSync(filePath, defaultData = []) {
    try {
      // Ensure the directory exists first
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
      
      // Try to read the file
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      } else {
        // File doesn't exist, create it with default data
        console.log(`File ${path.basename(filePath)} not found. Creating with default data.`);
        this.writeJSONFileSync(filePath, defaultData);
        return defaultData;
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Invalid JSON, backup the corrupted file and create new one
        console.error(`Invalid JSON in ${path.basename(filePath)}. Creating backup and new file.`);
        const backupPath = filePath + '.backup.' + Date.now();
        try {
          fs.copyFileSync(filePath, backupPath);
        } catch (backupError) {
          console.error('Could not create backup:', backupError);
        }
        this.writeJSONFileSync(filePath, defaultData);
        return defaultData;
      } else {
        console.error('Error reading file:', error);
        return defaultData;
      }
    }
  }

  // Synchronous write
  writeJSONFileSync(filePath, data) {
    try {
      // Ensure the directory exists
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
      
      // Write the file with pretty formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  }
}

// Create global file handler instance
const fileHandler = new SafeFileHandler();

// Ensure directories exist on startup
try {
  fileHandler.ensureDirectory(path.dirname(POV_DATA_FILE));
  fileHandler.ensureDirectory(UPLOADS_DIR);
} catch (error) {
  console.error('Error creating directories:', error);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure directory exists
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// =================== HELPER FUNCTIONS (UPDATED) ===================
const readPOVData = () => {
    return fileHandler.readJSONFileSync(POV_DATA_FILE, []);
};

const writePOVData = (data) => {
    return fileHandler.writeJSONFileSync(POV_DATA_FILE, data);
};

const readAdminData = () => {
    try { 
        // Use safe file handler for admin data too
        const adminData = fileHandler.readJSONFileSync(ADMIN_PASSWORD_FILE, null);
        
        if (adminData === null || !adminData.password) {
            // Default admin password: use environment variable or "admin123" (hashed)
            const defaultPasswordPlain = ADMIN_PASSWORD || "admin123";
            const defaultPassword = bcrypt.hashSync(defaultPasswordPlain, 10);
            const defaultData = { password: defaultPassword };
            
            fileHandler.writeJSONFileSync(ADMIN_PASSWORD_FILE, defaultData);
            return defaultData;
        }
        
        return adminData;
    } catch (error) {
        console.error('Error reading admin data:', error);
        return null;
    }
};

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    // Check if session exists and user is admin
    if (req.session && req.session.isPOVAdmin === true) {
        return next();
    }
    
    // If session might not be fully loaded, try to reload it
    if (req.session) {
        req.session.reload((err) => {
            if (err) {
                console.error('Session reload error:', err);
            }
            
            // Check again after reload
            if (req.session && req.session.isPOVAdmin === true) {
                return next();
            }
            
            // Not authenticated, redirect to login
            res.redirect('/pov/admin/login');
        });
    } else {
        // No session at all, redirect to login
        res.redirect('/pov/admin/login');
    }
}

// =================== PUBLIC ROUTES ===================

// Display all POV posts
router.get('/', (req, res) => {
    const povPosts = readPOVData();
    res.render('pov/index', { povPosts, title: 'Point of View' });
});

// Get single POV post (for popup modal)
router.get('/post/:id', (req, res) => {
    const povPosts = readPOVData();
    const post = povPosts.find(p => p.id === req.params.id);
    
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
});

// Download PDF
router.get('/download/:id', (req, res) => {
    const povPosts = readPOVData();
    const post = povPosts.find(p => p.id === req.params.id);
    
    if (!post || !post.pdfFile) {
        return res.status(404).json({ error: 'PDF not found' });
    }
    
    const filePath = path.join(UPLOADS_DIR, post.pdfFile);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'PDF file not found' });
    }
    
    res.download(filePath, post.title + '.pdf');
});

// =================== ADMIN ROUTES ===================

// Admin login page
router.get('/admin/login', (req, res) => {
    res.render('pov/admin/login', { error: null, title: 'Admin Login' });
}); 

// Admin login process
router.post('/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const adminData = readAdminData();
        
        if (!adminData || !adminData.password) {
            return res.render('pov/admin/login', { error: 'Admin not configured', title: 'Admin Login' });
        }
        
        const match = await bcrypt.compare(password, adminData.password);
        
        if (match) {
            // Set session data
            req.session.isPOVAdmin = true;
            
            // IMPORTANT: Save the session before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.render('pov/admin/login', { error: 'Login failed. Please try again.', title: 'Admin Login' });
                }
                
                // Session is now saved, safe to redirect
                res.redirect('/pov/admin');
            });
        } else {
            res.render('pov/admin/login', { error: 'Invalid password', title: 'Admin Login' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('pov/admin/login', { error: 'An error occurred. Please try again.', title: 'Admin Login' });
    }
});

// Admin dashboard
router.get('/admin', requireAdmin, (req, res) => {
    const povPosts = readPOVData();
    res.render('pov/admin/dashboard', { povPosts, title: 'Admin Dashboard' });
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
            res.redirect('/pov');
        });
    } else {
        res.redirect('/pov');
    }
});

// Add new post page
router.get('/admin/add', requireAdmin, (req, res) => {
    res.render('pov/admin/add', { title: 'Add New Post' });
});

// Add new post
router.post('/admin/add', requireAdmin, upload.single('pdf'), (req, res) => {
    try {
        const { title, description, content, author } = req.body;
        const povPosts = readPOVData();
        
        const newPost = {
            id: Date.now().toString(),
            title: title || '',
            description: description || '',
            content: content || '',
            author: author || '',
            createdAt: new Date().toISOString(),
            pdfFile: req.file ? req.file.filename : null
        };
        
        povPosts.push(newPost);
        
        if (writePOVData(povPosts)) {
            res.redirect('/pov/admin');
        } else {
            res.render('pov/admin/add', { error: 'Error saving post', title: 'Add New Post' });
        }
    } catch (error) {
        console.error('Error adding post:', error);
        res.render('pov/admin/add', { error: 'Error saving post', title: 'Add New Post' });
    }
});

// Edit post page
router.get('/admin/edit/:id', requireAdmin, (req, res) => {
    try {
        const povPosts = readPOVData();
        const post = povPosts.find(p => p.id === req.params.id);
        
        if (!post) {
            return res.redirect('/pov/admin');
        }
        
        res.render('pov/admin/edit', { post, title: 'Edit Post' });
    } catch (error) {
        console.error('Error loading post for edit:', error);
        res.redirect('/pov/admin');
    }
});

// Update post
router.post('/admin/edit/:id', requireAdmin, upload.single('pdf'), (req, res) => {
    try {
        const { title, description, content, author } = req.body;
        const povPosts = readPOVData();
        const postIndex = povPosts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.redirect('/pov/admin');
        }
        
        const post = povPosts[postIndex];
        
        // Update post data
        post.title = title || post.title;
        post.description = description || post.description;
        post.content = content || post.content;
        post.author = author || post.author;
        post.updatedAt = new Date().toISOString();
        
        // Handle PDF file update
        if (req.file) {
            // Delete old PDF if exists
            if (post.pdfFile) {
                const oldFilePath = path.join(UPLOADS_DIR, post.pdfFile);
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (deleteError) {
                        console.warn('Could not delete old PDF:', deleteError);
                    }
                }
            }
            post.pdfFile = req.file.filename;
        }
        
        if (writePOVData(povPosts)) {
            res.redirect('/pov/admin');
        } else {
            res.render('pov/admin/edit', { post, error: 'Error updating post', title: 'Edit Post' });
        }
    } catch (error) {
        console.error('Error updating post:', error);
        const povPosts = readPOVData();
        const post = povPosts.find(p => p.id === req.params.id);
        res.render('pov/admin/edit', { post: post || {}, error: 'Error updating post', title: 'Edit Post' });
    }
});

// Delete post
router.post('/admin/delete/:id', requireAdmin, (req, res) => {
    try {
        const povPosts = readPOVData();
        const postIndex = povPosts.findIndex(p => p.id === req.params.id);
        
        if (postIndex !== -1) {
            const post = povPosts[postIndex];
            
            // Delete PDF file if exists
            if (post.pdfFile) {
                const filePath = path.join(UPLOADS_DIR, post.pdfFile);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (deleteError) {
                        console.warn('Could not delete PDF file:', deleteError);
                    }
                }
            }
            
            povPosts.splice(postIndex, 1);
            writePOVData(povPosts);
        }
        
        res.redirect('/pov/admin');
    } catch (error) {
        console.error('Error deleting post:', error);
        res.redirect('/pov/admin');
    }
});

export default router;