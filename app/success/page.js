// success/page.js
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../../components/Header'

export default function Success() {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        setError('No session ID provided')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/order-details?session_id=${sessionId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch order details')
        }
        const data = await res.json()
        setOrderDetails(data)
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError('Failed to fetch order details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [searchParams])

  if (loading) return <div className="text-center text-lg font-medium text-gray-700 py-8">Loading...</div>
  if (error) return <div className="text-center text-lg font-medium text-red-600 py-8">Error: {error}</div>

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto py-16 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-green-600">Thank You for Your Purchase!</h1>
        {orderDetails && (
          <div className="bg-white shadow-lg rounded-lg p-8 space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Order Details</h2>
              <p className="text-gray-600 mt-2">Order ID: <span className="font-medium text-gray-800">{orderDetails.id}</span></p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Product Information</h3>
              <p className="text-gray-600">Name: <span className="font-medium text-gray-800">{orderDetails.product.name}</span></p>
              <p className="text-gray-600">Description: <span className="font-medium text-gray-800">{orderDetails.product.description}</span></p>
              <p className="text-gray-600">Category: <span className="font-medium text-gray-800">{orderDetails.product.category}</span></p>
              <p className="text-gray-600">Color: <span className="font-medium text-gray-800">{orderDetails.product.selectedColor}</span></p>
              <p className="text-gray-600">Size: <span className="font-medium text-gray-800">{orderDetails.product.selectedSize}</span></p>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Price: <span className="font-medium text-gray-800">${(orderDetails.product.price / 100).toFixed(2)}</span></p>
              <p className="text-gray-600">Quantity: <span className="font-medium text-gray-800">{orderDetails.line_items[0].quantity}</span></p>
              <p className="text-gray-600">Total: <span className="font-medium text-gray-800">${(orderDetails.amount_total / 100).toFixed(2)}</span></p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Shipping Information</h3>
              <p className="text-gray-600">Name: <span className="font-medium text-gray-800">{orderDetails.customer_details?.name || 'N/A'}</span></p>
              <p className="text-gray-600">Email: <span className="font-medium text-gray-800">{orderDetails.customer_details?.email || 'N/A'}</span></p>
              <p className="text-gray-600">Address: <span className="font-medium text-gray-800">
                {orderDetails.customer_details?.address?.line1 || 'N/A'}, 
                {orderDetails.customer_details?.address?.city || 'N/A'}, 
                {orderDetails.customer_details?.address?.state || 'N/A'}, 
                {orderDetails.customer_details?.address?.postal_code || 'N/A'}, 
                {orderDetails.customer_details?.address?.country || 'N/A'}
              </span></p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

