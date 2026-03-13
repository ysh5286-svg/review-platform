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
          phone: true,
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

  // 관심/블랙 마크 조회
  const marks = await prisma.advertiserReviewerMark.findMany({
    where: { advertiserId: session.user.id, reviewerId: { in: reviewerIds } },
  });
  const markMap: Record<string, { favorite: boolean; blacklist: boolean }> = {};
  marks.forEach((m: { reviewerId: string; type: string }) => {
    if (!markMap[m.reviewerId]) markMap[m.reviewerId] = { favorite: false, blacklist: false };
    if (m.type === "FAVORITE") markMap[m.reviewerId].favorite = true;
    if (m.type === "BLACKLIST") markMap[m.reviewerId].blacklist = true;
  });

  const [approvedCounts, rejectedAppCounts, avgRatings, allRatingTags] = await Promise.all([
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
    // 평가 태그 전체 조회
    prisma.reviewerRating.findMany({
      where: { reviewerId: { in: reviewerIds }, tags: { not: null } },
      select: { reviewerId: true, tags: true },
    }),
  ]);

  const approvedMap = Object.fromEntries(approvedCounts.map((r) => [r.reviewerId, r._count.id]));
  const rejectedMap = Object.fromEntries(rejectedAppCounts.map((r) => [r.reviewerId, r._count.id]));
  const ratingMap = Object.fromEntries(avgRatings.map((r) => [r.reviewerId, { avg: r._avg.rating || 0, count: r._count.rating }]));

  // 리뷰어별 태그 카운트 집계
  const tagCountMap: Record<string, Record<string, number>> = {};
  allRatingTags.forEach((rt: { reviewerId: string; tags: string | null }) => {
    if (!rt.tags) return;
    try {
      const parsed = JSON.parse(rt.tags) as string[];
      if (!tagCountMap[rt.reviewerId]) tagCountMap[rt.reviewerId] = {};
      parsed.forEach((tag: string) => {
        tagCountMap[rt.reviewerId][tag] = (tagCountMap[rt.reviewerId][tag] || 0) + 1;
      });
    } catch {}
  });

  const enriched = applications.map((app: Record<string, unknown>) => {
    const rid = (app.reviewer as { id: string }).id;
    return {
      ...app,
      reviewerStats: {
        approvedReviews: approvedMap[rid] || 0,
        rejectedApplications: rejectedMap[rid] || 0,
        avgRating: ratingMap[rid]?.avg || 0,
        ratingCount: ratingMap[rid]?.count || 0,
        tagCounts: tagCountMap[rid] || {},
      },
      marks: markMap[rid] || { favorite: false, blacklist: false },
    };
  });

  return NextResponse.json(enriched);
}
