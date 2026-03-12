import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Get all reviewers with stats
  const reviewers = await prisma.user.findMany({
    where: { role: "REVIEWER", onboarded: true },
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
          applications: { where: { status: "ACCEPTED" } },
        },
      },
      receivedRatings: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const ranked = reviewers
    .map((r) => {
      const avgRating = r.receivedRatings.length > 0
        ? r.receivedRatings.reduce((sum, rr) => sum + rr.rating, 0) / r.receivedRatings.length
        : 0;
      const score =
        r._count.reviews * 10 +
        r._count.applications * 2 +
        avgRating * 5;
      return {
        id: r.id,
        name: r.name,
        image: r.image,
        grade: r.grade,
        blogUrl: r.blogUrl,
        instagramId: r.instagramId,
        youtubeUrl: r.youtubeUrl,
        tiktokId: r.tiktokId,
        approvedReviews: r._count.reviews,
        acceptedApplications: r._count.applications,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: r.receivedRatings.length,
        score,
        joinedAt: r.createdAt,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return NextResponse.json(ranked);
}
