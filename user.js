// user routes are here 
import Router from 'express'
import { getUserProfile, passwordUpdate, signin, signup } from '../controlers/signup,signin.js'
import { authmiddleware } from '../middleware/authmiddle.js'

const routes=Router()

routes.post("/sign-up",signup)
routes.post("/sign-in",signin)

routes.get("/myprofile",authmiddleware,getUserProfile)
routes.put("/update-password",authmiddleware,passwordUpdate)


export default routes