"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push("/workspace")
  }, [session, router])

  return (
    <div className="min-h-screen bg-[#EAE8E2] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded bg-stone-900 text-[#EAE8E2] flex items-center justify-center font-medium text-xl mx-auto mb-8">
          L
        </div>
        <h1 className="text-4xl font-light text-stone-900 mb-4 font-display" style={{ letterSpacing: "-0.05em" }}>
          Leadship.AI
        </h1>
        <p className="text-stone-500 text-sm mb-12 max-w-sm mx-auto">
          AI-powered lead generation and enrichment. Find, qualify, and connect with your ideal prospects.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/workspace" })}
          className="bg-stone-900 text-[#EAE8E2] px-8 py-3 rounded-sm text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
        >
          Sign In with Google
        </button>
        <p className="text-xs text-stone-400 mt-6">Secure authentication via Google OAuth</p>
      </div>
    </div>
  )
}
