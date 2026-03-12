import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        advertiser: {
          select: { id: true, name: true, image: true, businessName: true },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "캠페인을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return NextResponse.json(
      { error: "캠페인을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // 관리자 또는 본인만 수정 가능
    if (campaign.advertiserId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "본인의 캠페인만 수정할 수 있습니다." },
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
      status,
    } = body;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(platform !== undefined && { platform }),
        ...(contentType !== undefined && { contentType }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(businessName !== undefined && { businessName }),
        ...(businessAddress !== undefined && { businessAddress }),
        ...(offerDetails !== undefined && { offerDetails }),
        ...(requirements !== undefined && { requirements }),
        ...(pointReward !== undefined && { pointReward }),
        ...(maxReviewers !== undefined && { maxReviewers }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(status !== undefined && { status }),
      },
      include: {
        advertiser: {
          select: { id: true, name: true, image: true, businessName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json(
      { error: "캠페인 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      include: { _count: { select: { applications: true } } },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "캠페인을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관리자 또는 본인만 삭제 가능
    if (campaign.advertiserId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "본인의 캠페인만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 관련 데이터 삭제 (리뷰 → 신청 → 캠페인 순서)
    await prisma.review.deleteMany({
      where: { application: { campaignId: id } },
    });
    await prisma.application.deleteMany({
      where: { campaignId: id },
    });
    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return NextResponse.json(
      { error: "캠페인 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
