// checkout/[id]/page.js
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../../components/Header'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Checkout({ params }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedColor = searchParams.get('color')
  const selectedSize = searchParams.get('size')

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${params.id}`)
          if (!res.ok) {
            throw new Error('Failed to fetch product')
          }
          const data = await res.json()
          setProduct(data)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [params.id, session, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) return

    const stripe = await stripePromise
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product._id,
        name: session.user.name,
        email: session.user.email,
        address: session.user.address || '',
        color: selectedColor,
        size: selectedSize,
      }),
    })

    const checkoutSession = await response.json()

    if (checkoutSession.error) {
      setError(checkoutSession.error)
      return
    }

    const result = await stripe.redirectToCheckout({
      sessionId: checkoutSession.id,
    })

    if (result.error) {
      setError(result.error.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!product) return <div className="text-red-500">Product not found</div>

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto p-8 px-4 md:px-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Checkout</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Order Summary Section */}
          <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="border p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700">{product.name}</h3>
              <p className="text-gray-600 mt-2">${product.price}</p>
              <p className="text-gray-600 mt-2">Category: {product.category}</p>
              <p className="text-gray-600 mt-2">Description: {product.description}</p>
              <p className="text-gray-600 mt-2">Selected Color: {selectedColor}</p>
              <p className="text-gray-600 mt-2">Selected Size: {selectedSize}</p>
            </div>
          </div>

          {/* Shipping Information Section */}
          <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  value={session.user.name}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* <div className="mb-6">
                <label htmlFor="address" className="block text-lg font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={session.user.address || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

