import mongoose from "mongoose";
import brcypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:String
    },
    resetPasswordToken:{
        type:String
    }, 
    resetPasswordExpiry:{
        type:Date
    },
    refreshToken:{
        type:String
    }
},{
    timestamps:true,
})

// activity pe kaam karana ko hooks khete hai kuch krna hai jb password pe kuch modification hota hai

userSchema.pre("save",async function(next){
  // next matlab aage badho idhr ka kaam ho gya 
  if(this.isModified("password")){
    this.password = await brcypt.hash(this.password,10)
  }

  next();
})
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

userSchema.methods.generateRefreshToken =  function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

const User = mongoose.model("User",userSchema)

export default User;