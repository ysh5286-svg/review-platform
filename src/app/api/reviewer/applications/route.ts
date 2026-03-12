import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { reviewerId: session.user.id },
    include: {
      campaign: {
        select: {
          id: true,
          campaignNumber: true,
          title: true,
          platform: true,
          contentType: true,
          businessName: true,
          status: true,
          pointReward: true,
          startDate: true,
          endDate: true,
          imageUrl: true,
          maxReviewers: true,
          _count: {
            select: { applications: true },
          },
        },
      },
      review: {
        select: {
          id: true,
          status: true,
          reviewUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}
