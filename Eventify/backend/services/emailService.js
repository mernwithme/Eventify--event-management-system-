const nodemailer = require('nodemailer');

/**
 * Creates and returns a configured Nodemailer transporter
 * Supports:
 * 1. Custom SMTP Server (Host, Port, Secure, User, Pass)
 * 2. Gmail SMTP Service (EMAIL_USER + EMAIL_PASS or App Password)
 */
const createTransporter = () => {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    // Custom SMTP Configuration (e.g. Mailtrap, SendGrid, Brevo, AWS SES, custom host)
    if (process.env.SMTP_HOST) {
        const port = parseInt(process.env.SMTP_PORT || '587', 10);
        const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure: isSecure,
            auth: {
                user,
                pass
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });
    }

    // Default: Gmail Service
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass
        }
    });
};

/**
 * Test SMTP connection readiness
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
const testSmtpConnection = async () => {
    const transporter = createTransporter();
    if (!transporter) {
        return {
            ok: false,
            message: 'SMTP credentials missing. Please set EMAIL_USER & EMAIL_PASS (or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) in .env'
        };
    }

    try {
        await transporter.verify();
        return {
            ok: true,
            message: 'SMTP server is ready to deliver messages.'
        };
    } catch (error) {
        return {
            ok: false,
            message: error.message
        };
    }
};

/**
 * Sends a 6-digit OTP verification email for login
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit numerical code
 * @param {string} [name='User'] - User's display name
 * @returns {Promise<{ sent: boolean, devMode?: boolean, error?: string }>}
 */
const sendOtpEmail = async (email, otp, name = 'User') => {
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

    const subject = '🔐 Your Eventify Login Verification Code';
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; border-radius: 12px; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #1e3a8a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Eventify</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 6px; font-weight: 500;">Secure Login Verification</p>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 0; margin-bottom: 8px;">Hello ${name},</p>
                <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                    We received a request to log in to your Eventify account. Please use the verification code below to complete your sign in:
                </p>
                
                <div style="text-align: center; margin: 28px 0;">
                    <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #1e3a8a; border-radius: 8px; padding: 16px 32px;">
                        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e3a8a;">${otp}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin-top: 10px; margin-bottom: 0;">
                        ⏱️ This code will expire in <strong>10 minutes</strong>.
                    </p>
                </div>

                <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                        <strong>Security Note:</strong> Never share this OTP with anyone. If you did not attempt to log in to Eventify, please ignore this email or update your password to secure your account.
                    </p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Eventify. All rights reserved.
            </div>
        </div>
    `;

    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"Eventify Security" <${fromAddress}>`,
                to: email,
                subject,
                html
            });
            console.log(`[Eventify Auth] ✅ OTP successfully sent via SMTP to ${email}`);
            return { sent: true };
        } catch (err) {
            console.error(`[Eventify Auth] ⚠️ Failed to deliver OTP email to ${email}:`, err.message);
            console.log(`[Eventify Auth] 🔑 Fallback OTP for ${email}: ${otp}`);
            return { sent: false, error: err.message };
        }
    } else {
        console.log(`[Eventify Auth] ℹ️ SMTP not configured in .env (EMAIL_USER / EMAIL_PASS missing)`);
        console.log(`[Eventify Auth] 🔑 DEV MODE OTP for ${email}: ${otp}`);
        return { sent: false, devMode: true };
    }
};

module.exports = {
    createTransporter,
    sendOtpEmail,
    testSmtpConnection
};
