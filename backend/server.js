import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import {v2 as cloudinary} from "cloudinary"
import authRoutes from "./routes/authRoutes.js"
import usersRoutes from "./routes/usersRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const app = express();
const PORT = process.env.PORT || 8000;


app.use(express.json());        //to parse req.body
app.use(express.urlencoded({ extended:true })) // to parse formdata urlencoded
app.use(cookieParser())

//ROUTES
app.use("/api/auth", authRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/posts",postRoutes)


app.listen (PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
    connectMongoDB()
})

// test route
app.get("/", (req, res) => {
    res.send("Server is running");
});

