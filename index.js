import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import FileStore from 'session-file-store';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from "cors";

import productsRouter from './routes/products.routes.js'
import aboutRouter from './routes/about.routes.js'
import solutionsRouter from './routes/solutions.routes.js'
import newsRouter from './routes/news.routes.js'
import contactRouter from './routes/contact.routes.js'
import careersRouter from './routes/careers.routes.js'
import searchRouter from './routes/search.routes.js'
// import METARRouter from './routes/METAR.routes.js'
import homeRouter from './routes/home.routes.js'
import povRouter from './routes/pov.routes.js'

const PORT = process.env.PORT || 4444;
const app = express();
app.set('trust proxy', 1);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create session directory with better error handling
const sessionDir = path.join(__dirname, 'out/sessions');
try {
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    console.log('Session directory created:', sessionDir);
  }

  // Test write permissions
  const testFile = path.join(sessionDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('Session directory is writable');
} catch (error) {
  console.error('Error creating or accessing session directory:', error);
  console.log('Falling back to memory store...');
}



const fileStore = FileStore(session);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: (req) => req.path === '/health' // Skip rate limiting for health checks
});

// Redirect www → non-www (canonicalization)
app.use((req, res, next) => {
  if (req.hostname === 'www.vardhmanairports.com') {
    return res.redirect(301, `https://vardhmanairports.com${req.url}`);
  }
  next();
});

app.use(cors());
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
          "https://ajax.googleapis.com",
          "https://code.jquery.com",
          "https://widgets.sociablekit.com",
          "https://elfsightcdn.com",
          "https://*.elfsightcdn.com",
          "https://static.elfsight.com",
          "https://*.elfsight.com",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com"
        ],
        scriptSrcAttr: ["'unsafe-inline'"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
          "https://widgets.sociablekit.com",
          "https://elfsightcdn.com",
          "https://static.elfsight.com"
        ],

        fontSrc: [
          "'self'",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com",
          "https://fonts.gstatic.com",
          "data:"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "http:",
          "https://storage.elfsight.com"
        ],

        connectSrc: [
          "'self'",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com",
          "https://widgets.sociablekit.com",
          "https://data.accentapi.com",
          "https://elfsightcdn.com",
          "https://static.elfsight.com",
          "https://core.service.elfsight.com",
          "https://widget-data.service.elfsight.com",
          "https://storage.elfsight.com",
          "https://*.service.elfsight.com",
          "https://*.elfsight.com",
          "https://api.sociablekit.com",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com"
        ],

        frameSrc: [
          "'self'",
          "https://elfsightcdn.com",
          "https://static.elfsight.com",
          "https://*.elfsightcdn.com",
          "https://*.elfsight.com",
          "https://www.google.com",
          "https://open.spotify.com",
          "https://www.youtube.com",
          "https://youtu.be"
        ],

        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        childSrc: [
          "'self'",
          "https://elfsightcdn.com",
          "https://static.elfsight.com",
          "https://*.elfsightcdn.com",
          "https://*.elfsight.com"
        ]
      }
    }
  })
);



app.use(limiter);

// Transparently serve .webp to browsers that support it.
// Falls back to the original .jpg/.png automatically — no template changes needed.
// Non-tech staff can drop any image format; if they run the converter bat file the
// WebP version is picked up here on the next request with no further action required.
app.use((req, res, next) => {
  if (/^\/images\/.+\.(jpe?g|png)$/i.test(req.path)) {
    const accept = req.headers['accept'] || '';
    if (accept.includes('image/webp')) {
      const webpPath = req.path.replace(/\.(jpe?g|png)$/i, '.webp');
      if (fs.existsSync(path.join(__dirname, 'public', webpPath))) {
        req.url = webpPath;
      }
    }
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));

// mount the blog API with higher limits so posts aren't rejected
app.use(
  '/api',
  express.json({ limit: '5mb' }),
  express.urlencoded({ extended: true, limit: '5mb' })
);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Configure session with fallback to memory store
let sessionStore;
try {
  sessionStore = new fileStore({
    path: sessionDir, // Use the actual path variable
    ttl: 86400, // 1 day
    retries: 0, // Don't retry failed operations
    logFn: function () { } // Disable logging
  });
} catch (error) {
  console.error('Failed to initialize file store, using memory store:', error);
  sessionStore = undefined; // Will use default memory store
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'vardhman-secret-key',
  resave: false,
  saveUninitialized: false,
  store: process.env.NODE_ENV === 'production' ? undefined : sessionStore, // Use memory store in production
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Also add a root health check in case that's what's being used
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.use("/", homeRouter);
app.use("/about", aboutRouter);
app.use("/solutions", solutionsRouter);
app.use("/news", newsRouter);
app.use("/careers", careersRouter);
app.use("/contact", contactRouter);
app.use("/search", searchRouter);
// app.use("/metar",METARRouter);
app.use("/pov", povRouter);
app.use("/", productsRouter);

// 404 handler — must be after all routes
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
