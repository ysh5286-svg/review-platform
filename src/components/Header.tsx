"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-red-500">
            핫플여기체험단
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/campaigns"
              className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
            >
              캠페인 둘러보기
            </Link>

            {session?.user ? (
              <>
                <Link
                  href={dashboardLink}
                  className="text-gray-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
                >
                  대시보드
                </Link>
                <NotificationBell />
                <div className="relative">
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                      <Link
                        href={dashboardLink}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                        onClick={() => setMenuOpen(false)}
                      >
                        대시보드
                      </Link>
                      {session.user.role === "REVIEWER" && (
                        <>
                          <Link
                            href="/reviewer/grade"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                            onClick={() => setMenuOpen(false)}
                          >
                            내 등급
                          </Link>
                          <Link
                            href="/reviewer/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                            onClick={() => setMenuOpen(false)}
                          >
                            내 프로필
                          </Link>
                          <Link
                            href="/reviewer/points"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                            onClick={() => setMenuOpen(false)}
                          >
                            포인트 내역
                          </Link>
                        </>
                      )}
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
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link
              href="/campaigns"
              className="block py-2 text-gray-600"
              onClick={() => setMenuOpen(false)}
            >
              캠페인 둘러보기
            </Link>
            {session?.user ? (
              <>
                <Link
                  href={dashboardLink}
                  className="block py-2 text-gray-600"
                  onClick={() => setMenuOpen(false)}
                >
                  대시보드
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block py-2 text-red-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block py-2 text-red-500"
                onClick={() => setMenuOpen(false)}
              >
                로그인
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
