import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    select: { id: true, platform: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 이미 신청한 리뷰어 ID 목록
  const existingApps = await prisma.application.findMany({
    where: { campaignId: id },
    select: { reviewerId: true },
  });
  const appliedIds = existingApps.map((a) => a.reviewerId);

  // 관심 마크된 리뷰어 + 최근 활동한 리뷰어 (신청 안 한 리뷰어만)
  const favoriteMarks = await prisma.advertiserReviewerMark.findMany({
    where: { advertiserId: session.user.id, type: "FAVORITE" },
    select: { reviewerId: true },
  });
  const favoriteIds = favoriteMarks.map((m) => m.reviewerId).filter((id) => !appliedIds.includes(id));

  // 플랫폼에 맞는 SNS 필터 조건
  const platformFilter: Record<string, unknown> = {};
  if (campaign.platform === "NAVER_BLOG") {
    platformFilter.blogUrl = { not: null };
  } else if (campaign.platform === "INSTAGRAM") {
    platformFilter.instagramId = { not: null };
  }

  const reviewers = await prisma.user.findMany({
    where: {
      role: "REVIEWER",
      id: { notIn: appliedIds },
      OR: [
        { id: { in: favoriteIds } },
        { ...platformFilter, onboarded: true },
      ],
    },
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
      _count: { select: { reviews: true, applications: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  if (reviewers.length === 0) {
    return NextResponse.json([]);
  }

  const reviewerIds = reviewers.map((r) => r.id);

  const [approvedCounts, rejectedAppCounts, avgRatings, allRatingTags] = await Promise.all([
    prisma.review.groupBy({
      by: ["reviewerId"],
      where: { reviewerId: { in: reviewerIds }, status: "APPROVED" },
      _count: { id: true },
    }),
    prisma.application.groupBy({
      by: ["reviewerId"],
      where: { reviewerId: { in: reviewerIds }, status: "REJECTED" },
      _count: { id: true },
    }),
    prisma.reviewerRating.groupBy({
      by: ["reviewerId"],
      where: { reviewerId: { in: reviewerIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.reviewerRating.findMany({
      where: { reviewerId: { in: reviewerIds }, tags: { not: null } },
      select: { reviewerId: true, tags: true },
    }),
  ]);

  const approvedMap = Object.fromEntries(approvedCounts.map((r) => [r.reviewerId, r._count.id]));
  const rejectedMap = Object.fromEntries(rejectedAppCounts.map((r) => [r.reviewerId, r._count.id]));
  const ratingMap = Object.fromEntries(avgRatings.map((r) => [r.reviewerId, { avg: r._avg.rating || 0, count: r._count.rating }]));

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

  // 관심/블랙 마크
  const marks = await prisma.advertiserReviewerMark.findMany({
    where: { advertiserId: session.user.id, reviewerId: { in: reviewerIds } },
  });
  const markMap: Record<string, { favorite: boolean; blacklist: boolean }> = {};
  marks.forEach((m: { reviewerId: string; type: string }) => {
    if (!markMap[m.reviewerId]) markMap[m.reviewerId] = { favorite: false, blacklist: false };
    if (m.type === "FAVORITE") markMap[m.reviewerId].favorite = true;
    if (m.type === "BLACKLIST") markMap[m.reviewerId].blacklist = true;
  });

  const enriched = reviewers.map((reviewer) => ({
    reviewer,
    reviewerStats: {
      approvedReviews: approvedMap[reviewer.id] || 0,
      rejectedApplications: rejectedMap[reviewer.id] || 0,
      avgRating: ratingMap[reviewer.id]?.avg || 0,
      ratingCount: ratingMap[reviewer.id]?.count || 0,
      tagCounts: tagCountMap[reviewer.id] || {},
    },
    marks: markMap[reviewer.id] || { favorite: false, blacklist: false },
  }));

  // 관심 마크된 리뷰어 먼저 표시
  enriched.sort((a, b) => {
    if (a.marks.favorite && !b.marks.favorite) return -1;
    if (!a.marks.favorite && b.marks.favorite) return 1;
    return 0;
  });

  return NextResponse.json(enriched);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id, advertiserId: session.user.id },
    select: { id: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { reviewerId } = await request.json();
  if (!reviewerId) {
    return NextResponse.json({ error: "reviewerId required" }, { status: 400 });
  }

  // 이미 신청이 있는지 확인
  const existing = await prisma.application.findUnique({
    where: { campaignId_reviewerId: { campaignId: id, reviewerId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already applied" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      campaignId: id,
      reviewerId,
      status: "ACCEPTED",
      message: "광고주 추가 선정",
    },
  });

  return NextResponse.json(application, { status: 201 });
}
