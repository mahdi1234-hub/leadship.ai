import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const leads = await prisma.lead.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })

  const headers = ["Name", "Title", "Company", "Email", "Phone", "Intent Score", "Intent Level", "Source"]
  const rows = leads.map(l => [l.name, l.title || "", l.company || "", l.email || "", l.phone || "", String(l.intentScore), l.intentLevel, l.source || ""])
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
