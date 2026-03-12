"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CampaignStat {
  id: string;
  title: string;
  platform: string;
  status: string;
  pointReward: number;
  maxReviewers: number;
  applicants: number;
  accepted: number;
  reviewsSubmitted: number;
  reviewsApproved: number;
  avgRating: number;
  ratingCount: number;
}

interface OverallStats {
  totalCampaigns: number;
  totalApplicants: number;
  totalAccepted: number;
  totalReviewsApproved: number;
  totalPointsSpent: number;
  avgRating: number;
  campaigns: CampaignStat[];
}

const PLATFORM_LABELS: Record<string, string> = {
  NAVER_BLOG: "블로그",
  INSTAGRAM: "인스타",
  SHORT_FORM: "숏폼",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  RECRUITING: { label: "모집중", className: "bg-red-100 text-red-600" },
  IN_PROGRESS: { label: "진행중", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "마감", className: "bg-gray-100 text-gray-500" },
};

export default function AdvertiserStatsPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/advertiser/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-400">로딩중...</div>;
  }

  const conversionRate = stats.totalApplicants > 0
    ? Math.round((stats.totalReviewsApproved / stats.totalApplicants) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">리뷰 통계 대시보드</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
          <p className="text-xs text-gray-500 mt-1">총 캠페인</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalApplicants}</p>
          <p className="text-xs text-gray-500 mt-1">총 신청자</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalAccepted}</p>
          <p className="text-xs text-gray-500 mt-1">선정 인원</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.totalReviewsApproved}</p>
          <p className="text-xs text-gray-500 mt-1">승인 리뷰</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {stats.avgRating > 0 ? `★ ${stats.avgRating}` : "-"}
          </p>
          <p className="text-xs text-gray-500 mt-1">평균 평점</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">전환율</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">전체 진행 현황</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">신청 → 선정</span>
              <span className="text-gray-900 font-medium">
                {stats.totalApplicants > 0 ? Math.round((stats.totalAccepted / stats.totalApplicants) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.totalApplicants > 0 ? (stats.totalAccepted / stats.totalApplicants) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">선정 → 리뷰 승인</span>
              <span className="text-gray-900 font-medium">
                {stats.totalAccepted > 0 ? Math.round((stats.totalReviewsApproved / stats.totalAccepted) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.totalAccepted > 0 ? (stats.totalReviewsApproved / stats.totalAccepted) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign-wise Stats */}
      <h2 className="font-bold text-gray-900 mb-4">캠페인별 통계</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {stats.campaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-400">등록된 캠페인이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">캠페인</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500">플랫폼</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500">상태</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500">신청</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500">선정</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500">리뷰</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500">평점</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/advertiser/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-red-500">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-gray-600">
                    {PLATFORM_LABELS[c.platform] || c.platform}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      STATUS_LABELS[c.status]?.className || "bg-gray-100"
                    }`}>
                      {STATUS_LABELS[c.status]?.label || c.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-700">{c.applicants}</td>
                  <td className="px-3 py-3 text-center text-gray-700">{c.accepted}/{c.maxReviewers}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-green-600 font-medium">{c.reviewsApproved}</span>
                    <span className="text-gray-400">/{c.reviewsSubmitted}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {c.avgRating > 0 ? (
                      <span className="text-yellow-600 font-semibold">★ {c.avgRating}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
