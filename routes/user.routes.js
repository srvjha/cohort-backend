import {Router} from "express";
import { register,verifyUser,login,logout,forgotPassword,resetPassword,changePassword,getMe,refreshAccessToken } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router  = Router();

router.post("/register",register);
router.get("/verify-user/:token",verifyUser);
router.post("/login",login);
router.get("/profile",isLoggedIn,getMe);
router.get("/logout",isLoggedIn,logout);
router.post("/forgot-password",isLoggedIn,forgotPassword);
router.post("/reset-password/:token",isLoggedIn,resetPassword);
router.post("/change-password",isLoggedIn,changePassword);
router.get("/refresh-token",refreshAccessToken)


export default router;