import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      grade: true,
      blogUrl: true,
      instagramId: true,
      youtubeUrl: true,
      tiktokId: true,
      createdAt: true,
      _count: {
        select: {
          reviews: { where: { status: "APPROVED" } },
          applications: true,
        },
      },
      receivedRatings: {
        select: { rating: true },
      },
    },
  });

  if (!user || !user.name) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: { reviewerId: userId, status: "APPROVED" },
    include: {
      application: {
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              platform: true,
              contentType: true,
              category: true,
              businessName: true,
              imageUrl: true,
            },
          },
        },
      },
      rating: {
        select: { rating: true, comment: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = user.receivedRatings.length > 0
    ? user.receivedRatings.reduce((sum, r) => sum + r.rating, 0) / user.receivedRatings.length
    : 0;

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    const p = r.application.campaign.platform;
    const c = r.application.campaign.category;
    platformCounts[p] = (platformCounts[p] || 0) + 1;
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      image: user.image,
      grade: user.grade,
      blogUrl: user.blogUrl,
      instagramId: user.instagramId,
      youtubeUrl: user.youtubeUrl,
      tiktokId: user.tiktokId,
      joinedAt: user.createdAt,
      approvedReviews: user._count.reviews,
      totalApplications: user._count.applications,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: user.receivedRatings.length,
    },
    reviews: reviews.map((r) => ({
      id: r.id,
      reviewUrl: r.reviewUrl,
      createdAt: r.createdAt,
      campaign: r.application.campaign,
      rating: r.rating,
    })),
    platformCounts,
    categoryCounts,
  });
}
