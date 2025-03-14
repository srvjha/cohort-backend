import {Router} from "express";
import { 
    register,
    verifyUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
 } 
    from "../controllers/user.controller.js";


const router = Router();

router.post("/register",register);
router.get("/verify/:token",verifyUser);
router.post("/login",login);
router.get("/logout",logout);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);
router.post("/change-password",changePassword);

export default router