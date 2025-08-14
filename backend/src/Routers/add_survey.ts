import express from "express";
import type { Request, Response} from "express"
import Survey_models from "../Models/Survey_models.js";

const surveyModel = Survey_models.surveyModel;
const surveyRouter = express.Router();
const survey_table_model = Survey_models.survey_table_model;

const surveyaddhandler = async (req:Request,res:Response)=>{
    try {
        const { survey_name } = req.body;
    
        if (!survey_name?.trim()) {
          return res.status(400).json({ message: "survey_name is required" });
        }
    
        const survey = await surveyModel.create({ survey_name });
        return res.status(201).json({ message: "Survey created", data: survey });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
}

const survey_table_handler = async (req: Request, res: Response) => {
    try {
        const { survey_table_name, survey_id } = req.body;
    
        if (!survey_table_name?.trim()) {
          return res.status(400).json({ message: "survey_table_name is required" });
        }
        if (!survey_id || !survey_id.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).json({ message: "Valid survey_id is required" });
        }
    
        // Ensure the parent survey actually exists
        const parentSurvey = await surveyModel.findById(survey_id);
        if (!parentSurvey) {
          return res.status(404).json({ message: "Survey not found" });
        }
    
        const surveyTable = await survey_table_model.create({
          survey_table_name,
          Survey_id: survey_id,
        });
    
        return res
          .status(201)
          .json({ message: "Survey table created", data: surveyTable });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
}

surveyRouter.post("/addsurvey",surveyaddhandler);
surveyRouter.post("/addsurveyt",survey_table_handler);

export default surveyRouter;