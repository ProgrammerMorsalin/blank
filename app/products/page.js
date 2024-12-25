'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortOrder])

  const fetchProducts = async () => {
    try {
      let url = '/api/products?published=true'
      if (selectedCategory) {
        url += `&category=${selectedCategory}`
      }
      url += `&sort=${sortOrder}`
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(product => product.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
  }

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div>
      <Header />
      <main className="bg-black text-white container mx-auto py-16 px-5">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
        <div className="flex justify-between mb-4">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={toggleSortOrder}
            className="bg-gray-800 text-white p-2 rounded"
          >
            Sort by Time: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 py-5 gap-8">
          {products.map((product) => (
            <Link
              href={`/product/${product._id}`}
              key={product._id}
              className="bg-gray-800 border border-gray-700 p-4 rounded hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center mb-4 bg-gray-900 rounded">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-w-[150px] max-h-[200px] object-contain"
                />
              </div>
              <p className="text-xl text-white">{truncateText(product.name, 14)}</p>
              <p className="text-gray-400">${product.price}</p>
              <p className="text-gray-500 text-sm">{product.category}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
