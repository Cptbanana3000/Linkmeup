import { connectToDb } from '../index.js';

export async function createUser(userData) {
    const db = await connectToDb();
    return db.collection('users').insertOne(userData);
}

export async function findUserByEmail(email) {
    const db = await connectToDb();
    return db.collection('users').findOne({ email: email.toLowerCase() });
}

export async function findUserByUsername(username) {
    const db = await connectToDb();
    return db.collection('users').findOne({ username: username.toLowerCase() });
}

export async function findUserByVerificationToken(token) {
    const db = await connectToDb();
    return db.collection('users').findOne({ verificationToken: token });
}

export async function verifyUser(userId) {
    const db = await connectToDb();
    return db.collection('users').updateOne(
        { _id: userId },
        { 
            $set: { 
                verified: true,
                verificationToken: null,
                updatedAt: new Date()
            }
        }
    );
}

export async function updateUserPassword(userId, hashedPassword) {
    const db = await connectToDb();
    return db.collection('users').updateOne(
        { _id: userId },
        { 
            $set: { 
                password: hashedPassword,
                updatedAt: new Date()
            }
        }
    );
} 