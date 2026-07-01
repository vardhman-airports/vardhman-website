// Shared admin gate for every admin panel (investors, careers, pov).
// A session is considered authenticated once a Google login has passed the
// email allowlist and set req.session.adminEmail.
export default function requireAdmin(req, res, next) {
    if (req.session?.adminEmail) return next();
    return res.redirect('/auth/login?returnTo=' + encodeURIComponent(req.originalUrl));
}
