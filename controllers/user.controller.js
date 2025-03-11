import User from "../model/user.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const register = async (req, res) => {
    // algo to create a user
    // get data
    // validate data
    // if already present then send message
    // if not then creata user 
    // create verification token
    // send token as email to user
    // send success to user

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }

    try {
        const isUserAlreadyExists = await User.findOne({ email });
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        const newUser = await User.create({ name, email, password });
        console.log("User: ", newUser)
        if (!newUser) {
            return res.status(400).json({ message: "User not registered" })
        }

        const token = crypto.randomBytes(32).toString("hex");
        console.log("token: ", token)

        newUser.verificationToken = token;

        await newUser.save();

        // sending email

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD
            },
        });

        const mailOptions = {
            from: process.env.MAILTRAP_SENDERMAIL,
            to: newUser.email,
            subject: "Verify your email",
            text: `Please click on the following link:
            ${process.env.BASE_URI}/api/v1/users/verify/${token}
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "User registered successfully"
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "User not registered successfully",
            error: error.message
        })
    }
}

const verifyUser = async (req, res) => {
    // get token from url
    // validate 
    // find user based on token
    // if found then set isVerified to true
    // remove verification token
    // save
    // return response

    const { token } = req.params;
    console.log("token: ", token)
    if (!token) {
        return res.status(400).json({ messsage: "Invalid Token" })
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        return res.status(400).json({ messsage: "Invalid Token" })
    }

    user.isVerified = true;
    user.verificationToken = undefined; // undefined bhi kr skte hai
    await user.save();

    res.status(200).json({
        status: true,
        message: "User Verified Successfully"
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "email and password required" })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password " })

        }

        const isMatched = await bcrypt.compare(password, user.password);
        console.log(isMatched)

        if (!isMatched) {
            return res.status(400).json({ message: "Invalid email or password " })
        }

        const token = jwt.sign({ id: user._id },
            process.env.JWTSECRET,
            {
                expiresIn: process.env.JWTEXPIRY
            }
        )

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        }
        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            success: true,
            message: "Login Succesfull",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error in While logging",
            error: error.message
        })
    }
}

const logout = async (req, res) => {
    try {
        // first when user call logout hum cookie remove kr denge
        // uske liye cookie hum req me se milegi

        

        const options = {
            httpOnly:true,
            secure:true
         }
        res
        .status(200)
        .clearCookie("token",options)
        .json({
            status: true,
            message: "User Logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Logout Failed",
            error
        })
    }





}

export { register, verifyUser, login, logout }