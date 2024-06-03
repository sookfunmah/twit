import User from '../models/userModel.js'
import jwt from "jsonwebtoken"


export const protectRoute =async (req,res,next)=>{
    try {
        //Get token from cookies
        const token =req.cookies.jwt
        if(!token){
            return res.status(401).json({error:"Unauthorized:No token Provided"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        //Check for invalid cookies
        if(!decoded){
            return res.status(401).json({error:"Unathorized: Invalid Token"})
        }

        //Send to frontend except password field
        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(401).json({error : "User not found"})
        }

        req.user = user
        next()
    } catch (error) {

        console.log("Error in protectRoute middleware", error.message)
        return res.status(500).json({error : "Internal Sever Error"})
        
    }
}