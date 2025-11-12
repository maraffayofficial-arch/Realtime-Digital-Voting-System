
import candidateModel from "../models/candidate.js"
import userModel from "../models/user.js"



const checkVoter = async (userId) => {
    const user = await userModel.findById(userId)
    return user.role === 'voter'
}

export const voteACandidate = async (req, res) => {

    try {

        const isVoter = await checkVoter(req.user.userId)
        if (!isVoter) {
            return res.status(403).json({
                message: 'Only voter can vote!'
            })
        }
        const voter = await userModel.findById(req.user.userId)

        if (voter.isvoted === true) {
            return res.status(400).json({
                message: 'You have already voted.You can only vote once!'
            })
        }
   


        // updating candidate vote 
        const candidateId = req.params.candidateId

        const candidate = await candidateModel.findById(candidateId)
        if (!candidate) {
            return res.status(404).json({
                message: "No such candidate!"
            })
        }


        candidate.votes.push({ voter: req.user.userId, voteTime: new Date() })
        candidate.votecounts = candidate.votes.length
        await candidate.save()


        // updating voter's vote 
        voter.isvoted = true
        await voter.save()

        return res.status(200).json({
            message: "Your Vote is Recorded!",
        })

    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong!',
            error: error.message
        })
    }

}




export const allcandidates = async (req, res) => {
    try {
        const candidates = await candidateModel.find()

        const candidateDetails = candidates.map(candidate => ({
            name: candidate.name,
            party: candidate.party,
            candidateId: candidate._id,
        })
        )
        return res.status(200).json({
            message: "Voting candidates",
            candidateDetails
        })
    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
        })

    }
}
export const votecountes = async (req, res) => {

    try {
        const candidates = await candidateModel.find().sort({ votecounts: -1 })

        const candidateDetails = candidates.map(candidate => ({
            name: candidate.name,
            candidateId: candidate._id,
            party: candidate.party,
            votecounts: candidate.votecounts
        })
        )

        return res.status(200).json({
            message: "Voting race",
            candidateDetails
        })

    } catch (error) {

        return res.status(500).json({
            message: "something went wrong",
        })
    }
}