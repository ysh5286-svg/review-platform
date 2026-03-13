import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADVERTISER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reviewerId, type } = await request.json();
  if (!reviewerId || !["FAVORITE", "BLACKLIST"].includes(type)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // 토글: 이미 존재하면 삭제, 없으면 생성
  const existing = await prisma.advertiserReviewerMark.findUnique({
    where: {
      advertiserId_reviewerId_type: {
        advertiserId: session.user.id,
        reviewerId,
        type,
      },
    },
  });

  if (existing) {
    await prisma.advertiserReviewerMark.delete({ where: { id: existing.id } });
    return NextResponse.json({ marked: false, type });
  } else {
    await prisma.advertiserReviewerMark.create({
      data: { advertiserId: session.user.id, reviewerId, type },
    });
    return NextResponse.json({ marked: true, type });
  }
}
