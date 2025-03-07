import jwt from "jsonwebtoken";
import User from "../models/user.js";

const JWT_SECRET = 'aJh9dLpEqF8nResBVUCjNwAywLGz4D79dm8ReqTYaVZKRqWtPhVpKmTwd9D8BMCHEGjdJuRHph8tskPfm64xvNezH3cWd2nLXKeqkS98auBMvF';

export const requireSignIn = (req,res,next) => {
    try{
        const decoded = jwt.verify(
            req.headers.authorization, 
            JWT_SECRET
        );
        // console.log("decoded => ", decoded);
        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(401).json(err);
    }
};

export const isAdmin = async (req,res, next) => {
    try{
        const user = await User.findById(req.user._id);
        if(user.role !== 1){
            return res.status(401).send("Unauthorized User is not admin");
        }
        else{
            next();
        }

    }catch(err){
        console.log(err);
    }
};