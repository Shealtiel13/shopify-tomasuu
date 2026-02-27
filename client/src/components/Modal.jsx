import { useState, useEffect } from 'react'

export default function Modal({ title, fields, data, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const initial = {}
    fields.forEach(f => {
      if (f.type === 'file') {
        initial[f.key] = null
      } else {
        initial[f.key] = data ? (data[f.key] || '') : ''
      }
    })
    setForm(initial)
    // Show existing image as preview when editing
    if (data) {
      const fileField = fields.find(f => f.type === 'file')
      if (fileField && data[fileField.key]) {
        setPreview(data[fileField.key])
      } else {
        setPreview(null)
      }
    } else {
      setPreview(null)
    }
  }, [data, fields])

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = {}
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null) cleaned[k] = v
    })
    onSave(cleaned)
  }

  const handleFileChange = (key, file) => {
    setForm({ ...form, [key]: file })
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl cursor-pointer">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{f.label}</label>
              {f.type === 'file' ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(f.key, e.target.files[0])}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:text-sm file:cursor-pointer"
                  />
                  {preview && (
                    <img src={preview} alt="Preview" className="mt-2 rounded-lg max-h-32 object-contain" />
                  )}
                </div>
              ) : (
                <input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  step={f.type === 'number' ? 'any' : undefined}
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition cursor-pointer">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white py-2.5 rounded-lg font-medium transition cursor-pointer">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
