import { useState } from "react";
import { data, useLocation } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Config";
import DataTable from "../components/DataTable";
import JsonViewer from "../components/Jsonviewer";
import { TableCellsIcon, CodeBracketIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

function Query() {
  const location = useLocation();
  const { survey_table_name } = location.state || {};
  const [query, setQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [view, setView] = useState("table"); // "table" or "json"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BASE_URL}/resolve`, {
        query,
        survey: survey_table_name
      });
      console.log(res.data)
      setTableData(res.data || []);
    } catch (error) {
      console.error("Error processing query:", error);
      setError(error.response?.data?.message || "An error occurred while processing your query");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processQuery();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Query Interface</h1>
          <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
            <span className="font-medium">Current table:</span>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {survey_table_name || "Not specified"}
            </span>
          </div>
        </div>

        {/* Query Input */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter your query (use ${survey_table_name} as table name)`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={processQuery}
              disabled={loading || !query.trim()}
              className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                loading || !query.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Execute Query"
              )}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex border border-gray-200 rounded-lg w-max overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`px-5 py-2 font-medium flex items-center gap-2 transition-all ${
              view === "table" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TableCellsIcon className="h-5 w-5" />
            Table View
          </button>
          <button
            onClick={() => setView("json")}
            className={`px-5 py-2 font-medium flex items-center gap-2 transition-all ${
              view === "json" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CodeBracketIcon className="h-5 w-5" />
            JSON View
          </button>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {tableData.length > 0 ? (
            view === "table" ? (
              <DataTable data={tableData} />
            ) : (
              <JsonViewer data={tableData} />
            )
          ) : (
            <div className="p-12 text-center text-gray-500">
              <TableCellsIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p>No data to display. Enter a query and click "Execute Query" to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Query;