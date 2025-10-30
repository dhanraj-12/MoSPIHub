import express from "express";
import type  { Request, Response } from "express"
import Survey_models from "../Models/Survey_models.js";

const Surveys = Survey_models.surveyModel;

const CreateSurvey = express.Router();

const CreateSurveyHandler = async (req: Request, res: Response) => {
    try {
        const surveyname = req.body.surveyname;

        if (!surveyname) {
            return res.status(400).json({
                message: "Survey name can't be empty"
            });
        }

        const newsurvey = await Surveys.create({
            survey_name: surveyname
        });

        return res.status(200).json({
            message: "Survey Created Successfully",
            surveyId : newsurvey._id
        });

    } catch (e: any) {
        console.error(e, "This is the error message");
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message
        });
    }
};

CreateSurvey.post("/createsurvey", CreateSurveyHandler);

export default CreateSurvey;
