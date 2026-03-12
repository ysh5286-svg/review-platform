"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // 온보딩 안 된 사용자 → 온보딩
      if (!session.user.onboarded) {
        router.replace("/auth/onboarding");
        return;
      }
      // 역할별 대시보드로 리다이렉트
      if (session.user.role === "ADVERTISER") {
        router.replace("/advertiser/campaigns");
      } else if (session.user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/reviewer/applications");
      }
    }
  }, [session, status, router]);

  // 로딩 중
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  // 이미 로그인 → 리다이렉트 중
  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">리다이렉트 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">핫플여기체험단</h1>
            <p className="mt-2 text-gray-500">
              체험단 매칭 플랫폼에 오신 것을 환영합니다
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md hover:border-gray-400 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Google로 시작하기
              </span>
            </button>

            <button
              onClick={() => signIn("kakao", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-xl hover:bg-[#FDD835] hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.38 6.24l-1.12 4.16a.37.37 0 0 0 .56.4l4.72-3.12c.48.06.96.1 1.46.1 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                카카오로 시작하기
              </span>
            </button>

            <button
              onClick={() => signIn("naver", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] rounded-xl hover:bg-[#02b351] hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#FFFFFF"
                  d="M16.27 12.97L7.44 3H3v18h4.73V11.03L16.56 21H21V3h-4.73z"
                />
              </svg>
              <span className="text-sm font-medium text-white">
                네이버로 시작하기
              </span>
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            로그인 시 서비스 이용약관에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
}
