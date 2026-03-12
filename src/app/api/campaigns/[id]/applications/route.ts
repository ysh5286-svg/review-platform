import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "캠페인을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (campaign.advertiserId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 캠페인 신청 목록만 조회할 수 있습니다." },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { campaignId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
            blogUrl: true,
            instagramId: true,
            youtubeUrl: true,
            tiktokId: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "신청 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (session.user.role !== "REVIEWER") {
      return NextResponse.json(
        { error: "리뷰어만 캠페인에 신청할 수 있습니다." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: { where: { status: "ACCEPTED" } },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "캠페인을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (campaign.status !== "RECRUITING") {
      return NextResponse.json(
        { error: "현재 모집 중인 캠페인이 아닙니다." },
        { status: 400 }
      );
    }

    // Check duplicate application
    const existing = await prisma.application.findUnique({
      where: {
        campaignId_reviewerId: {
          campaignId: id,
          reviewerId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 신청한 캠페인입니다." },
        { status: 409 }
      );
    }

    // Check max reviewers
    if (campaign._count.applications >= campaign.maxReviewers) {
      return NextResponse.json(
        { error: "최대 리뷰어 수에 도달했습니다." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const application = await prisma.application.create({
      data: {
        campaignId: id,
        reviewerId: session.user.id,
        message: body.message,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: "캠페인 신청에 실패했습니다." },
      { status: 500 }
    );
  }
}
