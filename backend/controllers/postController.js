import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import {v2 as cloudinary} from "cloudinary"
import Notification from "../models/notificationModel.js"

////////////////////////////////////////////
//             CREATE POST              //
////////////////////////////////////////////
export const createPost = async (req,res)=>{

    try {
        //Get image and userId
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        // find the userId provided
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({message: "User not found" })
           
        //if no text / No image then prompt error
        if(!text && !img){
            return res.status(400).json({error: "Post must have text or image"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        //Save the newPost
        const newPost = new Post({
            user:userId,
            text,
            img
        })
        
        await newPost.save()
        res.status(201).json(newPost)

    } catch (error) {
        console.log("Error in createPost", error)
        res.status(500).json({error: "Internal Server Error"})
    }

}


////////////////////////////////////////////
//            DELETE POST                //
////////////////////////////////////////////
export const deletePost = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({error : "Post not found"})
        }

        //Check if post belongs to user
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({error : "You are not authorized to delete this post"})
        } 

        if(post.img){
            const  imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        //Delete post 
        await Post.findByIdAndDelete(req.params.id)
        res.status(201).json({message : " Post deleted succesfully"})


    } catch (error) {
       console.log("Error in DeletePost",error)
       res.status(500).json({error : "Internal Server Error "}) 
    }
}



////////////////////////////////////////////
//            COMMENT ON POST             //
////////////////////////////////////////////
export const commentOnPost = async(req,res)=>{
try {
    const {text} = req.body
    const postId = req.params.id
    const userId = req.user._id

    //Check if user input text
    if(!text) {
        return res.status(400).json({error : " Text field is required"})
    }

    //Check if post is in db
    const post = await Post.findById(postId)
    if(!post){
        return res.status(400).json({error: "Post not found"})
    }

    //push comment and save
    const comment = {user: userId,text}
    post.comments.push(comment)
    await post.save()
    res.status(200).json(post)

} catch (error) {
    console.log( "Error in CommentOnPost",error)
    res.status(400).json ({error : "Interal Server Error"})
}
}




////////////////////////////////////////////
//            LIKE /UNLIKE POST           //
////////////////////////////////////////////
export const likeUnlikePost = async(req,res)=>{

    try {
        const userId = req.user._id
        const { id:postId } = req.params

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({error : "Post not found"})
        }

        const userLikedPost = post.likes.includes(userId)

        if(userLikedPost){
            //unlike post
            await Post.updateOne({_id:postId}, { $pull:{ likes:userId }})
            await User.updateOne({_id:userId}, { $pull:{likedPosts:postId}})
            // post.likes.pull(userId);  // Modified to use pull() on post object
            //await post.save();  // Added this line to save the updated post
            res.status(200).json({message: " Post unliked successfully"})
        }else{
            // Like post
            post.likes.push(userId)
            await User.updateOne({ _id:userId }, { $push: { likedPosts:postId }})
            await post.save()

            const notification = new Notification({
                from : userId,
                to : post.user,
                type: "like"
            })
            await notification.save()
            res.status(200).json({message : "Post liked successfully"})
        }

    } catch (error) {
        console.log("Error in likeUnlike Controller", error)
        res.status(500).json({error: "Internal Server Error"})
    }

}



////////////////////////////////////////////
//            GET ALL POSTs              //
////////////////////////////////////////////

export const getAllPosts = async (req,res) =>{
    try {
        const posts = await Post.find().sort({createdAt : -1}).populate({
                path:"user",
                select:"-password",
        })
        .populate({
            path:"comments.user",
            select: "-password",
        })


        if( posts.length === 0) {
            return res.status(200).json([])
        }

        res.status(200).json(posts)
    } catch (error) {
        console.log ("Error in getAllPosts controller:", error)
        res.status (500).json({error :"Internal Server Error"})
        
    }
}


////////////////////////////////////////////
//            GET Like POSTs              //
////////////////////////////////////////////

export const getLikedPosts = async (req,res)=>{

    const userId = req.params.id

    try {
        //Find user and check if exist in database
        const user = await User.findById(userId)
        if(!user){
            return 
            res.status(404).json({error: "User not found"})
        }

        //Find all post this user has liked
        const likedPosts = await Post.find({_id:{$in:user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(likedPosts)

    } catch (error) {
        console.log("Error in getLikedPosts Controller : ", error)
        res.status(500).json({error: "Internal Server Error"})
    }
}




////////////////////////////////////////////
//            GET Following Posts          //
////////////////////////////////////////////

export const getFollowingPosts = async (req,res)=>{
    try {
        
        //Get User Id and check if exist in database
        const userId = req.user._id;
        const user =await User.findById(userId);
        if (!user){
            return 
            res.status(404).json({error : " User not found"})
        }

        const following = user.following;

        const feedPosts = await Post.find({user:{$in:following}})
            .sort({createdAt : -1})
            .populate({
                path:"user",
                select:"-password",
            })
            .populate({
                path:"comments.user",
                select:"-password"
            })

            res.status(200).json(feedPosts)
    } catch (error) {
        console.log("Error in getFollowingPosts: " ,  error)
        res.status(500).json({error: "Internal Server Error"})
        
    }
}



////////////////////////////////////////////
//            GET User's Posts            //
////////////////////////////////////////////
export const getUserPosts = async (req,res) =>{

    try {

        //Get username and check existence in database  
        const {username } = req.params;
        const user = await User.findOne({username})
        if(!user){
        return res.status(404).json({error : "User not found"})
        }

        //Find latest post of user 
        const posts = await Post.find({user:user._id}).sort({createdAt : -1})
        .populate({
            path:"user",
            select : "-password"
        })
        .populate ({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(posts)
            
    } catch (error) {
        console.log("Error in getUserPosts : ", error )
        res.status(404).json({error : " Internal Server Error"})
    }
    
}

