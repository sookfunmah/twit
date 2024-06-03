import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/authRoutes.js"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;


app.use(express.json());        //to parse req.body
app.use(express.urlencoded({ extended:true })) // to parse formdata urlencoded
app.use(cookieParser())

app.use("/api/auth", authRoutes)


app.listen (PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
    connectMongoDB()
})

// test route
app.get("/", (req, res) => {
    res.send("Server is running");
});

