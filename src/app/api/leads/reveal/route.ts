import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { leadId } = await req.json()

  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } })
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  const fakeEmail = lead.name.toLowerCase().replace(/\s+/g, ".") + "@" + (lead.company || "company").toLowerCase().replace(/\s+/g, "") + ".com"
  const fakePhone = "+1 (555) " + String(Math.floor(1000000 + Math.random() * 9000000)).slice(0, 3) + "-" + String(Math.floor(1000 + Math.random() * 9000))

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      email: fakeEmail,
      emailStatus: "verified",
      phone: fakePhone,
      phoneStatus: "direct",
    },
  })

  return NextResponse.json({ ok: true, lead: updated })
}
