"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);      // desktop dropdown
  const [mobileOpen, setMobileOpen] = useState(false);   // mobile menu
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleLabel =
    session?.user?.role === "ADVERTISER"
      ? "사장님"
      : session?.user?.role === "REVIEWER"
        ? "리뷰어"
        : session?.user?.role === "ADMIN"
          ? "관리자"
          : "";

  const dashboardLink =
    session?.user?.role === "ADVERTISER"
      ? "/advertiser/campaigns"
      : session?.user?.role === "REVIEWER"
        ? "/reviewer/applications"
        : session?.user?.role === "ADMIN"
          ? "/admin"
          : "/";

  // Fetch unread message count
  useEffect(() => {
    if (!session?.user) return;
    const fetchUnread = () => {
      fetch("/api/messages/unread")
        .then((r) => r.json())
        .then((data) => setUnreadMessages(data.count || 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-red-500">
            핫플여기체험단
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/campaigns"
              className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
            >
              캠페인
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
            >
              랭킹
            </Link>
            <Link
              href="/guide"
              className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
            >
              이용가이드
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "REVIEWER" && (
                  <Link
                    href="/campaigns/recommended"
                    className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
                  >
                    추천
                  </Link>
                )}
                <Link
                  href={dashboardLink}
                  className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
                >
                  대시보드
                </Link>

                {/* Messages */}
                <Link href="/messages" className="relative text-gray-500 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>

                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-semibold">
                        {session.user.name?.[0] || "U"}
                      </div>
                    )}
                    <span className="text-gray-700 font-medium">
                      {session.user.name}
                    </span>
                    {roleLabel && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        {roleLabel}
                      </span>
                    )}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <Link
                        href={dashboardLink}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                        onClick={() => setMenuOpen(false)}
                      >
                        대시보드
                      </Link>

                      {session.user.role === "REVIEWER" && (
                        <>
                          <Link href="/reviewer/grade" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            내 등급
                          </Link>
                          <Link href="/reviewer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            내 프로필
                          </Link>
                          <Link href="/reviewer/points" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            포인트 내역
                          </Link>
                          <Link href="/campaigns/recommended" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            맞춤 추천
                          </Link>
                        </>
                      )}

                      {session.user.role === "ADVERTISER" && (
                        <>
                          <Link href="/advertiser/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            내 프로필
                          </Link>
                          <Link href="/advertiser/points" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            포인트 관리
                          </Link>
                          <Link href="/advertiser/stats" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                            리뷰 통계
                          </Link>
                        </>
                      )}

                      {session.user.role === "ADMIN" && (
                        <Link href="/admin/charges" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                          충전 관리
                        </Link>
                      )}

                      <Link href="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                        메시지 {unreadMessages > 0 && <span className="text-red-500 text-xs">({unreadMessages})</span>}
                      </Link>

                      <div className="border-t my-1"></div>

                      <Link href="/guide" className="block px-4 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                        이용가이드
                      </Link>
                      <Link href="/faq" className="block px-4 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-150" onClick={() => setMenuOpen(false)}>
                        FAQ · 도움말
                      </Link>

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 hover:shadow-md hover:shadow-red-500/20 active:scale-95 transition-all duration-200"
              >
                로그인
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t space-y-1">
            <Link href="/campaigns" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              캠페인 둘러보기
            </Link>
            <Link href="/leaderboard" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              리뷰어 랭킹
            </Link>
            <Link href="/guide" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              이용가이드
            </Link>
            {session?.user ? (
              <>
                <Link href={dashboardLink} className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  대시보드
                </Link>
                <Link href="/messages" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  메시지 {unreadMessages > 0 && <span className="text-red-500">({unreadMessages})</span>}
                </Link>

                {session.user.role === "REVIEWER" && (
                  <>
                    <Link href="/campaigns/recommended" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>맞춤 추천</Link>
                    <Link href="/reviewer/profile" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>내 프로필</Link>
                    <Link href="/reviewer/grade" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>내 등급</Link>
                    <Link href="/reviewer/points" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>포인트</Link>
                  </>
                )}

                {session.user.role === "ADVERTISER" && (
                  <>
                    <Link href="/advertiser/profile" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>내 프로필</Link>
                    <Link href="/advertiser/points" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>포인트 관리</Link>
                    <Link href="/advertiser/stats" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>리뷰 통계</Link>
                  </>
                )}

                <div className="border-t my-2"></div>
                <Link href="/faq" className="block py-2.5 px-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  FAQ · 도움말
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left py-2.5 px-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="block py-2.5 px-2 text-red-500 font-medium hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                로그인
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
