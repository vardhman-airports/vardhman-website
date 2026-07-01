import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Service-role client so the allowlist lookup is not restricted by RLS.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const CALLBACK_URL =
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4444/auth/google/callback';

// Only register the strategy when credentials are present, so the app still
// boots (public site + non-admin routes) before Google OAuth is configured.
export const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (googleConfigured) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value?.toLowerCase();

                    // Reject if Google didn't give us a verified email.
                    if (!email || profile._json?.email_verified === false) {
                        return done(null, false, { message: 'no_verified_email' });
                    }

                    // Only allow emails present in the admin_allowlist table.
                    const { data, error } = await supabase
                        .from('admin_allowlist')
                        .select('email')
                        .eq('email', email)
                        .maybeSingle();

                    if (error) return done(error);
                    if (!data) return done(null, false, { message: 'not_allowed' });

                    return done(null, { email });
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
} else {
    console.warn(
        '[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google sign-in is disabled until they are configured in .env.'
    );
}

export default passport;
