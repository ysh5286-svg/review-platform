import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Platform, ContentType, CampaignStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") as Platform | null;
    const contentType = searchParams.get("contentType") as ContentType | null;
    const category = searchParams.get("category");
    const status = searchParams.get("status") as CampaignStatus | null;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (platform) where.platform = platform;
    if (contentType) where.contentType = contentType;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { businessName: { contains: search } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        advertiser: {
          select: { id: true, name: true, image: true, businessName: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json(
      { error: "캠페인 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (session.user.role !== "ADVERTISER") {
      return NextResponse.json(
        { error: "광고주만 캠페인을 생성할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      platform,
      contentType,
      imageUrl,
      businessName,
      businessAddress,
      offerDetails,
      requirements,
      pointReward,
      maxReviewers,
      startDate,
      endDate,
    } = body;

    if (!title || !description || !category || !platform || !contentType || !businessName || !offerDetails || !maxReviewers || !startDate || !endDate) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        category,
        platform,
        contentType,
        imageUrl,
        businessName,
        businessAddress,
        offerDetails,
        requirements,
        pointReward: pointReward ?? 0,
        maxReviewers,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        advertiserId: session.user.id,
      },
      include: {
        advertiser: {
          select: { id: true, name: true, image: true, businessName: true },
        },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { error: "캠페인 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
