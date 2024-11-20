import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { findUserByEmail, updateUser } from '$lib/db/models/user.js';
import { sendPasswordResetEmail } from '$lib/utils/email.js';
import { forgotPasswordLimiter } from '$lib/utils/rateLimiter.js';

export async function POST({ request }) {
    try {
        const { email } = await request.json();

        if (!email) {
            return json({ message: 'Email is required' }, { status: 400 });
        }

        // Rate limiting check
        const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = `forgot-password:${clientIp}:${email.toLowerCase()}`;

        if (!forgotPasswordLimiter.checkLimit(rateLimitKey)) {
            const timeRemaining = Math.ceil(forgotPasswordLimiter.getTimeRemaining(rateLimitKey) / 1000);
            return json({ 
                message: `Too many requests. Please try again in ${timeRemaining} seconds.` 
            }, { status: 429 });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            // For security reasons, we still return success even if the email doesn't exist
            return json({ success: true });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Update user with reset token
        await updateUser(user._id, {
            resetToken,
            resetTokenExpiry
        });

        // Send reset email
        await sendPasswordResetEmail(email, resetToken);

        return json({ success: true });

    } catch (error) {
        console.error('Forgot password error:', error);
        return json({ 
            message: 'An error occurred while processing your request' 
        }, { status: 500 });
    }
} 