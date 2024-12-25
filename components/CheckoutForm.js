import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'

export default function CheckoutForm({ productId, address }) {
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    const { error: backendError, clientSecret } = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        address,
      }),
    }).then(res => res.json())

    if (backendError) {
      setError(backendError.message)
      setProcessing(false)
      return
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    })

    if (stripeError) {
      setError(stripeError.message)
      setProcessing(false)
    } else if (paymentIntent.status === 'succeeded') {
      router.push(`/success?session_id=${paymentIntent.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}

