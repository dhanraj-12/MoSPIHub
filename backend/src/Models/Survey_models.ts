import mongoose, { Mongoose, Schema } from "mongoose";

const surveyschema = new Schema({
    survey_name: String,
})

const Surveytable = new Schema({
    survey_table_name : String,
    Survey_id : mongoose.Types.ObjectId
})

const surveyModel = mongoose.model("survey",surveyschema);
const survey_table_model = mongoose.model("survey_table",Surveytable);
export default {
    surveyModel,
    survey_table_model
}