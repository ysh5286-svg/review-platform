"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface GradeInfo {
  currentGrade: string;
  calculatedGrade: string;
  stats: {
    totalReviews: number;
    approvedReviews: number;
    approvalRate: number;
    topRankCount: number;
    topRate: number;
  };
  requirements: Record<string, { minReviews: number; minApprovalRate: number; minTopRate: number; label: string }>;
  benefits: { pointBonus: number; prioritySelection: boolean; maxApplications: number };
}

const GRADE_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  BEGINNER: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300", icon: "⚪" },
  STANDARD: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", icon: "🥉" },
  INTERMEDIATE: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", icon: "🥈" },
  ADVANCED: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", icon: "🥇" },
  PREMIUM: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", icon: "💎" },
  INFLUENCER: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", icon: "🅝" },
};

export default function GradePage() {
  const { data: session } = useSession();
  const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchGrade();
  }, []);

  async function fetchGrade() {
    try {
      const res = await fetch("/api/reviewer/grade");
      if (res.ok) {
        setGradeInfo(await res.json());
      }
    } catch (error) {
      console.error("등급 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  async function recalculateGrade() {
    setRecalculating(true);
    try {
      const res = await fetch("/api/reviewer/grade", { method: "POST" });
      if (res.ok) {
        await fetchGrade();
      }
    } catch (error) {
      console.error("등급 재산정 실패:", error);
    } finally {
      setRecalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!gradeInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">등급 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const currentStyle = GRADE_STYLES[gradeInfo.currentGrade] || GRADE_STYLES.BEGINNER;
  const grades = ["BEGINNER", "STANDARD", "INTERMEDIATE", "ADVANCED", "PREMIUM", "INFLUENCER"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">내 등급</h1>
        <Link href="/reviewer/applications" className="text-sm text-gray-500 hover:text-gray-700">
          ← 대시보드
        </Link>
      </div>

      {/* 현재 등급 카드 */}
      <div className={`${currentStyle.bg} ${currentStyle.border} border-2 rounded-2xl p-8 mb-8`}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{currentStyle.icon}</span>
          <div>
            <p className="text-sm text-gray-500">현재 등급</p>
            <p className={`text-3xl font-bold ${currentStyle.text}`}>
              {gradeInfo.requirements[gradeInfo.currentGrade]?.label}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/70 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{gradeInfo.stats.totalReviews}</p>
            <p className="text-xs text-gray-500 mt-1">총 리뷰</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{gradeInfo.stats.approvalRate}%</p>
            <p className="text-xs text-gray-500 mt-1">승인율</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{gradeInfo.stats.topRate}%</p>
            <p className="text-xs text-gray-500 mt-1">상위노출률</p>
          </div>
        </div>
      </div>

      {/* 현재 혜택 */}
      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">내 등급 혜택</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500">💰</span>
            <div>
              <p className="text-sm font-medium text-gray-900">포인트 보너스</p>
              <p className="text-sm text-gray-500">리뷰 승인 시 +{gradeInfo.benefits.pointBonus}% 추가 적립</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500">📋</span>
            <div>
              <p className="text-sm font-medium text-gray-900">동시 신청</p>
              <p className="text-sm text-gray-500">최대 {gradeInfo.benefits.maxApplications}개 캠페인 동시 신청 가능</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500">⚡</span>
            <div>
              <p className="text-sm font-medium text-gray-900">우선 선정</p>
              <p className="text-sm text-gray-500">
                {gradeInfo.benefits.prioritySelection
                  ? "광고주에게 우선 선정 뱃지가 표시됩니다"
                  : "고급 등급부터 적용됩니다"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 등급 체계 */}
      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">등급 체계</h2>
        <div className="space-y-4">
          {grades.map((grade) => {
            const style = GRADE_STYLES[grade];
            const req = gradeInfo.requirements[grade];
            const isCurrent = grade === gradeInfo.currentGrade;
            return (
              <div
                key={grade}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                  isCurrent ? `${style.border} ${style.bg}` : "border-gray-100 bg-gray-50"
                }`}
              >
                <span className="text-2xl">{style.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${isCurrent ? style.text : "text-gray-700"}`}>
                      {req.label}
                    </p>
                    {isCurrent && (
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border font-medium">
                        현재
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    리뷰 {req.minReviews}건 이상
                    {req.minApprovalRate > 0 && ` · 승인율 ${req.minApprovalRate}%`}
                    {req.minTopRate > 0 && ` · 상위노출 ${req.minTopRate}%`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 등급 재산정 버튼 */}
      {gradeInfo.currentGrade !== gradeInfo.calculatedGrade && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-sm text-red-700 mb-3">
            현재 활동 기준으로 <strong>{gradeInfo.requirements[gradeInfo.calculatedGrade]?.label}</strong> 등급으로 업그레이드할 수 있습니다!
          </p>
          <button
            onClick={recalculateGrade}
            disabled={recalculating}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {recalculating ? "재산정 중..." : "등급 업그레이드"}
          </button>
        </div>
      )}
    </div>
  );
}
