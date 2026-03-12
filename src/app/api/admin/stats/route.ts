import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 최근 7일간 날짜별 신규 가입, 캠페인 생성, 신청, 리뷰 통계
  const now = new Date();
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const startDate = new Date(days[0] + "T00:00:00Z");

  const [users, campaigns, applications, reviews, gradeDistribution, platformDistribution] =
    await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.campaign.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.application.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.review.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.user.groupBy({
        by: ["grade"],
        _count: true,
        where: { role: "REVIEWER" },
      }),
      prisma.campaign.groupBy({
        by: ["platform"],
        _count: true,
      }),
    ]);

  function countByDay(items: { createdAt: Date }[]) {
    const map: Record<string, number> = {};
    for (const d of days) map[d] = 0;
    for (const item of items) {
      const key = item.createdAt.toISOString().split("T")[0];
      if (map[key] !== undefined) map[key]++;
    }
    return days.map((d) => ({ date: d, count: map[d] }));
  }

  return NextResponse.json({
    daily: {
      users: countByDay(users),
      campaigns: countByDay(campaigns),
      applications: countByDay(applications),
      reviews: countByDay(reviews),
    },
    gradeDistribution: gradeDistribution.map((g) => ({
      grade: g.grade,
      count: g._count,
    })),
    platformDistribution: platformDistribution.map((p) => ({
      platform: p.platform,
      count: p._count,
    })),
  });
}
