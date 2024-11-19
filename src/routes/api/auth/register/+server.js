import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserByUsername } from '$lib/db/models/user.js';
import { generateVerificationToken } from '$lib/utils/auth.js';
import { sendVerificationEmail } from '$lib/utils/email.js';

export async function POST({ request }) {
    try {
        const { username, email, password } = await request.json();

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

        const result = await createUser(userData);

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue with registration response as email sending is non-critical
        }

        return json({
            message: 'Registration successful. Please check your email to verify your account.',
            emailSent: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        return json({
            message: 'An error occurred during registration'
        }, { status: 500 });
    }
} 