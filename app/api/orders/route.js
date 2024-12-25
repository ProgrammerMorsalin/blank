// api/orders/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import Stripe from 'stripe'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== 'admin@example.com') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const stripeOrders = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items', 'data.customer'],
    })

    const client = await clientPromise
    const db = client.db("ecommerce")

    const orders = await Promise.all(stripeOrders.data.map(async (order) => {
      let product = null
      if (order.metadata && order.metadata.productId) {
        product = await db.collection("products").findOne({ _id: new ObjectId(order.metadata.productId) })
      }

      return {
        id: order.id,
        customer: {
          name: order.customer_details?.name || 'N/A',
          email: order.customer_details?.email || 'N/A',
          address: `${order.customer_details?.address?.line1 || ''}, ${order.customer_details?.address?.city || ''}, ${order.customer_details?.address?.state || ''}, ${order.customer_details?.address?.postal_code || ''}, ${order.customer_details?.address?.country || ''}`.trim(),
        },
        product: {
          name: order.line_items?.data[0]?.description || 'N/A',
          category: product ? product.category : 'N/A',
        },
        selectedColor: order.metadata?.color || 'N/A',
        selectedSize: order.metadata?.size || 'N/A',
        amount_total: order.amount_total,
        created: order.created,
      }
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

