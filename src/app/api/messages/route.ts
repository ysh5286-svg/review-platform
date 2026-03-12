import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partnerId");

  if (partnerId) {
    // Get conversation with specific user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, image: true, role: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(messages);
  }

  // Get conversation list (unique partners)
  const sent = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });
  const received = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const partnerIds = [...new Set([
    ...sent.map(m => m.receiverId),
    ...received.map(m => m.senderId),
  ])];

  const conversations = await Promise.all(
    partnerIds.map(async (pid) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: pid },
            { senderId: pid, receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          campaign: { select: { id: true, title: true } },
        },
      });
      const unreadCount = await prisma.message.count({
        where: {
          senderId: pid,
          receiverId: session.user.id,
          read: false,
        },
      });
      const partner = await prisma.user.findUnique({
        where: { id: pid },
        select: { id: true, name: true, image: true, role: true, businessName: true },
      });
      return { partner, lastMessage, unreadCount };
    })
  );

  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId, content, campaignId } = await request.json();

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: "수신자와 내용을 입력해주세요" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content: content.trim(),
      campaignId: campaignId || null,
    },
    include: {
      sender: { select: { id: true, name: true, image: true, role: true } },
      receiver: { select: { id: true, name: true, image: true, role: true } },
    },
  });

  // Create notification for receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: "새 메시지",
      message: `${session.user.name || "사용자"}님이 메시지를 보냈습니다.`,
      link: `/messages?partner=${session.user.id}`,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
