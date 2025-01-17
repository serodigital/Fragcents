import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxLength: 160,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxLength: 2000,
    },
    
    price: {
        type: Number,
        trim:true,
        required: true,
        min: 2,  
    },
    
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    // Category will link with Category via the Object Id
    category: {
        type: ObjectId,
        ref: "Category",
        required: true,
    },
    // To manage inventory
    quantity: {
        type: Number,     
    },
    //show how many have been sold
    sold: {
        type: Number,
        default: 0,
    },
    //save photo as binary in mango DB , lets consider s3 bucket
    photo: {
        data: Buffer,
        contentType: String,
    },
    //if shipping is required
    shipping: {
        required: false,
        type: Boolean
    },
  },
  { timestamps: true } // adding a time stamp
);

export default mongoose.model('Product', productSchema);
//creates a 'Collection' in the db called (Product)
