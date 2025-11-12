// user routes are here 
import Router from 'express'
// import { getUserProfile, passwordUpdate, signin, signup } from '../controlers/signup,signin.js'
import { authmiddleware } from '../middleware/authmiddle.js'
import { createCandidate, deleteCandidate, updateCandidate } from '../controlers/Candidate.js'
import { allcandidates, voteACandidate, votecountes } from '../controlers/vote.js'

const candidateRoutes=Router()

candidateRoutes.post("/createCandidate",authmiddleware,createCandidate)
candidateRoutes.put("/updateCandidate/:candidateId",authmiddleware,updateCandidate)
candidateRoutes.delete("/deleteCandidate/:candidateId",authmiddleware,deleteCandidate)


candidateRoutes.post('/vote/:candidateId',authmiddleware,voteACandidate)
candidateRoutes.get('/vote-counts',votecountes)
candidateRoutes.get('/list',allcandidates)

export default candidateRoutes