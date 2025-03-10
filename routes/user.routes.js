import {Router} from "express";
import { 
    register,
    verifyUser
 } 
    from "../controllers/user.controller.js";


const router = Router();

router.post("/register",register);
router.get("/verify/:token",verifyUser);

export default router