"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const REVIEWER_MENU = [
  { label: "나의 신청", path: "/reviewer/applications", icon: "📋" },
  { label: "나의 리뷰", path: "/reviewer/reviews", icon: "✏️" },
  { label: "내 등급", path: "/reviewer/grade", icon: "⭐" },
  { label: "포인트 내역", path: "/reviewer/points", icon: "💰" },
  { label: "출금 신청", path: "/reviewer/withdraw", icon: "🏦" },
  { label: "내 프로필", path: "/reviewer/profile", icon: "👤" },
];

const ADVERTISER_MENU = [
  { label: "내 캠페인", path: "/advertiser/campaigns", icon: "📢" },
  { label: "내 플레이스", path: "/advertiser/profile#place", icon: "📍" },
  { label: "내 프로필", path: "/advertiser/profile", icon: "👤" },
  { label: "포인트 관리", path: "/advertiser/points", icon: "💰" },
  { label: "리뷰 통계", path: "/advertiser/stats", icon: "📊" },
];

const ADMIN_MENU = [
  { label: "대시보드", path: "/admin", icon: "📊" },
  { label: "회원 관리", path: "/admin/users", icon: "👥" },
  { label: "캠페인 관리", path: "/admin/campaigns", icon: "📢" },
  { label: "포인트 관리", path: "/admin/points", icon: "💰" },
  { label: "출금 관리", path: "/admin/withdrawals", icon: "🏦" },
  { label: "신고 관리", path: "/admin/reports", icon: "🚨" },
  { label: "설정", path: "/admin/settings", icon: "⚙️" },
];

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = session?.user?.role;
  const menu = role === "ADMIN" ? ADMIN_MENU : role === "ADVERTISER" ? ADVERTISER_MENU : REVIEWER_MENU;
  const roleLabel = role === "ADVERTISER" ? "사장님" : role === "REVIEWER" ? "리뷰어" : role === "ADMIN" ? "관리자" : "";

  // 라우트 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* 사용자 정보 */}
      <div className="p-5 border-b">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={44}
              height={44}
              className="rounded-full"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">
              {session?.user?.name?.[0] || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {session?.user?.name || "사용자"}
            </p>
            {roleLabel && (
              <span className="inline-block text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded mt-0.5">
                {roleLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-3 space-y-1">
        {menu.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-red-50 text-red-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="p-3 border-t">
        <Link
          href="/campaigns"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <span className="text-base">{"🔍"}</span>
          <span>캠페인 탐색</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors w-full cursor-pointer"
        >
          <span className="text-base">{"🚪"}</span>
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-30 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
        aria-label="메뉴 열기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:block w-60 bg-white border-r shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
