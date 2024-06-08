import User from "../models/userModel.js"
import Notification from "../models/notificationModel.js"

import {v2 as cloudinary} from "cloudinary"
import bcrypt from "bcryptjs"

/////////////////////////////////////////////////////////
///                   GET USER PROFILE                ///
/////////////////////////////////////////////////////////

export const  getUserProfile = async (req, res)=>{
const {username} = req.params
try {
    const user = await User.findOne({username}).select("-password")
    if(!user){
        return res.status(400).json({message:"User Not Found"})

    }
    res.status(200).json(user)
} catch (error) {
    console.log("Error in getUserProfile", error.message);
    res.status(500).json({error : error.message})
}
}



/////////////////////////////////////////////////////////
///                   GET USER FOLLOWERs              ///
/////////////////////////////////////////////////////////

export const followUnfollow = async(req,res)=>{
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id)

        //Check - cannot follow/ unfollow self
        if (id === req.user._id.toString()){
            return res.status(400).json({error : "You can't follow / unfollow yourself"})
        }
        
        if ( !userToModify || !currentUser) {
            return res.status(400).json({error : "User not found"})
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //Unfollow the user
            await User.findByIdAndUpdate(id, {$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $pull :{following: id }})
            //return the id of the user as a response
            res.status(200).json({message:"User unfollowed successfully"})

        }else{

            //follow the user
            await User.findByIdAndUpdate(id, {$push:{followers : req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$push:{following :id}})

            //send notification to user
            const newNotification = new Notification({
                type: "follow",
                from:req.user._id,
                to : userToModify._id
            })
            
            await newNotification.save()

            //return the id of the user as a response
            res.status(200).json({message:"User followed successfully"})
        }


    } catch (error) {
        console.log("Error in followUnfollow", error.message);
        res.status(500).json({error : error.message}) 
    }
}


/////////////////////////////////////////////////////////
///                   GET SUGGESTED USERS             ///
/////////////////////////////////////////////////////////

export const getSuggestedUsers = async (req,res)=>{
    try {
        //excludes me and other following users
        const userId = req.user._id
        const usersFollowedbyMe = await User.findById(userId).select("following")
        const users = await User.aggregate([
            {
                $match:{
                    //find 10 user that is not equal to userId
                    _id:{$ne:userId},
                },
            },
            {   $sample : {size:10}}
        ])

        //filter out users that already followed by me, there will be lesser than 10 users left,and only selct 4
        const filteredUsers = users.filter (user=> !usersFollowedbyMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,4)

        //set password to null without changing database
        suggestedUsers.forEach(user=>user.password=null)
        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log("Error in getSuggestedUser", error.message)
        res.status(500).json({error: error.message})
    }
}


/////////////////////////////////////////////////////////
///                   UPDATE USER PROFILE              ///
/////////////////////////////////////////////////////////

export const updateUser = async (req,res)=>{

    const {fullname,email,username,currentPassword,newPassword,bio,link} = req.body;
    let {profileImg, coverImg} = req.body;
    const userId = req.user._id;

    try {

        let user = await User.findById(userId)
        
        if (!user) {
            return res.status(400).json ({message: "User not found"})
        }

        //Check for newPassword and currentPassword exist? 
        if((!newPassword && currentPassword)|| (newPassword) &&(!currentPassword)){
            return res.status(400).json({error:"Please provide both current and new password"})
        }

        //If there is currentPassword and newPassword present with password length more than 6 char
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({error: "Current password is incorrect"})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error :" Password must be at least 6 characters" })
            }

            //Hash the password 
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt)
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;

        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }

        //Update all the user profiles if the there are changes
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        //Save the data, and return response except password = null
        user = await user.save();
        user.password = null
        return res.status(200).json(user)


    } catch (error) {
        console.log("Error in updateUser", error.message)
        res.status(500).json({error: error.message})
    }
}
