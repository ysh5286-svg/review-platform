"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user && !session.user.onboarded) {
      router.replace("/auth/onboarding");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (status === "authenticated" && !session?.user?.onboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">추가 정보 입력 페이지로 이동 중...</div>
      </div>
    );
  }

  return <>{children}</>;
}
