import { expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { User } from '$lib/db/models/user.js';

let mongoServer;

// Mock user for testing
export const testUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com'
};

// Create JWT token for test user
export const testToken = jwt.sign(
    { userId: testUser._id, username: testUser.username },
    process.env.JWT_SECRET
);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    
    // Create test user in DB
    await User.create(testUser);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}); 