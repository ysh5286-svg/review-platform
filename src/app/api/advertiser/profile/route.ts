import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true, phone: true,
      businessName: true, businessCategory: true, naverPlaceUrl: true, points: true, createdAt: true,
    },
  });

  const campaignCount = await prisma.campaign.count({
    where: { advertiserId: session.user.id },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: session.user.id },
    select: { id: true },
  });
  const campaignIds = campaigns.map((c) => c.id);

  const totalApplications = await prisma.application.count({
    where: { campaignId: { in: campaignIds } },
  });

  const totalReviews = await prisma.review.count({
    where: {
      application: { campaignId: { in: campaignIds } },
      status: "APPROVED",
    },
  });

  return NextResponse.json({
    ...user,
    campaignCount,
    totalApplications,
    totalReviews,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, phone, businessName, businessCategory, naverPlaceUrl } = await request.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone, businessName, businessCategory, naverPlaceUrl },
    select: {
      id: true, name: true, phone: true, businessName: true, businessCategory: true, naverPlaceUrl: true,
    },
  });

  return NextResponse.json(updated);
}
