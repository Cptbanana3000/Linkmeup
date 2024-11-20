import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
} 