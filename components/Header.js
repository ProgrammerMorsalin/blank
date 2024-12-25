'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" })
    router.push(data.url)
  }

  return (
    <header
      className="top-0 left-0 w-full bg-gradient-to-r bg-black shadow-md px-10"
      style={{ height: '100px' }}
    >
      <nav className="container mx-auto flex justify-between items-center h-full">
        <Link href="/" className="text-white flex items-center">
          <Image src='/assets/sleeve.png' width={150} height={20} alt="Logo" />
          {/* <span className="text-white text-3xl font-extrabold tracking-wide hover:opacity-90 transition-opacity ml-3">E-Commerce</span> */}
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-white text-lg hover:underline transition duration-300">
            Home
          </Link>
          {session ? (
            <>
              <span className="text-white text-lg">Logged: <strong>{session.user.email}</strong></span>
              {session.user.email === 'admin@example.com' && (
                <Link href="/admin" className="text-white text-lg hover:underline transition duration-300">
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg transition-all duration-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white text-lg hover:underline transition duration-300">
                Login
              </Link>
              <Link href="/signup" className="text-white bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg transition-all duration-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
