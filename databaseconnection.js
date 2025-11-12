import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()
const DB_URI=process.env.DB_URI

 const connection=async()=>{
    await mongoose.connect(DB_URI)
    console.log('Connected to database')
}

// const connect = await mongoose.connect("mongodb+srv://maraffayofficial_db_user:SNOrI7Kf3G0tv9Ep@votingcluster.zypxd6q.mongodb.net/?appName=votingCluster",console.log('connected to database'))

export default connection