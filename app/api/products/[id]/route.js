// products/[id]/route.js
import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request, { params }) {
  const client = await clientPromise
  const db = client.db("ecommerce")
  const product = await db.collection("products").findOne({ _id: new ObjectId(params.id) })
  return NextResponse.json(product)
}

export async function PUT(request, { params }) {
  const client = await clientPromise
  const db = client.db("ecommerce")
  const product = await request.json()
  await db.collection("products").updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { ...product, uploadTime: new Date() } }
  )
  return NextResponse.json({ message: 'Product updated successfully' })
}

export async function PATCH(request, { params }) {
  const client = await clientPromise
  const db = client.db("ecommerce")
  const update = await request.json()
  await db.collection("products").updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { ...update, uploadTime: new Date() } }
  )
  return NextResponse.json({ message: 'Product updated successfully' })
}

