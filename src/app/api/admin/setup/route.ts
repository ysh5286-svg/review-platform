import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 임시 관리자 설정 API - 설정 후 삭제할 것
export async function POST(request: Request) {
  const { email, secret } = await request.json();

  // 간단한 보안 키
  if (secret !== "hotplace-admin-setup-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN", onboarded: true },
  });

  return NextResponse.json({ success: true, name: user.name, email: user.email, role: "ADMIN" });
}
