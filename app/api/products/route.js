import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from '../../../lib/mongodb'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'desc'

  const client = await clientPromise
  const db = client.db("ecommerce")

  const query = {}
  if (category) query.category = category

  const sortDirection = sort === 'asc' ? 1 : -1
  const products = await db.collection("products")
    .find(query)
    .sort({ uploadTime: sortDirection })
    .toArray()

  return NextResponse.json(products)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== 'admin@example.com') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")
    const product = await request.json()
    product.uploadTime = new Date()
    const result = await db.collection("products").insertOne(product)
    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}