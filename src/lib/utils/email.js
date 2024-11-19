import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

export async function sendVerificationEmail(email, token) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const verificationLink = `${process.env.SITE_URL}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
            from: `"LinkMeUp" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Verify your LinkMeUp account',
            html: `
                <h1>Welcome to LinkMeUp!</h1>
                <p>Please click the link below to verify your account:</p>
                <a href="${verificationLink}">${verificationLink}</a>
            `
        });

        console.log('Verification email sent:', info.messageId);
    } catch (error) {
        console.error('Email sending error:', error);
        // Don't throw the error as registration was successful
    }
} 