import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WithdrawalStatus } from "@/generated/prisma/client";
import { notifyWithdrawalProcessed } from "@/lib/notification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자만 접근할 수 있습니다." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "출금 요청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { error: "이미 처리된 출금 요청입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNote } = body as {
      status: WithdrawalStatus;
      adminNote?: string;
    };

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다. APPROVED 또는 REJECTED만 가능합니다." },
        { status: 400 }
      );
    }

    if (status === "REJECTED") {
      // Refund points back to user
      const [updatedWithdrawal] = await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id },
          data: {
            status: "REJECTED",
            adminNote,
            processedAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { points: { increment: withdrawal.amount } },
        }),
        prisma.pointHistory.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "EARN",
            description: `출금 거절 환불: ${withdrawal.amount.toLocaleString()}원`,
            balanceAfter: withdrawal.user.points + withdrawal.amount,
          },
        }),
      ]);

      // 출금 거절 알림
      await notifyWithdrawalProcessed(withdrawal.userId, withdrawal.amount, false);

      return NextResponse.json(updatedWithdrawal);
    }

    // APPROVED
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        status: "APPROVED",
        adminNote,
        processedAt: new Date(),
      },
    });

    // 출금 승인 알림
    await notifyWithdrawalProcessed(withdrawal.userId, withdrawal.amount, true);

    return NextResponse.json(updatedWithdrawal);
  } catch (error) {
    console.error("Failed to update withdrawal:", error);
    return NextResponse.json(
      { error: "출금 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
