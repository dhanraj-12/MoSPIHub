import express from "express"
import dotenv from "dotenv"
import resolvRouter from "./Routers/resolvequery.js";
import client from "./Util/Rds.js";


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

dbconnection();

app.get("/",(req,res)=>{
    res.send("hi hell0");
    return;
})

app.use("/api",resolvRouter);

app.listen(PORT,()=>{
    console.log(`Server is listing on ${PORT}`)
})