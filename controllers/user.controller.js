import User from "../model/user.model.js";
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId)=>{
  try {
    const user = await User.findById(userId);  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}
  } catch (error) {
    console.log("Error: ",error)
    return res.status(500).json({
      success:false,
      message:"Internal Server Down"
    })
  }
}
const register = async(req,res)=>{
  // get data 
  // validation
  // check if data already present in db or not
  // if not
  // create user
  // verification token
  // send token as email to user
  // send success message
  console.log(req.body)
  const{name,email,password} = req.body;
  
  if(!name || !email ||!password){
    return res.status(400).json({
        message:"All fields are required!!"
    })
  }

  try {
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            message:"User already exists"
        })
    }

    const user = await User.create({name,email,password});
    if(!user){
        return res.status(400).json({
            message:"Error occurred while creating "
        })
    }

    const token = crypto.randomBytes(32).toString("hex");
    console.log("token: ",token);
    user.verificationToken = token;
    await user.save();
    // token 
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, 
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto; background-color: #f9f9f9;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p style="color: #555;">Please click the button below to verify your email and access your account.</p>
          <a href="http://localhost:5173/verify/${token}" 
             style="display: inline-block; padding: 12px 24px; color: white; background-color: #007bff; 
                    text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 10px;">
            Verify Email
          </a>
         
        </div>
      `
    }; 

    await transporter.sendMail(mailOptions)

    res.status(200).json({
        status:true,
        message:"User created successfully!"
    })

  } catch (error) {
    console.log("Error: ",error);
    res.status(500).json({
        success:false,
        message:"User not registered successfully",
        error:error.message
    })
  }

}

const verifyUser = async(req,res)=>{
  // get token from url 
  // validation
  // find user based on token
  // if found isVerifed ko true kr denge
  // remove verification token 
  // save
  // success reponse

  const {token} = req.params;
  if(!token){
    return res.status(400).json({
      message:"Invalid Token"
    })
  }
  const user = await User.findOne({verificationToken:token});
  if(!user){
    return res.status(400).json({
      message:"Invalid Token"
    })
  }
  
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({
    status:true,
    message:"User Verified Successfully!!!"
  })
}

const login = async(req,res)=>{
  try{
   // get data
   // validation
   // get user data
   // password match
   // generate token
   // token ko cookie me store karenge
   // success message

   const {email,password} = req.body;
   if(!email || !password){
    return res.status(400).json({
      success:false,
      message:"email and password"
    })
  }
    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid email or password"
      })
    }

    if(!user.isVerified){
      return res.status(400).json({
        success:false,
        message:"User is not verified"
      })
    }

    const isMatched = await bcrypt.compare(password,user.password)
    console.log("isMatched: ",isMatched);

    if(!isMatched){
      return res.status(400).json({
        message:"Invalid Credentials !!!"
      })
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user?._id);
    const cookieOption = {
      httpOnly:true,
      secure:true,
      maxAge:24 * 60 * 60 * 1000
    }

    res
    .cookie("accessToken",accessToken,cookieOption)
    .cookie("refreshToken",refreshToken,cookieOption)
    .status(200)
    .json({
      success:true,
      message:"User Login Successfull"
    })  
  }catch(error){
    return res.status(500).json({
      success:false,
      message:"Internal Server Down"
    })
  }
}

const getMe = async (req, res) => {
  try {
    console.log("AA gye idhr");
    console.log(req.user);
    
    const user = await User.findById(req.user.id).select("-password");
    console.log("user: ", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User Profile fetched successfully!!!",
    });

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const logout = async(req,res)=>{
  try {
    const user = req?.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    console.log("user: ",user)

    const userDetails = await User.findById(user?._id);
    if(!userDetails){
      return res.status(400).json({
        success: false,
        message: "User details not found",
      });
    }
    // will have to clear the cookie in order to logout
     console.log("Cookies: ",req.headers)
    if(!req.headers.cookie){
      return res.status(400).json({
        success:false,
        message:"Not Logged In"
      })
    }

    userDetails.refreshToken = undefined
    await userDetails.save()
    res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json({
      success:true,
      message:"User Logged out successfully !!"
    })
  } catch (error) {
    console.log("Error: ",error);
    return res.status(500).json({
      success:false,
      message:"Internal Server Down",
      error:error.message,
    })
  }
}

const forgotPassword = async(req,res)=>{
  // get email
  // now get user
  // generate reset token and expiry date
  // send mail
  // success message

 try {
   const {email} = req.body;
   if(!email){
     return res.status(400).json({
       message:"Email is required"
     })
   }
   const user  = await User.findOne({email});
   
 
   if(!user){
     return res.status(400).json({
       message:"User not found"
     })
   }
 
   const token = crypto.randomBytes(32).toString("hex");
 
   user.resetPasswordToken = token;
   user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000
 
   await user.save();
 
   const transporter = nodemailer.createTransport({
     host: process.env.MAILTRAP_HOST,
     port: process.env.MAILTRAP_PORT,
     secure: false, 
     auth: {
       user: process.env.MAILTRAP_USERNAME,
       pass: process.env.MAILTRAP_PASSWORD,
     },
   });
 
   const mailOptions = {
     from:process.env.MAILTRAP_SENDERMAIL,
     to: user.email,
     subject: "Reset your Password", 
     text: `Please click on the link ${process.env.BASE_URI}/api/v1/users/reset-password/${token}`, 
   }
 
   await transporter.sendMail(mailOptions)
 
   return res.status(200).json({
     message:"Reset Link Successfully!!"
   })
 }
  catch (error) {
  console.log("error: ",error)
  return res.status(500).json({
    message:"Internal Server Down!!",
    error:error.message
  })
 }
}

const resetPassword = async(req,res)=>{
  try {
    const {token} = req.params;
    const {password} = req.body;
    console.log("token: ",token)
    if(!token){
      return res.status(400).json({
        success:true,
        message:"Invalid Token",
      })
    }

    if(!password){
      return res.status(400).json({
        success:true,
        message:"Please enter password",
      })
    }

    const user = await User.findOne({
      resetPasswordToken:token,
      resetPasswordExpiry:{
        $gt:Date.now()
      }
    })

    if(!user){
      
        return res.status(400).json({
          success:true,
          message:"User not found!!",
        })
      
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message:"Password reset succesfully"
    })
  } catch (error) {
    console.log("Error: ",error);
    return res.status(500).json({
      success:false,
      message:"Internal Server Down",
      error:error.message,
    })
  }
}

const changePassword = async(req,res)=>{
 try {
   const {oldPassword,newPassword} = req.body;
   const {token} = req.cookies;
 
   const decodeToken = jwt.verify(token,process.env.JWTSECRET);
   const {id} = decodeToken;
 
   const user  = await User.findById(id);
   if(!user){
     return res.status(400).json({
       success:true,
       message:"User not found!!",
     })
   }
 
   const isMatched = await bcrypt.compare(oldPassword,user.password);
   if(!isMatched){
     return res.status(400).json({
       success:true,
       message:"Password not matched!!",
     })
   }
 
   user.password = newPassword;
   await user.save();
   return res.status(200).json({
     message:"Password changed succesfully"
   })
 } catch (error) {
  console.log("Error: ",error);
  return res.status(500).json({
    success:false,
    message:"Internal Server Down",
    error:error.message,
  })
 }
}

const refreshAccessToken = async(req,res)=>{
 
  const incomingRefreshToken = req.cookies.refreshToken;
  // console.log("incomingRefreshToken: ",incomingRefreshToken)
  if(!incomingRefreshToken){
    return res.status(400).json({
      success:false,
      message:"Unauthorized Request"
    })
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    // console.log("decodedToken: ",decodedToken)
    const user = await User.findById(decodedToken?._id);
    // console.log("user: ",user)
    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid Refresh Token"
      })
    }

    if(incomingRefreshToken !== user.refreshToken){
      return res.status(400).json({
        success:false,
        message:"Refresh Token Expired "
      })
    }
    const options = {
      httpOnly:true,
      secure:true,
      maxAge:  24 * 60 * 60 * 1000
     }
   
     const{accessToken,refreshToken:newRefreshToken}= await generateAccessAndRefreshToken(user._id)
   
      res
      .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json({
      success:true,
      message:"Token refreshed successfully."
     })
     
     return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
  
    console.log("Error refreshing token: ", error);
    return res.status(500)
    .json({
      success:true,
      message:"Internal Server Error.",
      error:error.message
     })
  }
}

export {register,verifyUser,login,logout,forgotPassword,resetPassword,changePassword,getMe,refreshAccessToken}