import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    role,
    name,
    phone,
    blogUrl,
    instagramId,
    youtubeUrl,
    tiktokId,
    businessName,
    businessCategory,
  } = body;

  if (!role || !name || !phone) {
    return NextResponse.json(
      { error: "필수 정보를 입력해주세요" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      role,
      name,
      phone,
      onboarded: true,
      blogUrl: blogUrl || null,
      instagramId: instagramId || null,
      youtubeUrl: youtubeUrl || null,
      tiktokId: tiktokId || null,
      businessName: businessName || null,
      businessCategory: businessCategory || null,
    },
  });

  return NextResponse.json({ success: true });
}
