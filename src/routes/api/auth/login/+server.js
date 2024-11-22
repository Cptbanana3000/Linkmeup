import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '$lib/db/models/user.js';
import { generateToken } from '$lib/utils/auth.js';

export async function POST({ request }) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt for:', email); // Debug log

        // Validate input
        if (!email || !password) {
            console.log('Missing credentials'); // Debug log
            return json({
                errors: {
                    general: 'All fields are required'
                }
            }, { status: 400 });
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            console.log('User not found'); // Debug log
            return json({
                errors: {
                    general: 'Invalid credentials'
                }
            }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password'); // Debug log
            return json({
                errors: {
                    general: 'Invalid credentials'
                }
            }, { status: 401 });
        }

        // Generate token
        const token = generateToken(user._id);
        console.log('Generated token for user:', user._id); // Debug log

        return json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return json({
            errors: {
                general: 'An error occurred during login'
            }
        }, { status: 500 });
    }
} 