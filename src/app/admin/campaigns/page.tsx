"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  title: string;
  platform: string;
  category: string;
  status: string;
  businessName: string;
  maxReviewers: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  advertiser: { name: string | null; email: string | null };
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

export default function AdminCampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">캠페인 관리</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-500">총 {campaigns.length}개</p>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-400">캠페인이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">캠페인명</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">광고주</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">플랫폼</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">신청자</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">포인트</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">기간</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="text-red-500 font-medium hover:underline"
                      >
                        {c.title}
                      </Link>
                      <p className="text-xs text-gray-400">{c.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{c.advertiser.name || "이름 없음"}</p>
                      <p className="text-xs text-gray-400">{c.advertiser.email}</p>
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
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(c.startDate).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(c.endDate).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
