import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });

  const charges = await prisma.pointCharge.findMany({
    where: { advertiserId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const pointHistory = await prisma.pointHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    balance: user?.points || 0,
    charges,
    pointHistory,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { amount, method } = await request.json();

  if (!amount || amount < 10000) {
    return NextResponse.json(
      { error: "최소 충전 금액은 10,000원입니다" },
      { status: 400 }
    );
  }

  if (!method) {
    return NextResponse.json(
      { error: "충전 방법을 선택해주세요" },
      { status: 400 }
    );
  }

  const charge = await prisma.pointCharge.create({
    data: {
      advertiserId: session.user.id,
      amount,
      method,
    },
  });

  return NextResponse.json(charge, { status: 201 });
}
