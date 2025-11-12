// signup and signin controllers are here 
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import userModel from "../models/user.js"
import dotenv from 'dotenv'

dotenv.config()
const jwtSecret = process.env.JWT_SECRET
const jwtexpire = process.env.JWT_EXPIRES_IN

export const signup = async (req, res) => {
    try {
        const { name, email, age, cnic, password,role } = req.body

        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return console.log('User already exists!')
        }

        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt)

        const newuser = await userModel.create({ name, age, email, cnic, password: hashpassword,role })
        const token = jwt.sign({ userId: newuser._id }, jwtSecret, { expiresIn: jwtexpire })

        const userResponse = {
            id: newuser._id,
            cnic: newuser.cnic,
            email: newuser.email,
            role: newuser.role,
            token: token
        }
        return res.status(200).json({
            message: "Account created successfully",
            userResponse
        })

    } catch (error) {

        res.status(500).json({
            error: error.message,
            message: "something went wronged!",

        })


    }

}
export const signin = async (req, res) => {


    try {
        const { cnic, password } = req.body

        const existingUser = await userModel.findOne({ cnic: cnic })

        if (!existingUser) {
            console.log('User does not exists! please sign-up!')
        }

        const verifypassword = await bcrypt.compare(password, existingUser.password)
        if (!verifypassword) {
            return res.status(500).json({
                message: "Incorrect password!"
            })
        }
        const token = jwt.sign({ userId: existingUser._id }, jwtSecret, { expiresIn: jwtexpire })


        const userResponse = {
            id: existingUser._id,
            cnic: existingUser.cnic,
            email: existingUser.email,
            token
        }
        return res.status(200).json({
            message: "Logging in...",
            userResponse
        })

    } catch (error) {
        res.status(500).json({
            error: error,
            message: "something went wrong!",

        })


    }

}


// password change 

export const passwordUpdate = async (req, res) => {
    try {
const userId=req.user.userId
        const { newpassword, oldpassword } = req.body
        if(!newpassword || !oldpassword){
            return res.json({
                message:"Please provide both old and new password!"
            })
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.send("Not a user")
        }
        const verifyOldPassword = await bcrypt.compare(oldpassword, user.password)
        if (!verifyOldPassword) {
            return res.send("Wrong old password!")
        }
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(newpassword, salt)

        const userpasswordupdate = await userModel.findOneAndUpdate({ _id: userId }, { password: hashedpassword }, { new: true })
        if (!userpasswordupdate) {
            return res.status(402).json({ message: 'Could not update password!' })
        }

        const userResponse = {
            id: userpasswordupdate._id,
            cnic: userpasswordupdate.cnic,
            email: userpasswordupdate.email
        }
        return res.status(200).json({
            message: "Password updated successfully!",
            userResponse
        })
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "something went wrong!",

        })
    }
}

//get user profile or should i say user details

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId

        const user = await userModel.findById(userId).select('-password')
        if (!user) {
            return res.status(404).json({ message: "User not found!" })
        }
        res.status(200).json({
            message: "User profile fetched..",
            user

        })

    } catch (error) {
        res.status(500).json({
            message: 'something went wrong in getting user profile',
            error: message
        })
    }
}

