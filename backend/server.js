import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import {v2 as cloudinary} from "cloudinary"
import path from "path"

import authRoutes from "./routes/authRoute.js"
import usersRoutes from "./routes/usersRoute.js"
import postRoutes from "./routes/postRoute.js"
import connectMongoDB from "./db/connectMongoDB.js";
import notificationRoutes from "./routes/notificationRoute.js"

dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve()

app.use(express.json({limit:"5mb"}));                        //to parse req.body
app.use(express.urlencoded({ extended:true }))  // to parse formdata urlencoded
app.use(cookieParser())


//ROUTES
app.use("/api/auth", authRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/notifications", notificationRoutes)


if( process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")))
}

app.get("*", (req,res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
})

app.listen (PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
    connectMongoDB()
})

// test route
app.get("/test", (req, res) => {
    res.send("Server is running");
});

