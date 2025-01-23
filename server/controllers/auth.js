import { response } from 'express';
import User from '../models/user.js';
import { hashPassowrd, comparePassowrd } from '../helpers/auth.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
    try{
        //destructure name, email password from req.body
        const { name, email, password} = req.body;
        //2. all fields require validation
        if(!name.trim())
        {
            return res.json({error: "Name is required"});
        }
        if(!email)
        {
            return res.json({error: "Email is taken"});
        }
        if(!password || password.length < 6){
            return res.json({error: "Password must be at least 6 characters long"});
        }
        //3. check if email is taken
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({error:"Email is already taken"})
        }
        //4. hash password
        const hashedPassword = await hashPassowrd(password);
        //5. register user
        const user = await new User({
            name, 
            email, 
            password: hashedPassword
        }).save();
        //6. create signed jwt
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });


        //7. send response
        res.json({
            message: "Registration successful!",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
            },
            token,
        });

    }
    catch(err){
        console.error(err);
        res.json({ error: "Something went wrong. Please try again later." });
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
    }

};

export const login = async (req, res) => {
    try{
        //destructure name, email password from req.body
        const { email, password} = req.body;
        //2. all fields require validation
    
        if(!email)
        {
            return res.json({error: "Email is taken"});
        }
        if(!password || password.length < 6){
            return res.json({error: "Password must be at least 6 characters long"});
        }
        //3. check if email is taken
        const user = await User.findOne({email});
        if(!user){
            return res.json({error:"User not found"})
        }
        //4. compare password
        const match = await comparePassowrd(password, user.password);
        if(!match){
            return res.json({error: "wrong password"});
        }
        //5. create signed jwt
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET ||
            'aJh9dLpEqF8nResBVUCjNwAywLGz4D79dm8ReqTYaVZKRqWtPhVpKmTwd9D8BMCHEGjdJuRHph8tskPfm64xvNezH3cWd2nLXKeqkS98auBMvF', {
            expiresIn: "7d"
        });


        //7. send response
        res.json({
            message: "Registration successful!",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
            },
            token,
        });
            
    }
    catch(err){
        console.log(err);
    }

};

export const secret = async (req, res)  => {
        res.json({currentUser: req.user});
};

