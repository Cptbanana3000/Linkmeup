import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserByUsername } from '$lib/db/models/user.js';
import { generateVerificationToken } from '$lib/utils/auth.js';
import { sendVerificationEmail } from '$lib/utils/email.js';

export async function POST({ request }) {
    try {
        const data = await request.json();
        const { username, email, password } = data;

        // Validate input
        if (!username || !email || !password) {
            return json({
                errors: {
                    general: 'All fields are required'
                }
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return json({
                errors: {
                    email: 'Invalid email format'
                }
            }, { status: 400 });
        }

        // Check if user already exists
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return json({
                errors: {
                    email: 'Email already registered'
                }
            }, { status: 400 });
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return json({
                errors: {
                    username: 'Username already taken'
                }
            }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const userData = {
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            verificationToken,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: {
                displayName: username,
                bio: '',
                avatar: '',
                coverImage: ''
            }
        };

        await createUser(userData);
        await sendVerificationEmail(email, verificationToken);

        return json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return json({
            errors: {
                general: 'An error occurred during registration'
            }
        }, { status: 500 });
    }
} 