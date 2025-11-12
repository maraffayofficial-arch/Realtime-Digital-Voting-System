import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const jwtSecret=process.env.JWT_SECRET

export const authmiddleware=async(req,res,next)=>{
    try {
        
const auth=req.header('Authorization')
if (!auth) {
   return res.send("Token os required!") 
}

const token =auth.replace("Bearer ","")

if (!token) {
   return res.send("cannot replace bearer") 
}
const verifytoken=jwt.verify(token,jwtSecret)
if (!verifytoken) {
   return res.send("Invalid token! your are not authorized!") 
}

req.user=verifytoken
next()

    } catch (error) {
        res.status(500).json({
            message:"Something went wrong in the authmiddleware",
            error:error
        })
    }

}