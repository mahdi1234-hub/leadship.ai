import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { searchLeads, parseLeadsFromResults } from "@/lib/tavily"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { query } = await req.json()
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query required" }, { status: 400 })
  }

  const results = await searchLeads(query)
  const parsed = parseLeadsFromResults(results)

  const userId = (session.user as any).id
  const leads = []

  for (const lead of parsed) {
    const created = await prisma.lead.create({
      data: {
        name: lead.name,
        title: lead.title,
        company: lead.company,
        intentScore: lead.intentScore,
        intentLevel: lead.intentLevel,
        source: lead.source,
        userId,
      },
    })
    leads.push(created)
  }

  return NextResponse.json({ ok: true, leads, count: leads.length })
}
