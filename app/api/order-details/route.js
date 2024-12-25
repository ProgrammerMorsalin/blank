// api/order-details/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    if (!session.metadata.productId) {
      throw new Error('Product ID not found in session metadata')
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const product = await db.collection("products").findOne({ _id: new ObjectId(session.metadata.productId) })

    if (!product) {
      throw new Error('Product not found in database')
    }

    const orderDetails = {
      id: session.id,
      amount_total: session.amount_total,
      customer_details: session.customer_details,
      line_items: session.line_items.data,
      product: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        selectedColor: session.metadata.color,
        selectedSize: session.metadata.size,
      },
    }

    return NextResponse.json(orderDetails)
  } catch (error) {
    console.error('Error retrieving order details:', error)
    return NextResponse.json({ error: 'Failed to retrieve order details: ' + error.message }, { status: 500 })
  }
}

