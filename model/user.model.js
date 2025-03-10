import mongoose from "mongoose";
import brcypt from "bcryptjs"

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


const User = mongoose.model("User",userSchema)

export default User;