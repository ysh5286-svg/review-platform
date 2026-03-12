import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewStatus } from "@/generated/prisma/client";
import { calculateGrade } from "@/lib/grade";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        application: {
          include: { campaign: true },
        },
        reviewer: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (review.application.campaign.advertiserId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 캠페인 리뷰만 처리할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body as { status: ReviewStatus };

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다. APPROVED 또는 REJECTED만 가능합니다." },
        { status: 400 }
      );
    }

    if (status === "APPROVED") {
      const pointsAwarded = review.application.campaign.pointReward;

      const [updatedReview] = await prisma.$transaction([
        prisma.review.update({
          where: { id },
          data: { status: "APPROVED", pointsAwarded },
        }),
        prisma.user.update({
          where: { id: review.reviewerId },
          data: { points: { increment: pointsAwarded } },
        }),
        prisma.pointHistory.create({
          data: {
            userId: review.reviewerId,
            amount: pointsAwarded,
            type: "EARN",
            description: `리뷰 승인: ${review.application.campaign.title}`,
            balanceAfter: review.reviewer.points + pointsAwarded,
          },
        }),
      ]);

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

      return NextResponse.json(updatedReview);
    }

    // REJECTED
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Failed to update review:", error);
    return NextResponse.json(
      { error: "리뷰 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
