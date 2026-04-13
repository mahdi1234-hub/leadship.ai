import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["none"],
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === baseUrl + "/" || url.startsWith(baseUrl + "/api/auth")) {
        return baseUrl + "/workspace"
      }
      if (url.startsWith("/")) return baseUrl + url
      if (url.startsWith(baseUrl)) return url
      return baseUrl + "/workspace"
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id
        session.user.email = user.email || session.user.email
        session.user.name = user.name || session.user.name
        session.user.image = user.image || session.user.image
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
