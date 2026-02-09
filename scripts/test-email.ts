
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function sendTestEmail() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ Missing RESEND_API_KEY');
        process.exit(1);
    }

    const resend = new Resend(apiKey);
    const targetEmail = 'ilagallainebenedict01380@gmail.com'; // User's email

    console.log(`📧 Attempting to send test email to: ${targetEmail}`);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Retention Hub Test <noreply@retentionhub.it.com>',
            to: [targetEmail],
            subject: 'Test Email Delivery (Verified Domain)',
            html: '<strong>It works!</strong><p>This confirms your Resend API Key and Domain are working.</p>',
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (e) {
        console.error('❌ Unexpected Error:', e);
    }
}

sendTestEmail();
