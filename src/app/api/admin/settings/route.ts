import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { withdrawalFee, taxRate, settlementDay1, settlementDay2 } = body;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      ...(withdrawalFee !== undefined && { withdrawalFee }),
      ...(taxRate !== undefined && { taxRate }),
      ...(settlementDay1 !== undefined && { settlementDay1 }),
      ...(settlementDay2 !== undefined && { settlementDay2 }),
    },
    create: {
      id: "default",
      ...(withdrawalFee !== undefined && { withdrawalFee }),
      ...(taxRate !== undefined && { taxRate }),
      ...(settlementDay1 !== undefined && { settlementDay1 }),
      ...(settlementDay2 !== undefined && { settlementDay2 }),
    },
  });

  return NextResponse.json(settings);
}
