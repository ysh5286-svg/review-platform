"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    platform: string;
    businessName: string;
    pointReward: number;
    status: string;
  };
}

const APP_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "심사중", className: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "선정됨", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "미선정", className: "bg-red-100 text-red-700" },
};

const PLATFORM_MAP: Record<string, { label: string; className: string }> = {
  NAVER_BLOG: { label: "네이버블로그", className: "bg-green-100 text-green-700" },
  INSTAGRAM: { label: "인스타그램", className: "bg-pink-100 text-pink-700" },
  SHORT_FORM: { label: "숏폼영상", className: "bg-purple-100 text-purple-700" },
};

export default function ReviewerApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviewer/applications")
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 신청 내역</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400 mb-4">신청한 캠페인이 없습니다.</p>
          <Link href="/campaigns" className="text-red-500 font-medium hover:underline">
            캠페인 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        PLATFORM_MAP[app.campaign.platform]?.className || "bg-gray-100"
                      }`}
                    >
                      {PLATFORM_MAP[app.campaign.platform]?.label || app.campaign.platform}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        APP_STATUS[app.status]?.className || "bg-gray-100"
                      }`}
                    >
                      {APP_STATUS[app.status]?.label || app.status}
                    </span>
                  </div>
                  <Link
                    href={`/campaigns/${app.campaign.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-red-500"
                  >
                    {app.campaign.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{app.campaign.businessName}</p>
                  {app.message && (
                    <p className="text-sm text-gray-400 mt-1">내 메시지: {app.message}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-red-500 font-bold">
                    {app.campaign.pointReward.toLocaleString()}P
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(app.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
