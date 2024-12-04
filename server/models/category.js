import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
        unique: true,
    },
    class: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxLength: 32,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
});

export default mongoose.model('Category', categorySchema);