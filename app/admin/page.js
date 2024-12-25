'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState('')
  const [category, setCategory] = useState('')
  const [availableColors, setAvailableColors] = useState('')
  const [availableSizes, setAvailableSizes] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [sortOrder, setSortOrder] = useState('desc')
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.email !== 'admin@example.com') {
      router.push('/')
    } else {
      fetchProducts()
      fetchOrders()
    }
  }, [session, status, router])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to fetch products. Please try again.')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to fetch orders. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const productData = {
      name,
      price: parseFloat(price),
      description,
      images: images.split(',').map(url => url.trim()),
      category,
      availableColors: availableColors.split(',').map(color => color.trim()),
      availableSizes: availableSizes.split(',').map(size => size.trim()),
      published: false
    }
    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products'
    const method = editingProduct ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      if (!res.ok) {
        throw new Error('Failed to save product')
      }
      setName('')
      setPrice('')
      setDescription('')
      setImages('')
      setCategory('')
      setAvailableColors('')
      setAvailableSizes('')
      setEditingProduct(null)
      fetchProducts()
    } catch (err) {
      console.error('Error saving product:', err)
      setError('Failed to save product. Please try again.')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setName(product.name)
    setPrice(product.price.toString())
    setDescription(product.description)
    setImages(product.images.join(', '))
    setCategory(product.category)
    setAvailableColors(product.availableColors.join(', '))
    setAvailableSizes(product.availableSizes.join(', '))
  }

  const handlePublish = async (productId, publish) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish }),
      })
      if (!res.ok) {
        throw new Error('Failed to update product')
      }
      fetchProducts()
    } catch (err) {
      console.error('Error updating product:', err)
      setError('Failed to update product. Please try again.')
    }
  }

  const handleSort = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc'
    setSortOrder(newSortOrder)
    setProducts([...products].sort((a, b) => {
      if (newSortOrder === 'desc') {
        return new Date(b.uploadTime) - new Date(a.uploadTime)
      } else {
        return new Date(a.uploadTime) - new Date(b.uploadTime)
      }
    }))
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user.email !== 'admin@example.com') {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto mt-8 p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2">Product Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block mb-2">Price</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="images" className="block mb-2">Image URLs (comma-separated)</label>
            <input
              type="text"
              id="images"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block mb-2">Category</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="availableColors" className="block mb-2">Available Colors (comma-separated)</label>
            <input
              type="text"
              id="availableColors"
              value={availableColors}
              onChange={(e) => setAvailableColors(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="availableSizes" className="block mb-2">Available Sizes (comma-separated)</label>
            <input
              type="text"
              id="availableSizes"
              value={availableSizes}
              onChange={(e) => setAvailableSizes(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <button onClick={handleSort} className="mb-4 bg-gray-200 px-4 py-2 rounded">
          Sort by Upload Time ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
        </button>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border p-4 rounded">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <p className="mt-2">{product.description}</p>
                <p className="mt-2">Category: {product.category}</p>
                <p className="mt-2">Colors: {product.availableColors ? product.availableColors.join(', ') : 'N/A'}</p>
                <p className="mt-2">Sizes: {product.availableSizes ? product.availableSizes.join(', ') : 'N/A'}</p>
                <p className="mt-2">Uploaded: {new Date(product.uploadTime).toLocaleString()}</p>
                <div className="mt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublish(product._id, !product.published)}
                    className={`${
                      product.published ? 'bg-red-500' : 'bg-green-500'
                    } text-white px-2 py-1 rounded`}
                  >
                    {product.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4 mt-8">Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No recent orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.selectedColor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.selectedSize}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${(order.amount_total / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

