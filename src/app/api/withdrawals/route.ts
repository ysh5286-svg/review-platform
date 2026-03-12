import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error("Failed to fetch withdrawals:", error);
    return NextResponse.json(
      { error: "출금 내역을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (session.user.role !== "REVIEWER") {
      return NextResponse.json(
        { error: "리뷰어만 출금을 신청할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, bankName, bankAccount, accountHolder } = body;

    if (!amount || !bankName || !bankAccount || !accountHolder) {
      return NextResponse.json(
        { error: "출금 금액과 계좌 정보는 필수입니다." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "출금 금액은 0보다 커야 합니다." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.points < amount) {
      return NextResponse.json(
        { error: "포인트가 부족합니다." },
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
          amount,
          type: "WITHDRAW",
          description: `출금 신청: ${amount.toLocaleString()}원`,
          balanceAfter: user.points - amount,
        },
      }),
    ]);

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (error) {
    console.error("Failed to create withdrawal:", error);
    return NextResponse.json(
      { error: "출금 신청에 실패했습니다." },
      { status: 500 }
    );
  }
}
