import type { Request, Response } from "express";
import express from "express";
import Survey_models from "../Models/Survey_models.js";
import { csvUpload } from "../middlerware/multermiddleware.js";
import uploadCsv from "../controller/UploadCSV.js"
import triggerGoProcess from "../controller/triggerGoProcess.js";

const Survey_table = Survey_models.survey_table_model;


const addTable = express.Router();

const generateJobId = (): string => {
    return `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}


const addTablehandler = async (req: Request, res: Response) => {

    const jobId = generateJobId();

    try {

        const survey_table_name = req.body.survey_table_name;
        const surveyId = req.body.surveyId;
        const file = req.file;
        if (!file) {
            res.status(400).send("No file uploaded.");
            return;
        }
        
        const filename = file.originalname;
        if (!filename) {
            res.status(400).send("No filename provided.");
            return;
        }
        
        if(!surveyId || !survey_table_name) {
            return res.status(404).json({
                message : "SurveyId or SurveyTableName is Empty"
            })
        }


        await Survey_table.create({
            survey_table_name : survey_table_name,
            Survey_id : surveyId,
        })


        
        
        const s3Key = await uploadCsv(filename,file.buffer);
        
        
        console.log("This is the s3 key",s3Key);

        console.log(`[Job ${jobId}] S3 Key generated: ${s3Key}.`);

        await triggerGoProcess({
            jobId : jobId,
            s3key : s3Key,
            tablename: survey_table_name,
            surveyId: surveyId
        });


        return res.status(200).json({
            message: "Survey Table Added Successfully",
            s3Key: s3Key,
            jobId: jobId,
            statusCheckUrl: `/api/status/${jobId}`
        })
    }catch(e: any) {
        console.error(e, "This is the error message");
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message
        });
    }   
}

addTable.post("/addtable",csvUpload.single("csvfile"),addTablehandler);
export default addTable;