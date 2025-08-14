import express from "express"
import mongoose from "mongoose";
import dotenv from "dotenv"
import resolvRouter from "./Routers/resolvequery.js";
import client from "./Util/Rds.js";
import surveyRouter from "./Routers/add_survey.js";

dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(express.json());


// db Connection

const dbconnection = async ()=> {
    try {

        await client.connect();
        console.log("db is connected succefully");
    }catch(e) {
        console.log("Error in connecting the db", e);
    }

}

const db_uri = process.env.MONGO_URI;
const mongoconnect = async () => {

    try {
        await mongoose.connect(db_uri)
        console.log('Connected to MongoDB successfully!')
    } catch (err) {
        console.error('Error connecting to MongoDB:', err)
    }
}

mongoconnect();

dbconnection();

app.get("/",(req,res)=>{
    res.send("hi hell0");
    return;
})

app.use("/api",resolvRouter);
app.use("/api",surveyRouter);

app.listen(PORT,()=>{
    console.log(`Server is listing on ${PORT}`)
})