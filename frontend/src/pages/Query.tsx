import { useState} from "react";
import type { KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Config";
import DataTable from "../components/DataTable";
import JsonViewer from "../components/Jsonviewer";
import { TableCellsIcon, CodeBracketIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

type LocationState = { survey_table_name?: string };
type TableData = Record<string, any>[]; // array of objects for table rendering

function Query() {
  const location = useLocation() as { state?: LocationState };
  const { survey_table_name } = location.state || {};

  const [query, setQuery] = useState<string>("");
  const [tableData, setTableData] = useState<TableData>([]);
  const [view, setView] = useState<"table" | "json">("table");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<TableData>(`${BASE_URL}/resolve`, {
        query,
        survey: survey_table_name,
      });
      console.log(res.data);
      setTableData(res.data || []);
    } catch (err: any) {
      console.error("Error processing query:", err);
      setError(err.response?.data?.message || "An error occurred while processing your query");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      processQuery();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-800/80 backdrop-blur-md p-2 rounded-lg border border-gray-700">
              <TableCellsIcon className="h-6 w-6 text-gray-100" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Query Interface</h1>
              <p className="text-gray-400 text-sm">Execute SQL queries on your survey data</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-300 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700 w-max">
            <span className="font-medium">Current table:</span>
            <span className="ml-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-medium border border-gray-600">
              {survey_table_name || "Not specified"}
            </span>
          </div>
        </div>

        {/* Query Input */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter your SQL query (use ${survey_table_name} as table name)`}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all bg-gray-800/70 backdrop-blur-sm text-gray-100 placeholder-gray-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={processQuery}
              disabled={loading || !query.trim()}
              className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all min-w-[140px] ${
                loading || !query.trim()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-600"
                  : "bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-600 hover:border-gray-500"
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
            <div className="mt-3 text-red-300 bg-red-900/30 px-4 py-3 rounded-lg text-sm border border-red-800/50">
              {error}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex border border-gray-600 rounded-lg w-max overflow-hidden bg-gray-800/70 backdrop-blur-sm">
            <button
              onClick={() => setView("table")}
              className={`px-5 py-2.5 font-medium flex items-center gap-2 transition-all ${
                view === "table" ? "bg-gray-700 text-gray-100" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <TableCellsIcon className="h-5 w-5" />
              Table View
            </button>
            <button
              onClick={() => setView("json")}
              className={`px-5 py-2.5 font-medium flex items-center gap-2 transition-all ${
                view === "json" ? "bg-gray-700 text-gray-100" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <CodeBracketIcon className="h-5 w-5" />
              JSON View
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          {tableData.length > 0 ? (
            view === "table" ? (
              <DataTable data={tableData} />
            ) : (
              <JsonViewer data={tableData} />
            )
          ) : (
            <div className="p-16 text-center text-gray-400">
              <div className="bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                <TableCellsIcon className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-300 font-medium mb-2">No data to display</p>
              <p className="text-gray-500 text-sm">Enter a query and click "Execute Query" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Query;