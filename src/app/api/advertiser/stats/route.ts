import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: session.user.id },
    include: {
      applications: {
        include: {
          review: {
            include: {
              rating: { select: { rating: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let totalApplicants = 0;
  let totalAccepted = 0;
  let totalReviewsSubmitted = 0;
  let totalReviewsApproved = 0;
  let allRatings: number[] = [];

  const campaignStats = campaigns.map((c) => {
    const applicants = c.applications.length;
    const accepted = c.applications.filter((a) => a.status === "ACCEPTED").length;
    const reviewsSubmitted = c.applications.filter((a) => a.review).length;
    const reviewsApproved = c.applications.filter((a) => a.review?.status === "APPROVED").length;
    const ratings = c.applications
      .filter((a) => a.review?.rating)
      .map((a) => a.review!.rating!.rating);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : 0;

    totalApplicants += applicants;
    totalAccepted += accepted;
    totalReviewsSubmitted += reviewsSubmitted;
    totalReviewsApproved += reviewsApproved;
    allRatings = allRatings.concat(ratings);

    return {
      id: c.id,
      title: c.title,
      platform: c.platform,
      status: c.status,
      pointReward: c.pointReward,
      maxReviewers: c.maxReviewers,
      applicants,
      accepted,
      reviewsSubmitted,
      reviewsApproved,
      avgRating,
      ratingCount: ratings.length,
    };
  });

  const overallAvgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10
    : 0;

  return NextResponse.json({
    totalCampaigns: campaigns.length,
    totalApplicants,
    totalAccepted,
    totalReviewsApproved,
    totalPointsSpent: campaigns.reduce((s, c) => s + c.pointReward * c.applications.filter((a) => a.review?.status === "APPROVED").length, 0),
    avgRating: overallAvgRating,
    campaigns: campaignStats,
  });
}
