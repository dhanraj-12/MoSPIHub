import axios from "axios";
import BASE_URL from "../Config";
import { useEffect, useState } from "react";
import SurveyCom from "../components/surveycom";
import { ClipboardDocumentListIcon, TableCellsIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

type Survey = {
  _id: string;
  survey_name: string;
};

type TableItem = {
  _id: string;
  survey_table_name: string;
};

function SurveyPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
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

  const handleSurveyClick = async (surveyId: String) => {
    setLoading(true);
    try {
      //@ts-ignore
      setSelectedSurvey(surveyId);
      const res = await axios.get(`${BASE_URL}/surveytables/${surveyId}`);
      setTables(res.data.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handletableclick = (survey_table_name: any) => {
    navigate("/query-processing", {
      state: { survey_table_name: survey_table_name },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800/80 backdrop-blur-md p-3 rounded-xl border border-gray-700">
              <ClipboardDocumentListIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Available Surveys</h1>
              <p className="text-gray-400 text-sm mt-1">Select a survey to view its data tables</p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center text-gray-100 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
              <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
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
              className={`bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                selectedSurvey === survey._id ? "ring-2 ring-gray-400 border-gray-500" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg transition-colors duration-300 ${
                  selectedSurvey === survey._id ? "bg-gray-700" : "bg-gray-700/50 group-hover:bg-gray-700"
                }`}>
                  <ClipboardDocumentListIcon className={`h-6 w-6 ${
                    selectedSurvey === survey._id ? "text-white " : "text-white"
                  }`} />
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
          <div className="mt-8 bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 p-2 rounded-lg border border-gray-600">
                  <TableCellsIcon className="h-6 w-6 text-gray-100" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">Data Tables</h2>
                  <p className="text-gray-400 text-sm">
                    {surveys.find(s => s._id === selectedSurvey)?.survey_name || selectedSurvey}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-700 text-gray-300 rounded border border-gray-600">
                {tables.length} table{tables.length !== 1 ? 's' : ''}
              </span>
            </div>

            {tables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div
                    onClick={() => handletableclick(table.survey_table_name)}
                    key={table._id}
                    className="p-4 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600 hover:border-gray-400 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-600 p-2 rounded-lg border border-gray-500 group-hover:border-gray-400 transition-colors">
                        <TableCellsIcon className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-100 block truncate">
                          {table.survey_table_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          Click to explore data
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-700/30 rounded-lg border border-gray-600">
                <TableCellsIcon className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400 font-medium">No tables available</p>
                <p className="text-gray-500 text-sm mt-1">This survey doesn't contain any data tables</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveyPage;