import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import clientPromise from '../../../../lib/mongodb'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null
        }

        const client = await clientPromise
        const usersCollection = client.db("ecommerce").collection("users")

        const user = await usersCollection.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordCorrect = await compare(credentials.password, user.password)

        if (!isPasswordCorrect) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      session.user.email = token.email
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }