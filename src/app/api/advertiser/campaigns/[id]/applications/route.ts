import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id, advertiserId: session.user.id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { campaignId: id },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          nickname: true,
          email: true,
          image: true,
          grade: true,
          blogUrl: true,
          instagramId: true,
          youtubeUrl: true,
          tiktokId: true,
          blogVerified: true,
          instagramVerified: true,
          youtubeVerified: true,
          tiktokVerified: true,
          _count: {
            select: {
              reviews: true,
              applications: true,
            },
          },
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 각 신청자별 협찬완료(APPROVED 리뷰), 취소횟수(REJECTED 신청) 집계
  const reviewerIds = [...new Set(applications.map((a: { reviewer: { id: string } }) => a.reviewer.id))];

  const [approvedCounts, rejectedAppCounts, avgRatings] = await Promise.all([
    // 협찬 완료 횟수 (APPROVED 리뷰 수)
    prisma.review.groupBy({
      by: ["reviewerId"],
      where: { reviewerId: { in: reviewerIds }, status: "APPROVED" },
      _count: { id: true },
    }),
    // 취소/미선정 횟수
    prisma.application.groupBy({
      by: ["reviewerId"],
      where: { reviewerId: { in: reviewerIds }, status: "REJECTED" },
      _count: { id: true },
    }),
    // 평균 평점
    prisma.reviewerRating.groupBy({
      by: ["reviewerId"],
      where: { reviewerId: { in: reviewerIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  const approvedMap = Object.fromEntries(approvedCounts.map((r) => [r.reviewerId, r._count.id]));
  const rejectedMap = Object.fromEntries(rejectedAppCounts.map((r) => [r.reviewerId, r._count.id]));
  const ratingMap = Object.fromEntries(avgRatings.map((r) => [r.reviewerId, { avg: r._avg.rating || 0, count: r._count.rating }]));

  const enriched = applications.map((app: Record<string, unknown>) => ({
    ...app,
    reviewerStats: {
      approvedReviews: approvedMap[(app.reviewer as { id: string }).id] || 0,
      rejectedApplications: rejectedMap[(app.reviewer as { id: string }).id] || 0,
      avgRating: ratingMap[(app.reviewer as { id: string }).id]?.avg || 0,
      ratingCount: ratingMap[(app.reviewer as { id: string }).id]?.count || 0,
    },
  }));

  return NextResponse.json(enriched);
}
