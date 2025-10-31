type Survey = {
  _id: string;
  survey_name: string;
};

type SurveyComProps = {
  survey: Survey;
};
  
  function SurveyCom({ survey }: SurveyComProps) {
    return <div className="text-white" >{survey.survey_name}</div>;
  }

  export default SurveyCom;
