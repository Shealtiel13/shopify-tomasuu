<<<<<<< Updated upstream
export default function DataTable({ columns, data, onEdit, onDelete, onView, emptyMessage = 'No data found' }) {
=======
import { useState, useEffect } from 'react'

const rowOptions = [5, 10, 25]

export default function DataTable({ columns, data, onEdit, onDelete, onView, emptyMessage = 'No data found' }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [data, rowsPerPage])

>>>>>>> Stashed changes
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  const totalPages = Math.ceil(data.length / rowsPerPage)
  const start = (currentPage - 1) * rowsPerPage
  const paginatedData = data.slice(start, start + rowsPerPage)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {columns.map(col => (
<<<<<<< Updated upstream
                <td key={col.key} className={`px-4 py-3 ${col.bold ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                  {col.render ? col.render(row[col.key], row) : col.mask ? '••••••••' : (row[col.key] || '')}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {onView && (
                    <button onClick={() => onView(row)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                  )}
                  <button onClick={() => onEdit(row)}
                    className="inline-flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button onClick={() => onDelete(row)}
                    className="inline-flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
=======
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{col.label}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Actions</th>
>>>>>>> Stashed changes
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 ${col.bold ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                    {col.render ? col.render(row[col.key], row) : col.mask ? '••••••••' : (row[col.key] || '')}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onView && (
                      <button onClick={() => onView(row)}
                        className="inline-flex items-center gap-1.5 bg-gray-600/20 hover:bg-gray-600 text-gray-400 hover:text-white border border-gray-500/30 hover:border-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </button>
                    )}
                    <button onClick={() => onEdit(row)}
                      className="inline-flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => onDelete(row)}
                      className="inline-flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > rowsPerPage && <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {rowOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {start + 1}–{Math.min(start + rowsPerPage, data.length)} of {data.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>}
    </div>
  )
}
