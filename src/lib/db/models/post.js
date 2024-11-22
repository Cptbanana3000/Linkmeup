import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String,
        trim: true,
        maxLength: 2200  // Instagram's limit
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaUrls: [{
        type: String
    }],
    type: {
        type: String,
        enum: ['image', 'video', 'multiple'],
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema); 