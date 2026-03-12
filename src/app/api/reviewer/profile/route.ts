import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      image: true,
      phone: true,
      grade: true,
      blogUrl: true,
      instagramId: true,
      youtubeUrl: true,
      tiktokId: true,
      blogVerified: true,
      instagramVerified: true,
      youtubeVerified: true,
      tiktokVerified: true,
      bankName: true,
      bankAccount: true,
      accountHolder: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          applications: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const approvedReviews = await prisma.review.count({
    where: { reviewerId: session.user.id, status: "APPROVED" },
  });

  const acceptedApplications = await prisma.application.count({
    where: { reviewerId: session.user.id, status: "ACCEPTED" },
  });

  // 평균 평점
  const avgRating = await prisma.reviewerRating.aggregate({
    where: { reviewerId: session.user.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    ...user,
    approvedReviews,
    acceptedApplications,
    avgRating: avgRating._avg.rating || 0,
    ratingCount: avgRating._count.rating || 0,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name, nickname, phone,
    blogUrl, instagramId, youtubeUrl, tiktokId,
    bankName, bankAccount, accountHolder,
  } = body;

  // 닉네임 중복 체크
  if (nickname !== undefined && nickname.trim()) {
    const existing = await prisma.user.findFirst({
      where: {
        nickname: nickname.trim(),
        id: { not: session.user.id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(nickname !== undefined && { nickname: nickname?.trim() || null }),
      ...(phone !== undefined && { phone }),
      ...(blogUrl !== undefined && { blogUrl, blogVerified: false }),
      ...(instagramId !== undefined && { instagramId: instagramId?.replace(/^@/, "") || null, instagramVerified: false }),
      ...(youtubeUrl !== undefined && { youtubeUrl, youtubeVerified: false }),
      ...(tiktokId !== undefined && { tiktokId: tiktokId?.replace(/^@/, "") || null, tiktokVerified: false }),
      ...(bankName !== undefined && { bankName }),
      ...(bankAccount !== undefined && { bankAccount }),
      ...(accountHolder !== undefined && { accountHolder }),
    },
  });

  return NextResponse.json(updated);
}
