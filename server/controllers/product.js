import Product from '../models/product.js';
import dotenv from 'dotenv';
import slugify from "slugify";
import fs from 'fs'; // reading files

dotenv.config();

 //Create a new product
 // because we uploading photo we can only use form data not json
 //additional middleware
export const create = async (req, res) =>{
    try{
    //    console.log(req.fields);
    //    console.log(req.files);
        const { name, description, price, category, quantity, shipping } = 
             req.fields;
        const {photo} = req.files;
        
        //validation error
        switch (true){
             case !name.trim():
                return res.json({error: " Name is required"});
            case !description.trim():
                return res.json({error: "Description is required"});
            case !price.trim() :
                return res.json({error: "Price is required"});
            case !category.trim():
                return res.json({error: "Category is required"});
            case !quantity.trim():
                return res.json({error: "Quantity is required"});
            case !shipping.trim():
                return res.json({error: "Shipping is required"});
            case photo && photo.size > 1000000:
                return res.json({error: "Image should be less than 1mb in size"});    

         }

         //create product
         const product = new Product({...req.fields, slug: slugify(name)});// getting all the fields

         if(photo){
            product.photo.data = fs.readFileSync(photo.path); // read the file path
            product.photo.contentType = photo.type; //read the photo type
         } // photo is not mandotary
         await product.save();
         res.json(product);
    } catch (err){
        console.log(err);
        return res.status(400).json(err.message);
    }
} 
export const createProduct = async (req, res) => {
    try {
        // Destructure fields from req.body
        const { name, description, gender, price, AvailableInBulk } = req.body;

        // 1. Validate fields
        if (!name || !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (!description || !description.trim()) {
            return res.json({ error: "Description is required" });
        }
        if (!gender || !gender.trim()) {
            return res.json({ error: "Gender is required" });
        }
        if (typeof price !== 'number' || price <= 0) {
            return res.json({ error: "Price must be a positive number" });
        }
        if (typeof AvailableInBulk !== 'boolean' && AvailableInBulk !== undefined) {
            return res.json({ error: "must provide if product is available or Not" });
        }

        // 2. Check if product name & description already exists
        const existingProduct = await Product.findOne({ name,description });
        if (existingProduct & description) {
            return res.json({ error: "Product name and description already exists" });
        }

        // 3. Generate slug
        const slug = name.toLowerCase().replace(/ /g, '-');

        // 4. Save product
        const product = await new Product({
            name,
            description,
            gender,
            price,
            slug: slugify(name),
            AvailableInBulk: AvailableInBulk || false, // Default to false if not provided
        }).save();

        // 5. Send response
        res.json(product);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while creating the product" });
    }
};

 //Retrieve all products
export const getAllProducts = async (req, res) => {
    try {
        // Fetch all products
        const products = await Product.find({})
            .populate("category")
            .select("-photo")
            .limit(12)
            .sort({ createdAt: -1});

        res.json( products );
    } catch (err) {
        console.error(err);
    }
};

 // Update a product by ID
export const updateProduct = async (req, res) => {
    try {
        const { name, description, gender, price, AvailableInBulk } = req.body;
        const { productId } = req.params;

        // Validate fields
        if (name && !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (description && !description.trim()) {
            return res.json({ error: "Description is required" });
        }
        if (gender && !gender.trim()) {
            return res.json({ error: "Gender is required" });
        }
        if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
            return res.json({ error: "Price must be a positive number" });
        }
        if (AvailableInBulk !== undefined && typeof AvailableInBulk !== 'boolean') {
            return res.json({ error: "must provide if product is available or Not" });
        }

        // Find product by ID and update fields
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { 
                name,
                description,
                gender,
                price,
                slug: name ? slugify(name) : undefined,
                AvailableInBulk,
            },
            { new: true }
        );
        res.json(updatedProduct);

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "An error occurred while updating the product" });
    }
};

export const update = async (req, res) =>{
    try{
       
        const { name, description, price, category, quantity, shipping } = 
             req.fields;
        const {photo} = req.files;
        
        //validation error
        switch (true){
             case !name.trim():
                res.json({error: " Name is required"});
            case !description.trim() :
                res.json({error: "Description is required"});
            case !price.trim() :
                res.json({error: "Price is required"});
            case !category.trim() :
                res.json({error: "Category is required"});
            case !quantity.trim() :
                res.json({error: "Quantity is required"});
            case !shipping.trim() :
                res.json({error: "Shipping is required"});
            case photo && photo.size > 1000000:
                res.json({error: "Image should be less than 1mb in size"});    

         }

         //update product
         const product = await Product.findOneAndUpdate(req.params.productId,{...req.fields,slug: slugify(name),}, {new: true}
        );

         if(photo){
            product.photo.data = fs.readFileSync(photo.path); // read the file path
            product.photo.contentType = photo.type; //read the photo type
         } // photo is not mandotary
         await product.save();
         res.json(product);
    } catch (err){
        console.log(err);
        return res.status(400).json(err.message);
    }
} 

 // Delete a product by ID
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId).select("-photo");

        if (!deletedProduct) {
            return res.json({ error: "Product not found" });
        }

        res.json(deletedProduct);

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while deleting the product" });
    }
};

export const read = async (req, res) => {
    try{
        const product = await Product.findOne({
            slug: req.params.slug
        })
        .select('-photo')
        .populate("category");
        res.json(product);
    }
    catch (err)
    {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

export const photo = async (req, res) => {
    try{
        const product = await Product.findById(req.params.productId).select("photo");
        
        if(product.photo.data){
            res.set("Content-Type", product.photo.contentType);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            return res.send(product.photo.data);
        }
        else {
            return res.status(404).json({ message: "No photo found for this product" });
        }
    }catch(err){
        console.log(err);
    }
}

export const list = async (req,res) => {
    try{
         const products = await Product.find({}).populate("category").select("-photo").limit(12).sort({ createdAt: -1});
         res.json(products);   
    }catch(err){
        console.log(err)
    }
};

export const filteredProducts = async (req,res) => {
    try{
        const {checked, radio} = req.body;

        let args = {};
        if(checked.length > 0) args.category = checked;
        if(radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

        console.log('args =>', args);

        const products = await Product.find(args);
        console.log("filtered product query =>", products.legnth);

        res.json(products);

    } catch (err){
        console.log(err);
    }
}

