import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Platform, ContentType, CampaignStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") as Platform | null;
    const channel = searchParams.get("channel"); // contentType or platform
    const contentType = searchParams.get("contentType") as ContentType | null;
    const category = searchParams.get("category");
    const status = searchParams.get("status") as CampaignStatus | null;
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";
    const regions = searchParams.get("regions"); // comma separated
    const campaignType = searchParams.get("type"); // 방문형, 배송형 etc

    const where: Record<string, unknown> = {};

    if (platform) where.platform = platform;
    // channel maps to platform or contentType
    if (channel) {
      const channelToPlatform: Record<string, string> = {
        NAVER_BLOG: "NAVER_BLOG",
        INSTAGRAM: "INSTAGRAM",
        SHORT_FORM: "SHORT_FORM",
      };
      const channelToContent: Record<string, string> = {
        YOUTUBE_SHORTS: "YOUTUBE_SHORTS",
        INSTAGRAM_REEL: "INSTAGRAM_REEL",
        TIKTOK: "TIKTOK",
      };
      if (channelToPlatform[channel]) {
        where.platform = channelToPlatform[channel];
      } else if (channelToContent[channel]) {
        where.contentType = channelToContent[channel];
      }
    }
    if (contentType) where.contentType = contentType;
    if (category) where.category = category;
    if (status) where.status = status;

    // 지역 필터 (businessAddress 또는 title에서 지역 검색)
    if (regions) {
      const regionList = regions.split(",").filter(Boolean);
      if (regionList.length > 0) {
        where.OR = regionList.map((r: string) => ({
          OR: [
            { businessAddress: { contains: r } },
            { title: { contains: r } },
            { description: { contains: r } },
          ],
        }));
      }
    }

    // 유형 필터 (title 또는 description에서 매칭)
    if (campaignType) {
      const typeFilter = {
        OR: [
          { title: { contains: campaignType } },
          { description: { contains: campaignType } },
          { offerDetails: { contains: campaignType } },
        ],
      };
      if (where.OR) {
        where.AND = [{ OR: where.OR as unknown[] }, typeFilter];
        delete where.OR;
      } else {
        where.OR = typeFilter.OR;
      }
    }

    if (search) {
      // #번호 검색 지원
      const numSearch = search.replace(/^#/, "");
      const searchNum = parseInt(numSearch);
      const searchFilter: Record<string, unknown>[] = [
        { title: { contains: search } },
        { description: { contains: search } },
        { businessName: { contains: search } },
      ];
      if (!isNaN(searchNum) && numSearch === String(searchNum)) {
        searchFilter.push({ campaignNumber: searchNum });
      }
      if (where.AND) {
        (where.AND as unknown[]).push({ OR: searchFilter });
      } else if (where.OR && !campaignType) {
        where.AND = [{ OR: where.OR as unknown[] }, { OR: searchFilter }];
        delete where.OR;
      } else {
        where.OR = searchFilter;
      }
    }

    // 페이지네이션
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 정렬
    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "deadline") orderBy = { endDate: "asc" };
    if (sort === "popular") orderBy = { maxReviewers: "desc" };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          advertiser: {
            select: { id: true, name: true, image: true, businessName: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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
