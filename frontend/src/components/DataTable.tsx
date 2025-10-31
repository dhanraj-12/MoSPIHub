type DataTableProps = {
  data: Record<string, unknown>[]; // array of objects with string keys
};

function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="bg-gray-700/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-gray-300 font-medium">No data available</span>
        </div>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="relative border border-gray-700 rounded-lg shadow-lg overflow-hidden bg-gray-800/30 backdrop-blur-sm">
      {/* Horizontal scroll container */}
      <div className="overflow-x-auto">
        {/* Table container with max height for vertical scroll */}
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap border-r border-gray-700 last:border-r-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{header}</span>
                      {/* Optional: Add sort indicators here if needed */}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800/20 divide-y divide-gray-700">
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-700/30 transition-colors duration-150 group"
                >
                  {headers.map((header) => (
                    <td
                      key={`${idx}-${header}`}
                      className="px-6 py-4 text-sm text-gray-200 max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap border-r border-gray-700/50 last:border-r-0 group-hover:bg-gray-700/20 transition-colors duration-150"
                      title={String(row[header])} // Show full text on hover
                    >
                      {row[header] !== null && row[header] !== undefined
                        ? String(row[header])
                        : <span className="text-gray-500 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table footer with row count */}
      <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-3 text-xs text-gray-400 border-t border-gray-700 sticky bottom-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>Showing {data.length} row{data.length !== 1 ? 's' : ''}</span>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <span>{headers.length} column{headers.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs">Secure Data</span>
        </div>
      </div>
    </div>
  );
}

export default DataTable;