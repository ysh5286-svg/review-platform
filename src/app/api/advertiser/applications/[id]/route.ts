import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { notifySelected, notifyRejected } from "@/lib/notification";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!application || application.campaign.advertiserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  });

  // 알림 발송
  if (status === "ACCEPTED") {
    await notifySelected(application.reviewerId, application.campaign.title, application.campaign.id);
  } else {
    await notifyRejected(application.reviewerId, application.campaign.title);
  }

  return NextResponse.json(updated);
}
