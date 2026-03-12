"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [role, setRole] = useState<"REVIEWER" | "ADVERTISER" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    phone: "",
    blogUrl: "",
    instagramId: "",
    youtubeUrl: "",
    tiktokId: "",
    businessName: "",
    businessCategory: "",
  });

  // 리뷰어: SNS 최소 1개 입력했는지 확인
  const hasAtLeastOneSNS =
    form.blogUrl.trim() !== "" ||
    form.instagramId.trim() !== "" ||
    form.youtubeUrl.trim() !== "" ||
    form.tiktokId.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("가입 유형을 선택해주세요");
      return;
    }

    if (!form.name.trim()) {
      setError("이름을 입력해주세요");
      return;
    }

    if (!form.phone.trim()) {
      setError("연락처를 입력해주세요");
      return;
    }

    // 전화번호 형식 체크
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(form.phone.replace(/-/g, "").trim())) {
      setError("올바른 연락처를 입력해주세요 (예: 010-1234-5678)");
      return;
    }

    if (role === "REVIEWER" && !hasAtLeastOneSNS) {
      setError("리뷰어는 SNS 계정을 최소 1개 이상 입력해야 합니다");
      return;
    }

    if (role === "ADVERTISER" && !form.businessName.trim()) {
      setError("사업체명을 입력해주세요");
      return;
    }

    if (role === "ADVERTISER" && !form.businessCategory) {
      setError("업종을 선택해주세요");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      if (res.ok) {
        // 세션 갱신
        await update();
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "오류가 발생했습니다");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
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
            체험단 활동을 위해 아래 정보를 입력해주세요
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 역할 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                가입 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("REVIEWER")}
                  className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
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
                  className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
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
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="실명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="010-0000-0000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  체험단 선정 시 연락을 위해 필요합니다
                </p>
              </div>
            </div>

            {/* 리뷰어 추가 정보 */}
            {role === "REVIEWER" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    SNS 계정 <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 mb-3">
                    체험 활동에 사용할 SNS 계정을 최소 1개 이상 입력해주세요
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    네이버 블로그
                  </label>
                  <input
                    type="url"
                    value={form.blogUrl}
                    onChange={(e) =>
                      setForm({ ...form, blogUrl: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://blog.naver.com/아이디"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    인스타그램
                  </label>
                  <input
                    type="text"
                    value={form.instagramId}
                    onChange={(e) =>
                      setForm({ ...form, instagramId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="인스타그램 아이디 (@없이)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    유튜브
                  </label>
                  <input
                    type="url"
                    value={form.youtubeUrl}
                    onChange={(e) =>
                      setForm({ ...form, youtubeUrl: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://youtube.com/@채널명"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    틱톡
                  </label>
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
                {!hasAtLeastOneSNS && (
                  <p className="text-xs text-orange-500 bg-orange-50 p-2 rounded">
                    ⚠️ SNS 계정을 최소 1개 이상 입력해야 합니다
                  </p>
                )}
              </div>
            )}

            {/* 광고주 추가 정보 */}
            {role === "ADVERTISER" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  사업체 정보 <span className="text-red-500">*</span>
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    사업체명
                  </label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) =>
                      setForm({ ...form, businessName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="사업체명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    업종
                  </label>
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
                    <option value="카페">카페</option>
                    <option value="뷰티">뷰티</option>
                    <option value="여행/숙박">여행/숙박</option>
                    <option value="생활/서비스">생활/서비스</option>
                    <option value="패션/잡화">패션/잡화</option>
                    <option value="육아/교육">육아/교육</option>
                    <option value="IT/테크">IT/테크</option>
                    <option value="건강/의료">건강/의료</option>
                    <option value="반려동물">반려동물</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!role || loading}
              className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? "처리 중..." : "시작하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
