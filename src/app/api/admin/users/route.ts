import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (adminUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roleFilter = new URL(request.url).searchParams.get("role");
  const where: Record<string, unknown> = {};
  if (roleFilter) where.role = roleFilter;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      role: true,
      phone: true,
      points: true,
      createdAt: true,
      blogUrl: true,
      blogVerified: true,
      instagramId: true,
      instagramVerified: true,
      youtubeUrl: true,
      youtubeVerified: true,
      tiktokId: true,
      tiktokVerified: true,
      businessName: true,
      grade: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
