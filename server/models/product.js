import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
        unique: true,
    },
    gender: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
    },
    price: {
        type: Number,
        required: true,
        min: 2,
        
        
    },
    AvailableInBulk: {
        type: Boolean,
        default: false, // Default value
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
});

export default mongoose.model('Product', productSchema);
//creates a 'Collection' in the db called (Product)
