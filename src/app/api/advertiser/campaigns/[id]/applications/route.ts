import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id, advertiserId: session.user.id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { campaignId: id },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          blogUrl: true,
          instagramId: true,
          youtubeUrl: true,
          tiktokId: true,
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}
