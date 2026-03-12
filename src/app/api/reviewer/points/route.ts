import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    }),
    prisma.pointHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    balance: user?.points ?? 0,
    history,
  });
}
