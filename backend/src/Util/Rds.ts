import dotenv from "dotenv"
import { Client } from "pg";

dotenv.config();


const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.RDSPORT),
    ssl: { rejectUnauthorized: false }
};



const client = new Client(dbConfig);

export default client