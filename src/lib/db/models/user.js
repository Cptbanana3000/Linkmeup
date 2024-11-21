import mongoose from 'mongoose';
import { connectToDb } from '../index.js';

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: { 
        type: String,
        default: null 
    },
    bio: { 
        type: String,
        default: '',
        maxlength: [160, 'Bio cannot exceed 160 characters']
    },
    verified: { 
        type: Boolean, 
        default: false 
    },
    verificationToken: String,
    resetToken: String,
    resetTokenExpiry: Date,
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    following: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { 
    timestamps: true 
});

// Ensure connection before creating model
await connectToDb();

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Database operations using Mongoose
export async function createUser(userData) {
    return await User.create(userData);
}

export async function findUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
}

export async function findUserByUsername(username) {
    return await User.findOne({ username: username.toLowerCase() });
}

export async function findUserById(userId) {
    return await User.findById(userId);
}

export async function findUserByVerificationToken(token) {
    return await User.findOne({ verificationToken: token });
}

export async function verifyUser(userId) {
    return await User.findByIdAndUpdate(userId, {
        verified: true,
        verificationToken: null
    }, { new: true });
}

export async function updateUserPassword(userId, hashedPassword) {
    return await User.findByIdAndUpdate(userId, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
    }, { new: true });
}

export async function findUserByResetToken(resetToken) {
    return await User.findOne({
        resetToken,
        resetTokenExpiry: { $gt: Date.now() }
    });
}

export async function updateUser(userId, updates) {
    return await User.findByIdAndUpdate(userId, 
        { ...updates },
        { new: true }
    );
} 