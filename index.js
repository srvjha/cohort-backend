// server banana hai 
// through http bhi bana skte hai but iske badle hum ek framework ka use krenge express

import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./utils/db.js";
import userRoutes from "./routes/user.routes.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
        origin:"http://localhost:3000",
        methods:["GET","POST","DELETE","OPTIONS"],
        allowedHeaders:['Content=Type',"Authorization"],
        credentials:true,
    })
);

// ab mujhe agr data json mila toh uske kese handle krenge
// json accept karwana padega

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// request ke types hote hai

app.get("/",(request,response)=>{
    response.send("Server is running")
})

app.use("/api/v1/users",userRoutes)

connectDB();

app.listen(port,()=>{
    console.log(`Server is running at port: ${port}`)
})


// backend to db baatchit krne ke liye hum mongoose ka use krte hai jo humhara kaam asaan kr deta hai
