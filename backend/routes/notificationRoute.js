import  express  from "express";
import { protectRoute }  from "../middleware/protectRoute.js";
import { getNotifications, deleteNotifications , deleteOneNotification } from "../controllers/notificationController.js";

const router = express.Router()

// ROUTES
router.get("/", protectRoute, getNotifications)
router.delete("/", protectRoute, deleteNotifications)
router.delete("/:id", protectRoute, deleteOneNotification)


export default router