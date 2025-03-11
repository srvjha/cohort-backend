import {Router} from "express";
import { 
    register,
    verifyUser,
    login,
    logout
 } 
    from "../controllers/user.controller.js";


const router = Router();

router.post("/register",register);
router.get("/verify/:token",verifyUser);
router.post("/login",login);
router.get("/logout",logout);

export default router