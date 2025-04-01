import jwt from "jsonwebtoken"

export const isLoggedIn = async (req, res, next) => {
   try {
    //  console.log(req.cookies);
     let token = req.cookies?.accessToken;
    //  console.log({ token });
 
     if (!token) {
       console.log("No token");
       return res.status(401).json({
         success: false,
         message: "Unauthorized Request",
       });
     }
       // Verify access token
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      //  console.log("Decoded Token: ", decodedToken);
       req.user = decodedToken; 
       return next();
     
   } catch (error) {
     console.log("Auth middleware error: ", error);
     return res.status(500).json({
       success: false,
       message: "Internal server down",
       error: error.message,
     });
   }
 };