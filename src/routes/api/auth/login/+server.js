import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '$lib/db/models/user.js';
import { generateToken } from '$lib/utils/auth.js';

export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return json({
                errors: {
                    general: 'All fields are required'
                }
            }, { status: 400 });
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return json({
                errors: {
                    general: 'Invalid credentials'
                }
            }, { status: 401 });
        }

        // Check if user is verified
        if (!user.verified) {
            return json({
                errors: {
                    general: 'Please verify your email before logging in'
                }
            }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return json({
                errors: {
                    general: 'Invalid credentials'
                }
            }, { status: 401 });
        }

        // Generate token with the actual user ID
        const token = generateToken(user._id);

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