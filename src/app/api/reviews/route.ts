import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (session.user.role !== "REVIEWER") {
      return NextResponse.json(
        { error: "리뷰어만 리뷰를 제출할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, reviewUrl } = body;

    if (!applicationId || !reviewUrl) {
      return NextResponse.json(
        { error: "신청 ID와 리뷰 URL은 필수입니다." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { review: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (application.reviewerId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 신청에 대해서만 리뷰를 제출할 수 있습니다." },
        { status: 403 }
      );
    }

    if (application.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "승인된 신청에 대해서만 리뷰를 제출할 수 있습니다." },
        { status: 400 }
      );
    }

    if (application.review) {
      return NextResponse.json(
        { error: "이미 리뷰가 제출되었습니다." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        applicationId,
        reviewerId: session.user.id,
        reviewUrl,
      },
      include: {
        application: {
          include: {
            campaign: { select: { id: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json(
      { error: "리뷰 제출에 실패했습니다." },
      { status: 500 }
    );
  }
}
