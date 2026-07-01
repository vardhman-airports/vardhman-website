import { Router } from 'express';
import passport, { googleConfigured } from '../config/passport.js';

const router = Router();

const notConfigured = (res) =>
    res.status(503).render('admin/auth-error', {
        currentTitle: 'Login Unavailable',
        message:
            'Google sign-in is not configured on the server yet. ' +
            'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment.',
    });

// Only allow internal, non-protocol-relative redirect targets.
const safeReturnTo = (value) =>
    typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
        ? value
        : '/';

// Branded login page with the "Sign in with Google" button.
router.get('/login', (req, res) => {
    res.render('admin/login', {
        currentTitle: 'Admin Login',
        returnTo: safeReturnTo(req.query.returnTo),
    });
});

// Kick off the Google OAuth flow, carrying returnTo through the state param.
router.get('/google', (req, res, next) => {
    if (!googleConfigured) return notConfigured(res);
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: safeReturnTo(req.query.returnTo),
        session: false,
        prompt: 'select_account',
    })(req, res, next);
});

// OAuth callback: verify allowlist, then set the shared admin session.
router.get('/google/callback', (req, res, next) => {
    if (!googleConfigured) return notConfigured(res);
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err) {
            return res.status(500).render('admin/auth-error', {
                currentTitle: 'Login Error',
                message: 'Something went wrong during sign-in. Please try again.',
            });
        }
        if (!user) {
            return res.status(403).render('admin/auth-error', {
                currentTitle: 'Access Denied',
                message:
                    'This Google account is not authorized to access the admin area. ' +
                    'Please contact the administrator to be added.',
            });
        }
        req.session.adminEmail = user.email;
        const returnTo = safeReturnTo(req.query.state);
        req.session.save(() => res.redirect(returnTo));
    })(req, res, next);
});

const logout = (req, res) => {
    req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

router.post('/logout', logout);
router.get('/logout', logout);

export default router;
