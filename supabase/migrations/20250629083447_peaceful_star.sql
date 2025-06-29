/*
  # Configure OTP Authentication System

  1. Authentication Configuration
    - Configure email templates for OTP codes
    - Set up proper authentication flow
    - Enable OTP-based authentication
    
  2. Security Settings
    - Configure session settings
    - Set up proper redirect URLs
    - Enable secure authentication flow
*/

-- Configure authentication settings for OTP
-- This sets up the email template and authentication flow

-- First, ensure we have the proper auth configuration
-- Note: Some of these settings need to be configured in the Supabase Dashboard
-- But we can set up the database side here

-- Configure email rate limiting (allow more frequent emails for OTP)
-- This helps with OTP delivery
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_RATE_LIMIT_EMAILS_PER_MINUTE', '10')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Set OTP expiry time (10 minutes)
INSERT INTO auth.config (parameter, value) 
VALUES ('OTP_EXPIRY', '600')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure email template for OTP (this sets the template to send codes instead of links)
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_TEMPLATES_CONFIRMATION_CONTENT', 
'<h2>Confirm your signup</h2>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>Enter this code in the application to complete your signup.</p>
<p>This code will expire in 10 minutes.</p>')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure the subject line for OTP emails
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_TEMPLATES_CONFIRMATION_SUBJECT', 'Your FinanceApp Verification Code')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure magic link template (fallback)
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_TEMPLATES_MAGIC_LINK_CONTENT', 
'<h2>Magic Link</h2>
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>Or use this verification code: <strong>{{ .Token }}</strong></p>')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Set magic link subject
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_TEMPLATES_MAGIC_LINK_SUBJECT', 'Your FinanceApp Sign In Link')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure site URL for proper redirects
INSERT INTO auth.config (parameter, value) 
VALUES ('SITE_URL', 'http://localhost:5173')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Add additional allowed redirect URLs
INSERT INTO auth.config (parameter, value) 
VALUES ('ADDITIONAL_REDIRECT_URLS', 'http://localhost:5173,http://localhost:5173/dashboard,https://localhost:5173,https://localhost:5173/dashboard')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Enable email confirmations
INSERT INTO auth.config (parameter, value) 
VALUES ('ENABLE_CONFIRMATIONS', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Disable magic links in favor of OTP
INSERT INTO auth.config (parameter, value) 
VALUES ('ENABLE_MAGIC_LINK', 'false')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Enable OTP
INSERT INTO auth.config (parameter, value) 
VALUES ('ENABLE_EMAIL_OTP', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure session timeout (24 hours)
INSERT INTO auth.config (parameter, value) 
VALUES ('JWT_EXPIRY', '86400')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure refresh token expiry (30 days)
INSERT INTO auth.config (parameter, value) 
VALUES ('REFRESH_TOKEN_EXPIRY', '2592000')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Ensure proper email delivery settings
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_AUTOCONFIRM', 'false')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Set minimum password length
INSERT INTO auth.config (parameter, value) 
VALUES ('PASSWORD_MIN_LENGTH', '6')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Enable signup
INSERT INTO auth.config (parameter, value) 
VALUES ('ENABLE_SIGNUP', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configure external email provider settings (if using custom SMTP)
-- These would typically be set via environment variables, but we can set defaults
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_SECURE_EMAIL_CHANGE_ENABLED', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Set up proper CORS settings
INSERT INTO auth.config (parameter, value) 
VALUES ('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,https://localhost:5173')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;