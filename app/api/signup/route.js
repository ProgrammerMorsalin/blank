import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import clientPromise from '../../../lib/mongodb'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Create the new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role for new signups
    })

    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'An error occurred during signup' }, { status: 500 })
  }
}
