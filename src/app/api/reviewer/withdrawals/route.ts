import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(withdrawals);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, bankName, bankAccount, accountHolder } =
    await request.json();

  if (!amount || !bankName || !bankAccount || !accountHolder) {
    return NextResponse.json(
      { error: "모든 필드를 입력해주세요" },
      { status: 400 }
    );
  }

  if (amount < 5000) {
    return NextResponse.json(
      { error: "최소 출금 금액은 5,000원입니다" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });

  if (!user || user.points < amount) {
    return NextResponse.json(
      { error: "포인트가 부족합니다" },
      { status: 400 }
    );
  }

  const [withdrawal] = await prisma.$transaction([
    prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount,
        bankName,
        bankAccount,
        accountHolder,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { points: { decrement: amount } },
    }),
    prisma.pointHistory.create({
      data: {
        userId: session.user.id,
        amount: -amount,
        type: "WITHDRAW",
        description: `출금 신청 (${bankName} ${bankAccount})`,
        balanceAfter: user.points - amount,
      },
    }),
  ]);

  return NextResponse.json(withdrawal, { status: 201 });
}
