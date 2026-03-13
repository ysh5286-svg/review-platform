import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      blogUrl: true,
      instagramId: true,
      youtubeUrl: true,
      tiktokId: true,
    },
  });

  // Determine user's platforms
  const userPlatforms: string[] = [];
  if (user?.blogUrl) userPlatforms.push("NAVER_BLOG");
  if (user?.instagramId) userPlatforms.push("INSTAGRAM");
  if (user?.youtubeUrl || user?.tiktokId) userPlatforms.push("SHORT_FORM");

  // Get user's past categories
  const pastApps = await prisma.application.findMany({
    where: { reviewerId: session.user.id },
    include: { campaign: { select: { category: true } } },
  });
  const categoryCounts: Record<string, number> = {};
  pastApps.forEach((a) => {
    const c = a.campaign.category;
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c);

  // Get already applied campaign ids
  const appliedIds = pastApps.map((a) => a.campaignId);

  // Get recommended campaigns
  const where: Record<string, unknown> = {
    status: "RECRUITING",
    id: { notIn: appliedIds },
  };

  if (userPlatforms.length > 0) {
    where.platform = { in: userPlatforms };
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      advertiser: { select: { businessName: true, role: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Sort by relevance (matching categories first, then by point reward)
  const scored = campaigns.map((c) => ({
    ...c,
    relevanceScore:
      (topCategories.includes(c.category) ? 100 : 0) +
      c.pointReward / 100 +
      (c.maxReviewers - c._count.applications > 0 ? 50 : 0),
  }));

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return NextResponse.json(scored);
}
