import  express  from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollow, getUserProfile, getSuggestedUsers, updateUser} from "../controllers/userController.js";

const router = express.Router();

router.get ("/profile/:username", protectRoute,getUserProfile)
router.get("/suggested",protectRoute, getSuggestedUsers)
router.post("/follow/:id",protectRoute,followUnfollow)
router.post("/update", protectRoute, updateUser)



export default router   