import express from "express";
import type { Request, Response} from "express"
import Survey_models from "../Models/Survey_models.js";


const survey_model = Survey_models.surveyModel;
const survey_table_model = Survey_models.survey_table_model
const getsurveyrouter = express.Router();
const getsurveyhandler = async (req: Request, res: Response) => {
    try {
        const surveys = await survey_model.find({});
        return res.status(200).json({ data: surveys });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
}


const getsurveytables = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        //@ts-ignore
        if (!id.match(/^[0-9a-fA-F]{24}$/))
          return res.status(400).json({ message: "Invalid table id" });
  
        const table = await survey_table_model.find({Survey_id : id});
        if (!table)
          return res.status(404).json({ message: "Survey table not found" });
  
        return res.status(200).json({ data: table });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
}

getsurveyrouter.get("/survey",getsurveyhandler);
getsurveyrouter.get("/surveytables/:id",getsurveytables);

export default getsurveyrouter