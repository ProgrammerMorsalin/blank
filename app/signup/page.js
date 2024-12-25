'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/login')
    } else {
      alert(data.error || 'Sign up failed')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto p-8 px-4 md:px-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Sign Up</h1>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out">
            Sign Up
          </button>
        </form>
      </main>
    </div>
  )
}
