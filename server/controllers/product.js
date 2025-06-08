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
       console.log(req.fields);
       console.log(req.files);
        const { name, description, price, category, quantity, shipping } = 
             req.fields;
        const {photo} = req.files;
        
        //validation error
        switch (true){
             case !name.trim():
                res.json({error: " Name is required"});
            case !description.trim() || 'Rols':
                res.json({error: "Description is required"});
            case !price.trim() || 'Rols':
                res.json({error: "Price is required"});
            case !category.trim() || 'Rols':
                res.json({error: "Category is required"});
            case !quantity.trim() || 'Rols':
                res.json({error: "Quantity is required"});
            case !shipping.trim() || 'Rols':
                res.json({error: "Shipping is required"});
            case photo && photo.size > 1000000:
                res.json({error: "Image should be less than 1mb in size"});    

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
        const { name, description, price, AvailableInBulk } = req.body;

        // 1. Validate fields
        if (!name || !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (!description || !description.trim()) {
            return res.json({ error: "Description is required" });
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
        const products = await Product.find().sort({ createdAt: -1 });

        res.json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while retrieving products" });
    }
};

 // Update a product by ID
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, AvailableInBulk } = req.body;
        const { productId } = req.params;

        // Validate fields
        if (name && !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (description && !description.trim()) {
            return res.json({ error: "Description is required" });
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

 // Delete a product by ID
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

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
        });
        res.json(product);
    }
    catch (err)
    {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

// Display 6 product per page 
export const listProducts = async (req,res) =>{
    try{
       const perPage = 6;
       const page = req.params.page ? req.params.page : 1;
   
       const products = await Product.find({}).select("-photo").skip((page-1) *perPage).limit(perPage).sort({createdAt:-1});
       res.json({ products });
   
    }
   catch(err)
   {
     console.log(err)
     return res.status(400).json(err.message);
   }
   }
   
   
   // // Count all products in the database
   // export const productCount = async (req, res) => {
   //   try {
   
   //     const ProductCount = 0;
   
   //     // const count = await ProductCount.countDocuments();
   //     const count = await ProductCount.find({}).estimatedDocumentCount();
   
   //     res.json({ count });
   //   } catch (error) {
   //     res.status(500).json({ error: "An error occurred while counting products." });
   //   }
   // };
   
   // Count all products in the database
   export const productCount = async (req, res) => {
       try {
           
         const count = await Product.estimatedDocumentCount();
         res.json({ count });
   
   
       } catch (error) {
         console.error("Detailed Error:", error);
         res.status(500).json({ error: "Failed to fetch product count", details: error.message });
       }
     };
