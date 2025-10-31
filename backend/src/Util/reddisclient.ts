import {Redis} from "ioredis"
import type {RedisOptions} from "ioredis";


const redisConfig: RedisOptions = {
    host : process.env.REDIS_HOST || "127.0.0.1",
    port : parseInt(process.env.REDIS_PORT || "6379"),
    password : process.env.REDIS_PASSWORD || undefined,

    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            return true; 
        }
        return false;
    },
}


const RedisClient = new Redis(redisConfig);

RedisClient.on("connect", () => {
    console.log("Redis client connected");
})

RedisClient.on("error", (err: any) => {
    console.error("Redis Client Error", err);
})

RedisClient.on("ready", () => {
    console.log("Redis Client is Ready to use");   
})

RedisClient.on("close", () => {
    console.log("Redis connection closed");
})


export default RedisClient;


