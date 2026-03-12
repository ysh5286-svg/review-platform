import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateGrade, GRADE_REQUIREMENTS, GRADE_BENEFITS } from "@/lib/grade";

// GET: 현재 등급 정보 조회
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { grade: true, role: true },
    });

    if (!user || user.role !== "REVIEWER") {
      return NextResponse.json({ error: "리뷰어만 등급을 조회할 수 있습니다." }, { status: 403 });
    }

    // 통계 조회
    const totalReviews = await prisma.review.count({
      where: { reviewerId: session.user.id },
    });

    const approvedReviews = await prisma.review.count({
      where: { reviewerId: session.user.id, status: "APPROVED" },
    });

    const topRankCount = await prisma.searchRankCheck.count({
      where: {
        review: { reviewerId: session.user.id },
        isTop: true,
      },
    });

    const currentGrade = user.grade;
    const calculatedGrade = calculateGrade({ totalReviews, approvedReviews, topRankCount });

    return NextResponse.json({
      currentGrade,
      calculatedGrade,
      stats: {
        totalReviews,
        approvedReviews,
        approvalRate: totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0,
        topRankCount,
        topRate: totalReviews > 0 ? Math.round((topRankCount / totalReviews) * 100) : 0,
      },
      requirements: GRADE_REQUIREMENTS,
      benefits: GRADE_BENEFITS[currentGrade],
    });
  } catch (error) {
    console.error("Failed to get grade:", error);
    return NextResponse.json({ error: "등급 조회에 실패했습니다." }, { status: 500 });
  }
}

// POST: 등급 재산정 (수동 트리거)
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const totalReviews = await prisma.review.count({
      where: { reviewerId: session.user.id },
    });

    const approvedReviews = await prisma.review.count({
      where: { reviewerId: session.user.id, status: "APPROVED" },
    });

    const topRankCount = await prisma.searchRankCheck.count({
      where: {
        review: { reviewerId: session.user.id },
        isTop: true,
      },
    });

    const newGrade = calculateGrade({ totalReviews, approvedReviews, topRankCount });

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { grade: newGrade },
      select: { grade: true },
    });

    return NextResponse.json({ grade: updatedUser.grade });
  } catch (error) {
    console.error("Failed to update grade:", error);
    return NextResponse.json({ error: "등급 업데이트에 실패했습니다." }, { status: 500 });
  }
}
