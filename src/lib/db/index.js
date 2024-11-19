import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectToDb() {
    if (db) return db;
    
    try {
        await client.connect();
        db = client.db(process.env.MONGODB_DB_NAME || 'linkmepup');
        
        // Create indexes for better performance
        await createIndexes(db);
        
        console.log('Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

async function createIndexes(db) {
    try {
        // Users collection indexes
        await db.collection('users').createIndexes([
            { key: { email: 1 }, unique: true },
            { key: { username: 1 }, unique: true },
            { key: { verificationToken: 1 }, sparse: true }
        ]);
        
        console.log('Database indexes created');
    } catch (error) {
        console.error('Error creating indexes:', error);
        throw error;
    }
}

export async function closeDbConnection() {
    try {
        await client.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        throw error;
    }
}