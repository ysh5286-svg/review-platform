import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status, adminNote } = await request.json();

  const charge = await prisma.pointCharge.findUnique({ where: { id } });
  if (!charge || charge.status !== "PENDING") {
    return NextResponse.json({ error: "처리할 수 없는 요청입니다" }, { status: 400 });
  }

  if (status === "COMPLETED") {
    const user = await prisma.user.findUnique({
      where: { id: charge.advertiserId },
      select: { points: true },
    });

    await prisma.$transaction([
      prisma.pointCharge.update({
        where: { id },
        data: { status, adminNote, processedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: charge.advertiserId },
        data: { points: { increment: charge.amount } },
      }),
      prisma.pointHistory.create({
        data: {
          userId: charge.advertiserId,
          amount: charge.amount,
          type: "EARN",
          description: `포인트 충전 ${charge.amount.toLocaleString()}원 (${charge.method === "BANK_TRANSFER" ? "무통장입금" : "카드결제"})`,
          balanceAfter: (user?.points || 0) + charge.amount,
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: charge.advertiserId,
        type: "CHARGE_COMPLETED",
        title: "충전 완료",
        message: `${charge.amount.toLocaleString()}P 충전이 완료되었습니다.`,
        link: "/advertiser/points",
      },
    });
  } else {
    await prisma.pointCharge.update({
      where: { id },
      data: { status, adminNote, processedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: charge.advertiserId,
        type: "CHARGE_CANCELLED",
        title: "충전 취소",
        message: `${charge.amount.toLocaleString()}P 충전이 취소되었습니다.${adminNote ? ` 사유: ${adminNote}` : ""}`,
        link: "/advertiser/points",
      },
    });
  }

  return NextResponse.json({ success: true });
}
