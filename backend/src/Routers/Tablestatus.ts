import type { Request, Response } from "express";
import express from "express";
import RedisClient from "../Util/reddisclient.js";
const statusRouter = express.Router();

const statusRouterHandler = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.jobId;
        if(!jobId) {
            return res.status(400).json({ message: "Job ID is required." });
        }
        const STATUS_HASH_KEY = process.env.STATUS_HASH_KEY;
        if (!STATUS_HASH_KEY) {
            return res.status(500).json({ message: "Status hash key not configured." });
        }
        const statusjson = await RedisClient.hget(STATUS_HASH_KEY, jobId);

        return res.status(200).json({
            jobId: jobId,
            status: statusjson ? JSON.parse(statusjson) : null
        })
    }catch(e) {
        console.error("Error fetching job status:", e);
        return res.status(500).json({ message: "Internal server error." });
    }
}

statusRouter.get("/status/:jobId", statusRouterHandler);
export default statusRouter;