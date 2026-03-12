import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const campaignInclude = {
  advertiser: {
    select: {
      id: true,
      name: true,
      image: true,
      businessName: true,
    },
  },
  _count: {
    select: {
      applications: true,
    },
  },
};

export async function GET() {
  const now = new Date();

  const [premium, deadline, newest] = await Promise.all([
    // 프리미엄: 포인트 높은 순
    prisma.campaign.findMany({
      where: { status: "RECRUITING" },
      orderBy: { pointReward: "desc" },
      take: 8,
      include: campaignInclude,
    }),
    // 마감 임박: 마감일 가까운 순 (미래만)
    prisma.campaign.findMany({
      where: { status: "RECRUITING", endDate: { gt: now } },
      orderBy: { endDate: "asc" },
      take: 8,
      include: campaignInclude,
    }),
    // 신규: 최신순
    prisma.campaign.findMany({
      where: { status: "RECRUITING" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: campaignInclude,
    }),
  ]);

  return NextResponse.json({ premium, deadline, newest });
}
