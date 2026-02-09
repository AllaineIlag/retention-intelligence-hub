
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function diagnose() {
    try {
        const response = await resend.domains.list();

        if (response.error) {
            console.error('API Error:', response.error);
            return;
        }

        const data = response.data?.data || [];
        // Find first verified domain
        const verifiedDomain = data.find((d: any) => d.status === 'verified');

        if (verifiedDomain) {
            console.log(`VERIFIED_DOMAIN:${verifiedDomain.name}`);
        } else {
            console.log('NO_VERIFIED_DOMAIN_FOUND');
            console.log('Available domains:', data.map((d: any) => `${d.name} (${d.status})`).join(', '));
        }

    } catch (error) {
        console.error('❌ Script Error:', error);
    }
}

diagnose();
