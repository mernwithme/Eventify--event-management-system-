require('dotenv').config();
const { testSmtpConnection, sendOtpEmail } = require('../services/emailService');

const targetEmail = process.argv[2] || process.env.EMAIL_USER || process.env.SMTP_USER;

async function run() {
    console.log('====================================================');
    console.log('       Eventify SMTP Configuration Diagnostics      ');
    console.log('====================================================');
    console.log(`SMTP Host:    ${process.env.SMTP_HOST || '(Default: Gmail Service)'}`);
    console.log(`SMTP Port:    ${process.env.SMTP_PORT || '(Default: 465/587)'}`);
    console.log(`SMTP User:    ${process.env.SMTP_USER || process.env.EMAIL_USER || '(Not set in .env)'}`);
    console.log(`Password Set: ${!!(process.env.SMTP_PASS || process.env.EMAIL_PASS)}`);
    console.log('====================================================\n');

    console.log('Testing SMTP connection...');
    const conn = await testSmtpConnection();

    if (!conn.ok) {
        console.error('❌ Connection Failed:', conn.message);
        console.log('\nTip: If using Gmail, ensure 2-Step Verification is ON and generate a 16-character App Password at:');
        console.log('https://myaccount.google.com/apppasswords\n');
        process.exit(1);
    }

    console.log('✅ Connection Success:', conn.message);

    if (targetEmail) {
        const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`\nAttempting to send test OTP email to: ${targetEmail}`);
        const result = await sendOtpEmail(targetEmail, testOtp, 'Eventify Admin');

        if (result.sent) {
            console.log(`🎉 Test email sent successfully! Check inbox for OTP code: ${testOtp}`);
        } else {
            console.error('⚠️ Could not deliver test email:', result.error || 'Unknown error');
        }
    } else {
        console.log('\n(Pass an email as an argument to send a test message: node scripts/verify-smtp.js recipient@example.com)');
    }
}

run();
