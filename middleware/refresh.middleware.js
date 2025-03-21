import jwt from "jsonwebtoken"
export const refreshExpiredAccessToken = async(req,res,next)=>{

    const accessToken = req.cookies?.accessToken;
    if(!accessToken){
        console.log("No token")
        return res.status(401).json({
            success:false,
            message:"Unauthorized Request"
        })
     }
        console.log("accessToken: ",accessToken)
        const verifyToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
       

     try {
        
     } catch (error) {
        
     }
}

