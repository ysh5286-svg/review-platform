"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function StartButton() {
  const { data: session } = useSession();

  // 로그인 안 된 상태 → 로그인 페이지
  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        무료로 시작하기
      </Link>
    );
  }

  // 온보딩 안 된 상태 → 온보딩 페이지
  if (!session.user.onboarded) {
    return (
      <Link
        href="/auth/onboarding"
        className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        시작하기
      </Link>
    );
  }

  // 역할별 대시보드로 이동
  const dashboardLink =
    session.user.role === "ADVERTISER"
      ? "/advertiser/campaigns"
      : session.user.role === "ADMIN"
        ? "/admin"
        : "/reviewer/applications";

  const label =
    session.user.role === "ADVERTISER"
      ? "캠페인 관리하기"
      : session.user.role === "ADMIN"
        ? "관리자 대시보드"
        : "내 신청 내역";

  return (
    <Link
      href={dashboardLink}
      className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
    >
      {label}
    </Link>
  );
}
