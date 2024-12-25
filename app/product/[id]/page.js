'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await res.json()
        setProduct(data)
        // Set default selections if available
        if (data.availableColors && data.availableColors.length > 0) {
          setSelectedColor(data.availableColors[0])
        }
        if (data.availableSizes && data.availableSizes.length > 0) {
          setSelectedSize(data.availableSizes[0])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  const handleBuy = () => {
    if (!session) {
      router.push('/login')
    } else {
      router.push(`/checkout/${params.id}?color=${selectedColor}&size=${selectedSize}`)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!product) return <div>Product not found</div>

  return (
    <div>
      <Header />
      <main className="container mx-auto p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image Section */}
          <div className="md:w-1/2">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
            <div className="flex justify-center mt-4 space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-4 h-4 rounded-full ${
                    index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                  } transition duration-200 transform hover:scale-110`}
                />
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{product.name}</h1>
            <p className="text-2xl text-blue-600 font-semibold mb-6">${product.price}</p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{product.description}</p>
            
            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Color:</h2>
                <div className="flex space-x-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${
                        selectedColor === color ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Size:</h2>
                <div className="flex space-x-2">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 border rounded ${
                        selectedSize === size
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleBuy}
              disabled={!selectedColor || !selectedSize}
              className={`bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-lg ${
                selectedColor && selectedSize
                  ? 'hover:bg-blue-600 hover:shadow-xl'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

