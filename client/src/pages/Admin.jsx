import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

const sections = [
  {
    key: 'admins',
    label: 'Admin Profiles',
    endpoint: '/api/login',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'username', label: 'Username', bold: true },
      { key: 'password', label: 'Password', mask: true },
    ],
    fields: [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'password', label: 'Password', type: 'text' },
    ],
  },
  {
    key: 'customers',
    label: 'Customers',
    endpoint: '/api/customers',
    idKey: 'customer_id',
    columns: [
      { key: 'customer_id', label: 'ID' },
      { key: 'first_name', label: 'First Name', bold: true },
      { key: 'last_name', label: 'Last Name', bold: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'age', label: 'Age' },
      { key: 'birth_date', label: 'Birth Date' },
    ],
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'first_name', label: 'First Name', type: 'text' },
      { key: 'last_name', label: 'Last Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'birth_date', label: 'Birth Date', type: 'date' },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    endpoint: '/api/products',
    idKey: 'product_id',
    columns: [
      { key: 'product_id', label: 'ID' },
      { key: 'product_name', label: 'Product Name', bold: true },
      { key: 'price', label: 'Price' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
    ],
    fields: [
      { key: 'product_name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
    canAdd: true,
  },
  {
    key: 'orders',
    label: 'Orders',
    endpoint: '/api/orders',
    idKey: 'order_id',
    columns: [
      { key: 'order_id', label: 'Order ID' },
      { key: 'customer_id', label: 'Customer ID' },
      { key: 'product_id', label: 'Product ID' },
      { key: 'order_date', label: 'Order Date' },
      { key: 'total_amount', label: 'Total Amount' },
    ],
    fields: [
      { key: 'customer_id', label: 'Customer ID', type: 'number' },
      { key: 'product_id', label: 'Product ID', type: 'number' },
      { key: 'order_date', label: 'Order Date', type: 'date' },
      { key: 'total_amount', label: 'Total Amount', type: 'number' },
    ],
  },
]

export default function Admin() {
  const [data, setData] = useState({ admins: [], customers: [], products: [], orders: [] })
  const [modal, setModal] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') {
      navigate('/dashboard')
    }
  }, [])

  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.all(
        sections.map(s => fetch(s.endpoint, { headers }))
      )
      if (results.some(r => r.status === 401 || r.status === 403)) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      const [admins, customers, products, orders] = await Promise.all(
        results.map(r => r.json())
      )
      setData({ admins, customers, products, orders })
    } catch {
      setData({ admins: [], customers: [], products: [], orders: [] })
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleAdd = (section) => {
    setModal({ section, data: null, type: 'add' })
  }

  const handleEdit = (section, row) => {
    setModal({ section, data: row, type: 'edit' })
  }

  const handleSave = async (formData) => {
    const { section, type } = modal
    try {
      if (type === 'add') {
        await fetch(section.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        })
        notify(section.label.slice(0, -1) + ' created successfully')
      } else {
        const id = modal.data[section.idKey]
        await fetch(section.endpoint + '/' + id, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(formData),
        })
        notify(section.label.slice(0, -1) + ' updated successfully')
      }
      setModal(null)
      loadAll()
    } catch {
      notify('Something went wrong', 'error')
    }
  }

  const handleDelete = async (section, row) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    const id = row[section.idKey]
    try {
      await fetch(section.endpoint + '/' + id, { method: 'DELETE', headers })
      notify('Deleted successfully')
      loadAll()
    } catch {
      notify('Failed to delete', 'error')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Nexus<span className="text-blue-500">Hub</span></h1>
            <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, <span className="text-white font-medium">{localStorage.getItem('username') || 'Admin'}</span></span>
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Notification */}
        {notification && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-green-500/20 border border-green-500 text-green-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Admin Profiles</p>
            <p className="text-3xl font-bold text-white mt-1">{data.admins.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Customers</p>
            <p className="text-3xl font-bold text-white mt-1">{data.customers.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-white mt-1">{data.products.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-white mt-1">{data.orders.length}</p>
          </div>
        </div>

        {/* All Tables */}
        {sections.map(section => (
          <div key={section.key}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{section.label}</h2>
              {section.canAdd && (
                <button onClick={() => handleAdd(section)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer">
                  + Add {section.label.slice(0, -1)}
                </button>
              )}
            </div>
            <DataTable
              columns={section.columns}
              data={data[section.key]}
              onEdit={(row) => handleEdit(section, row)}
              onDelete={(row) => handleDelete(section, row)}
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={(modal.type === 'edit' ? 'Edit ' : 'Add ') + modal.section.label.slice(0, -1)}
          fields={modal.section.fields}
          data={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
