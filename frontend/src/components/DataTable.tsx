function DataTable({ data }) {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
          <span>No data available</span>
        </div>
      );
    }
  
    const headers = Object.keys(data[0]);
  
    return (
      <div className="relative border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Horizontal scroll container */}
        <div className="overflow-x-auto">
          {/* Table container with max height for vertical scroll */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between">
                        <span>{header}</span>
                        {/* Optional: Add sort indicators here if needed */}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {headers.map((header) => (
                      <td
                        key={`${idx}-${header}`}
                        className="px-6 py-4 text-sm text-gray-800 max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap"
                        title={String(row[header])} // Show full text on hover
                      >
                        {row[header] !== null && row[header] !== undefined
                          ? String(row[header])
                          : <span className="text-gray-400">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Table footer with row count */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200 sticky bottom-0">
          Showing {data.length} row{data.length !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }
  
  export default DataTable;