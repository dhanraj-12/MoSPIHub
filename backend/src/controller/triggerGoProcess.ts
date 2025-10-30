import RedisClient from "../Util/reddisclient.js";

const JOB_QUEUE_NAME = "csv_processing_job";


export interface jobPayload {
    jobId : string;
    s3key : string;
    tablename: string;
    surveyId: string;
}


const triggerGoProcess = async (job : jobPayload) : Promise<void> => {
    const jobMessage = JSON.stringify(job);
    try {
        const listlenght = await RedisClient.rpush(JOB_QUEUE_NAME, jobMessage);
        console.log(`Job ${job.jobId} successfully pushed to Redis queue. Queue size: ${listlenght}.`);
    }catch (error) {
        console.error(`CRITICAL: Failed to push job ${job.jobId} to Redis:`, error);
        throw new Error("Redis queuing failed. Cannot start background process.");
    }
}

export default triggerGoProcess;




