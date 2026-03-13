import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { notifyApplicationReceived, safeNotify } from "@/lib/notification";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, onboarded: true, phone: true },
  });

  if (user?.role !== "REVIEWER") {
    return NextResponse.json(
      { error: "리뷰어만 신청할 수 있습니다" },
      { status: 403 }
    );
  }

  if (!user.onboarded || !user.phone) {
    return NextResponse.json(
      { error: "체험단 신청을 위해 먼저 추가 정보를 입력해주세요" },
      { status: 403 }
    );
  }

  const { campaignId, message } = await request.json();

  if (!campaignId) {
    return NextResponse.json(
      { error: "캠페인 ID가 필요합니다" },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
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
      { error: "캠페인을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  if (campaign.status !== "RECRUITING") {
    return NextResponse.json(
      { error: "모집이 마감된 캠페인입니다" },
      { status: 400 }
    );
  }

  // Check duplicate
  const existing = await prisma.application.findUnique({
    where: {
      campaignId_reviewerId: {
        campaignId,
        reviewerId: session.user.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "이미 신청한 캠페인입니다" },
      { status: 409 }
    );
  }

  const application = await prisma.application.create({
    data: {
      campaignId,
      reviewerId: session.user.id,
      message: message || null,
    },
  });

  // 광고주에게 신청 알림
  await safeNotify(() =>
    notifyApplicationReceived(
      campaign.advertiserId,
      campaign.title,
      session.user.name || "리뷰어",
      campaign.id
    )
  );

  return NextResponse.json(application, { status: 201 });
}
