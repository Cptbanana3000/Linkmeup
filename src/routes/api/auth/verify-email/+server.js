import { json } from '@sveltejs/kit';
import { findUserByVerificationToken, verifyUser } from '$lib/db/models/user.js';

export async function POST({ request }) {
    try {
        const { token } = await request.json();

        if (!token) {
            return json({
                message: 'Verification token is required'
            }, { status: 400 });
        }

        const user = await findUserByVerificationToken(token);

        if (!user) {
            return json({
                message: 'Invalid verification token'
            }, { status: 400 });
        }

        if (user.verified) {
            return json({
                message: 'Email already verified'
            }, { status: 400 });
        }

        await verifyUser(user._id);

        return json({
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Verification error:', error);
        return json({
            message: 'An error occurred during verification'
        }, { status: 500 });
    }
} 