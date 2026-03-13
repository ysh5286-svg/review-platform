"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

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
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [session?.user]);

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

                {/* Profile 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
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
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border z-50 py-2">
                        <Link
                          href={dashboardLink}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          마이페이지
                        </Link>
                        <Link
                          href="/messages"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          메시지 {unreadMessages > 0 && <span className="text-red-500 font-medium">({unreadMessages})</span>}
                        </Link>
                        <div className="border-t my-1" />
                        <button
                          onClick={() => { setProfileOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          로그아웃
                        </button>
                      </div>
                    </>
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
                <Link href={dashboardLink} className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>
                  마이페이지
                </Link>
                <Link href="/messages" className="block py-2.5 px-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  메시지 {unreadMessages > 0 && <span className="text-red-500">({unreadMessages})</span>}
                </Link>
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
