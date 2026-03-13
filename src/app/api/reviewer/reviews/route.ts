import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get accepted applications (with or without reviews)
  const applications = await prisma.application.findMany({
    where: {
      reviewerId: session.user.id,
      status: "ACCEPTED",
    },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          platform: true,
          contentType: true,
          businessName: true,
          pointReward: true,
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId, reviewUrl, storeTags, storeFeedback } = await request.json();

  if (!applicationId || !reviewUrl) {
    return NextResponse.json(
      { error: "applicationId와 reviewUrl이 필요합니다" },
      { status: 400 }
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { review: true },
  });

  if (!application || application.reviewerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (application.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "선정된 캠페인만 리뷰를 제출할 수 있습니다" },
      { status: 400 }
    );
  }

  if (application.review) {
    return NextResponse.json(
      { error: "이미 리뷰를 제출했습니다" },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      applicationId,
      reviewerId: session.user.id,
      reviewUrl,
    },
  });

  // 매장 평가 (선택)
  if (storeTags && Array.isArray(storeTags) && storeTags.length > 0) {
    await prisma.storeRating.create({
      data: {
        reviewerId: session.user.id,
        campaignId: application.campaignId,
        reviewId: review.id,
        tags: JSON.stringify(storeTags.slice(0, 3)),
        feedback: storeFeedback || null,
      },
    });
  }

  return NextResponse.json(review, { status: 201 });
}
