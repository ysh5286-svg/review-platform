import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateGrade } from "@/lib/grade";
import { notifyReviewApproved, notifyReviewRejected, safeNotify } from "@/lib/notification";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      application: {
        include: { campaign: true },
      },
    },
  });

  if (!review || review.application.campaign.advertiserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (status === "APPROVED") {
    const pointReward = review.application.campaign.pointReward;

    await prisma.$transaction([
      prisma.review.update({
        where: { id },
        data: { status: "APPROVED", pointsAwarded: pointReward },
      }),
      prisma.user.update({
        where: { id: review.reviewerId },
        data: { points: { increment: pointReward } },
      }),
      prisma.pointHistory.create({
        data: {
          userId: review.reviewerId,
          amount: pointReward,
          type: "EARN",
          description: `리뷰 승인 - ${review.application.campaign.title}`,
          balanceAfter: 0, // Will be calculated below
        },
      }),
    ]);

    // Update balanceAfter with actual value
    const user = await prisma.user.findUnique({
      where: { id: review.reviewerId },
      select: { points: true },
    });

    await prisma.pointHistory.updateMany({
      where: {
        userId: review.reviewerId,
        description: `리뷰 승인 - ${review.application.campaign.title}`,
        balanceAfter: 0,
      },
      data: { balanceAfter: user?.points ?? 0 },
    });

    // 등급 자동 재산정
    const totalReviews = await prisma.review.count({
      where: { reviewerId: review.reviewerId },
    });
    const approvedReviews = await prisma.review.count({
      where: { reviewerId: review.reviewerId, status: "APPROVED" },
    });
    const topRankCount = await prisma.searchRankCheck.count({
      where: { review: { reviewerId: review.reviewerId }, isTop: true },
    });
    const newGrade = calculateGrade({ totalReviews, approvedReviews, topRankCount });
    await prisma.user.update({
      where: { id: review.reviewerId },
      data: { grade: newGrade },
    });

    // 리뷰 승인 알림
    await safeNotify(() => notifyReviewApproved(review.reviewerId, review.application.campaign.title, pointReward));

    return NextResponse.json({ success: true });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  // 리뷰 반려 알림
  await safeNotify(() => notifyReviewRejected(review.reviewerId, review.application.campaign.title));

  return NextResponse.json(updated);
}
