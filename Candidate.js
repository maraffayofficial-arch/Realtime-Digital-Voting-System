import candidateModel from "../models/candidate.js"
import userModel from "../models/user.js"


const checkAdmin=async(userId)=>{
const user=await userModel.findById(userId)
return user.role==='admin'
}

export const createCandidate=async(req,res)=>{
    console.log("before creating object")
try {
   
    const isAdmin= await checkAdmin(req.user.userId)
if (!isAdmin) {
    return res.status(403).json({
message:'Not an admin!'
    })
}
const data =req.body
const candidate= new candidateModel(data)

console.log("after creating object")
await candidate.save()

return res.status(201).json({
message:"candidate created.",
candidate
})

} catch (error) {
 res.status(500).json({
message:'Cannot create candidate!',
error:error.message
})  
}

}

export const deleteCandidate=async(req,res)=>{
try {
   
    const isAdmin= await checkAdmin(req.user.userId)
if (!isAdmin) {
    return res.status(403).json({
message:'Not an admin!'
    })
}
const idTodelete=req.params.candidateId
const deleteCan = await candidateModel.findByIdAndDelete(idTodelete)

if (!deleteCan) {
return res.status(404).json({
message:"something went wrong...Cannot Delete Candidate.",
})    
}

return res.status(403).json({
message:"Candidate Deleted.",
})

} catch (error) {
 res.status(500).json({
message:'something went wrong!',
error:error.message
})  
}

}
export const updateCandidate=async(req,res)=>{
try {
    const isAdmin= await checkAdmin(req.user.userId)
if (!isAdmin) {
    return res.status(403).json({
message:'Not an admin!'
    })
}
const {name,age,party} =req.body
const candidateId=req.params.candidateId
const updateCan=await candidateModel.findByIdAndUpdate(candidateId,{name:name,age:age,party:party},{new:true,runValidators:true})

if (!updateCan) {
return res.status(404).json({
message:"Something went wrong...Cannot update Candidate ."
})    
}
return res.status(201).json({
message:"Candidate updated.",
updateCan
})

} catch (error) {
 res.status(500).json({
message:'something went wrong',
error:error.message
})  
}

}


