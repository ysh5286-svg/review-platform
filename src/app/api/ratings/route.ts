import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reviewId, rating, comment } = await request.json();

  if (!reviewId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "유효하지 않은 평가입니다" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      application: {
        include: { campaign: { select: { advertiserId: true } } },
      },
    },
  });

  if (!review || review.application.campaign.advertiserId !== session.user.id) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  if (review.status !== "APPROVED") {
    return NextResponse.json({ error: "승인된 리뷰만 평가할 수 있습니다" }, { status: 400 });
  }

  const ratingRecord = await prisma.reviewerRating.upsert({
    where: { advertiserId_reviewId: { advertiserId: session.user.id, reviewId } },
    create: {
      advertiserId: session.user.id,
      reviewerId: review.reviewerId,
      reviewId,
      rating,
      comment,
    },
    update: { rating, comment },
  });

  return NextResponse.json(ratingRecord, { status: 201 });
}
