import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const charges = await prisma.pointCharge.findMany({
    include: {
      advertiser: { select: { name: true, email: true, businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(charges);
}
