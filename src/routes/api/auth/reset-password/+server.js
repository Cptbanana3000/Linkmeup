import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { findUserByResetToken, updateUser } from '$lib/db/models/user.js';
import { resetPasswordLimiter } from '$lib/utils/rateLimiter.js';

// Password validation function
function validatePassword(password) {
    const requirements = {
        minLength: 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const errors = [];

    if (password.length < requirements.minLength) {
        errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }
    if (!requirements.hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!requirements.hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!requirements.hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!requirements.hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export async function POST({ request }) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return json({ 
                message: 'Token and password are required' 
            }, { status: 400 });
        }

        // Rate limiting check
        const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = `reset-password:${clientIp}:${token}`;

        if (!resetPasswordLimiter.checkLimit(rateLimitKey, 5)) { // 5 attempts per 5 minutes
            const timeRemaining = Math.ceil(resetPasswordLimiter.getTimeRemaining(rateLimitKey) / 1000);
            return json({ 
                message: `Too many attempts. Please try again in ${timeRemaining} seconds.` 
            }, { status: 429 });
        }

        // Validate password
        const { isValid, errors } = validatePassword(password);
        if (!isValid) {
            return json({ 
                message: 'Invalid password',
                errors 
            }, { status: 400 });
        }

        // Find user with valid reset token
        const user = await findUserByResetToken(token);
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return json({ 
                message: 'Invalid or expired reset token' 
            }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password and clear reset token
        await updateUser(user._id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        });

        return json({ success: true });

    } catch (error) {
        console.error('Reset password error:', error);
        return json({ 
            message: 'An error occurred while resetting your password' 
        }, { status: 500 });
    }
} 