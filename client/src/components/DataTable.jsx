export default function DataTable({ columns, data, onEdit, onDelete, emptyMessage = 'No data found' }) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">{col.label}</th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-700/50">
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-3 ${col.bold ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {col.mask ? '••••••••' : (row[col.key] || '')}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-2">
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
  )
}
