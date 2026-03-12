import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@/generated/prisma/client";

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

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (application.campaign.advertiserId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 캠페인 신청만 처리할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body as { status: ApplicationStatus };

    if (status !== "ACCEPTED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다. ACCEPTED 또는 REJECTED만 가능합니다." },
        { status: 400 }
      );
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true },
        },
        campaign: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "신청 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
