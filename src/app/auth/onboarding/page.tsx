"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"REVIEWER" | "ADVERTISER" | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    blogUrl: "",
    instagramId: "",
    youtubeUrl: "",
    tiktokId: "",
    businessName: "",
    businessCategory: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            추가 정보 입력
          </h1>
          <p className="text-gray-500 text-center mb-8">
            서비스 이용을 위해 추가 정보를 입력해주세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 역할 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                가입 유형
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("REVIEWER")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === "REVIEWER"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">✍️</div>
                  <div className="font-semibold">체험단 (리뷰어)</div>
                  <div className="text-xs text-gray-500 mt-1">
                    리뷰를 작성하고 포인트를 적립해요
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADVERTISER")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === "ADVERTISER"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🏪</div>
                  <div className="font-semibold">사장님 (광고주)</div>
                  <div className="text-xs text-gray-500 mt-1">
                    체험단을 모집하고 리뷰를 받아요
                  </div>
                </button>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            {/* 리뷰어 추가 정보 */}
            {role === "REVIEWER" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  SNS 계정 (선택)
                </h3>
                <input
                  type="url"
                  value={form.blogUrl}
                  onChange={(e) =>
                    setForm({ ...form, blogUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="네이버 블로그 URL"
                />
                <input
                  type="text"
                  value={form.instagramId}
                  onChange={(e) =>
                    setForm({ ...form, instagramId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="인스타그램 아이디 (@없이)"
                />
                <input
                  type="url"
                  value={form.youtubeUrl}
                  onChange={(e) =>
                    setForm({ ...form, youtubeUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="유튜브 채널 URL"
                />
                <input
                  type="text"
                  value={form.tiktokId}
                  onChange={(e) =>
                    setForm({ ...form, tiktokId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="틱톡 아이디"
                />
              </div>
            )}

            {/* 광고주 추가 정보 */}
            {role === "ADVERTISER" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  사업체 정보
                </h3>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="사업체명"
                />
                <select
                  required
                  value={form.businessCategory}
                  onChange={(e) =>
                    setForm({ ...form, businessCategory: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">업종 선택</option>
                  <option value="맛집">맛집</option>
                  <option value="뷰티">뷰티</option>
                  <option value="여행">여행</option>
                  <option value="생활">생활</option>
                  <option value="패션">패션</option>
                  <option value="육아">육아</option>
                  <option value="IT/테크">IT/테크</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={!role || loading}
              className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "처리 중..." : "시작하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
