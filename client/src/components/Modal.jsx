import { useState, useEffect } from 'react'

export default function Modal({ title, fields, data, onClose, onSave }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    const initial = {}
    fields.forEach(f => { initial[f.key] = data ? (data[f.key] || '') : '' })
    setForm(initial)
  }, [data, fields])

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = {}
    Object.entries(form).forEach(([k, v]) => { if (v !== '') cleaned[k] = v })
    onSave(cleaned)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl cursor-pointer">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-gray-300 text-sm font-medium mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key] || ''}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                step={f.type === 'number' ? 'any' : undefined}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition cursor-pointer">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-lg font-medium transition cursor-pointer">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
