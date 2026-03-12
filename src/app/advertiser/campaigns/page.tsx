"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  title: string;
  platform: string;
  status: string;
  maxReviewers: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  _count: { applications: number };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  RECRUITING: { label: "모집중", className: "bg-red-100 text-red-600" },
  IN_PROGRESS: { label: "진행중", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-gray-100 text-gray-500" },
  CLOSED: { label: "마감", className: "bg-gray-100 text-gray-500" },
};

const PLATFORM_MAP: Record<string, string> = {
  NAVER_BLOG: "네이버블로그",
  INSTAGRAM: "인스타그램",
  SHORT_FORM: "숏폼영상",
};

export default function AdvertiserCampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/advertiser/campaigns")
      .then((r) => r.json())
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 캠페인 관리</h1>
        <Link
          href="/advertiser/campaigns/new"
          className="px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          새 캠페인 등록
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400 mb-4">등록한 캠페인이 없습니다.</p>
          <Link
            href="/advertiser/campaigns/new"
            className="text-red-500 font-medium hover:underline"
          >
            첫 캠페인을 등록해보세요
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">캠페인명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">플랫폼</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">신청자</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">포인트</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">기간</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/advertiser/campaigns/${c.id}`}
                      className="text-red-500 font-medium hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {PLATFORM_MAP[c.platform] || c.platform}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        STATUS_MAP[c.status]?.className || "bg-gray-100"
                      }`}
                    >
                      {STATUS_MAP[c.status]?.label || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {c._count.applications}/{c.maxReviewers}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {c.pointReward.toLocaleString()}P
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {new Date(c.startDate).toLocaleDateString("ko-KR")} ~{" "}
                    {new Date(c.endDate).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
