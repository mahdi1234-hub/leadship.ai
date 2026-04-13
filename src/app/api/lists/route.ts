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
  const lists = await prisma.savedList.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ lists })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = (session.user as any).id
  const { name, leadIds } = await req.json()

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

  const list = await prisma.savedList.create({
    data: {
      name,
      userId,
      items: leadIds?.length ? { create: leadIds.map((id: string) => ({ leadId: id })) } : undefined,
    },
  })
  return NextResponse.json({ ok: true, list })
}
