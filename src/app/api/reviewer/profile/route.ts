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
      email: true,
      image: true,
      phone: true,
      grade: true,
      blogUrl: true,
      instagramId: true,
      youtubeUrl: true,
      tiktokId: true,
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

  return NextResponse.json({
    ...user,
    approvedReviews,
    acceptedApplications,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, blogUrl, instagramId, youtubeUrl, tiktokId, bankName, bankAccount, accountHolder } = body;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(blogUrl !== undefined && { blogUrl }),
      ...(instagramId !== undefined && { instagramId }),
      ...(youtubeUrl !== undefined && { youtubeUrl }),
      ...(tiktokId !== undefined && { tiktokId }),
      ...(bankName !== undefined && { bankName }),
      ...(bankAccount !== undefined && { bankAccount }),
      ...(accountHolder !== undefined && { accountHolder }),
    },
  });

  return NextResponse.json(updated);
}
