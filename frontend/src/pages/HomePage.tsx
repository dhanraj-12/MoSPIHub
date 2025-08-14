import axios from "axios";
import BASE_URL from "../Config";
import { useEffect, useState } from "react";
import SurveyCom from "../components/surveycom";
import { useNavigate } from "react-router-dom";
import { ClipboardDocumentListIcon, TableCellsIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

function HomePage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/survey`);
        setSurveys(res.data.data);
      } catch (error) {
        console.error("Error fetching survey:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, []);

  const handleSurveyClick = async (surveyId) => {
    setLoading(true);
    try {
      setSelectedSurvey(surveyId);
      const res = await axios.get(`${BASE_URL}/surveytables/${surveyId}`);
      setTables(res.data.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handletableclick = (survey_table_name) => {
    navigate("/query", {
      state: { survey_table_name: survey_table_name },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-500" />
            Available Surveys
          </h1>
          {loading && (
            <div className="flex items-center text-indigo-600">
              <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          )}
        </div>

        {/* Survey list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {surveys.map((survey) => (
            <div
              key={survey._id}
              onClick={() => handleSurveyClick(survey._id)}
              className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden relative ${
                selectedSurvey === survey._id ? "ring-2 ring-indigo-400" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition-all duration-300">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <SurveyCom survey={survey} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table list */}
        {selectedSurvey && (
          <div className="mt-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
              <TableCellsIcon className="h-7 w-7 text-blue-500" />
              Tables for Selected Survey
              <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full ml-2">
                {surveys.find(s => s._id === selectedSurvey)?.survey_name || selectedSurvey}
              </span>
            </h2>

            {tables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div
                    onClick={() => handletableclick(table.survey_table_name)}
                    key={table._id}
                    className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <TableCellsIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 block">
                          {table.survey_table_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          Click to explore
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TableCellsIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tables found for this survey</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;