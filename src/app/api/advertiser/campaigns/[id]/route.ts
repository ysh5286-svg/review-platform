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
    include: {
      _count: { select: { applications: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.campaign.findUnique({
    where: { id, advertiserId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const {
    title, description, category, platform, contentType, imageUrl,
    businessName, businessAddress, offerDetails, requirements,
    pointReward, maxReviewers, startDate, endDate, status,
  } = body;

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(platform !== undefined && { platform }),
      ...(contentType !== undefined && { contentType }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(businessName !== undefined && { businessName }),
      ...(businessAddress !== undefined && { businessAddress }),
      ...(offerDetails !== undefined && { offerDetails }),
      ...(requirements !== undefined && { requirements }),
      ...(pointReward !== undefined && { pointReward }),
      ...(maxReviewers !== undefined && { maxReviewers }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.campaign.findUnique({
    where: { id, advertiserId: session.user.id },
    include: { _count: { select: { applications: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.campaign.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
