import Notification from "../models/notificationModel.js"

////////////////////////////////////////////
//            GET Notifications           //
////////////////////////////////////////////

export const getNotifications = async (req,res) =>{
    try {
        const userId = req.user._id
        //Find notification that matches the userId
        const notifications = await Notification.find({ to:userId})
        .populate({
            //show the user and the profileImg that liked our profile
            path : "from",                          
            select : "username profileImg"
        })

        //update the notification to be read
        await Notification.updateMany({to:userId},{read:true})
        res.status(200).json(notifications)

    } catch (error) {
        console.log("Error in getNotification Controller: ", error.message)
        res.status(500).json({error: "Internal Server Error"})
    }
}




////////////////////////////////////////////
//            DELETE All Notifications    //
////////////////////////////////////////////

export const deleteNotifications = async (req,res) =>{
    
    try {
        const userId = req.user._id
        await Notification.deleteMany({to:userId})
        res.status(200).json({message:"All notifications deleted successfully"})
        
    } catch (error) {
        console.log("Error in deleteNotification Controller: ", error.message)
        res.status(500).json({error: "Internal Server Error"}) 
    }
}



////////////////////////////////////////////
//            DELETE ONE Notification    //
////////////////////////////////////////////

export const deleteOneNotification = async(req,res) =>{
    try{

        //Get notificationId, userId and check the notification exist in Database
        const notificationId = req.params.id
        const userId = req.user._id
        const notification = await Notification.findById(notificationId)


        if(!notification){
            return res.status(404).json({error: "Notification not found"})
        }

        //Check if notification belong to user
        if(notification.to.toString() !== userId.toString())
        return res.status(403).json({ error: " You are not alloweed to delete this notification"})

        //Delete notification from database
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({message : "Notification deleted succssfully"})


    }catch(error){
        console.log("Error in deleteOneNotification Controller: ", error.message)
        res.status(500).json({error: "Internal Server Error"}) 
    }
}