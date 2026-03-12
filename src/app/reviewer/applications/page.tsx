"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  campaign: {
    id: string;
    campaignNumber: number;
    title: string;
    platform: string;
    contentType: string;
    businessName: string;
    pointReward: number;
    status: string;
    startDate: string;
    endDate: string;
    imageUrl: string | null;
    maxReviewers: number;
    _count: { applications: number };
  };
  review: {
    id: string;
    status: string;
    reviewUrl: string;
  } | null;
}

type FilterTab = "all" | "pending" | "accepted" | "review" | "completed";

const PLATFORM_ICONS: Record<string, { icon: string; label: string }> = {
  NAVER_BLOG: { icon: "📝", label: "블로그" },
  INSTAGRAM: { icon: "📸", label: "인스타" },
  SHORT_FORM: { icon: "🎬", label: "숏폼" },
};

const CONTENT_LABELS: Record<string, string> = {
  BLOG_REVIEW: "블로그리뷰",
  INSTAGRAM_POST: "인스타포스트",
  INSTAGRAM_REEL: "릴스",
  YOUTUBE_SHORTS: "쇼츠",
  TIKTOK: "틱톡",
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  RECRUITING: "모집중",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  CLOSED: "마감",
};

export default function ReviewerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    fetch("/api/reviewer/applications")
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 필터링
  const filtered = applications.filter((app) => {
    if (filter === "all") return true;
    if (filter === "pending") return app.status === "PENDING";
    if (filter === "accepted") return app.status === "ACCEPTED" && !app.review;
    if (filter === "review") return app.status === "ACCEPTED" && app.review && app.review.status !== "APPROVED";
    if (filter === "completed") return app.review?.status === "APPROVED";
    return true;
  });

  // 카운트
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED" && !a.review).length,
    review: applications.filter((a) => a.status === "ACCEPTED" && a.review && a.review.status !== "APPROVED").length,
    completed: applications.filter((a) => a.review?.status === "APPROVED").length,
  };

  function getStatusInfo(app: Application) {
    if (app.status === "REJECTED") return { label: "미선정", color: "bg-gray-400", textColor: "text-gray-500" };
    if (app.status === "PENDING") return { label: "신청중", color: "bg-yellow-400", textColor: "text-yellow-600" };
    if (app.status === "ACCEPTED" && !app.review) {
      const daysLeft = Math.ceil((new Date(app.campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) return { label: `D-${daysLeft} 리뷰 등록`, color: "bg-blue-500", textColor: "text-blue-600" };
      return { label: "기한 만료", color: "bg-red-500", textColor: "text-red-500" };
    }
    if (app.review?.status === "SUBMITTED") return { label: "검수중", color: "bg-orange-400", textColor: "text-orange-600" };
    if (app.review?.status === "APPROVED") return { label: "등록 완료", color: "bg-green-500", textColor: "text-green-600" };
    if (app.review?.status === "REJECTED") return { label: "리뷰 반려", color: "bg-red-500", textColor: "text-red-500" };
    return { label: "진행중", color: "bg-blue-400", textColor: "text-blue-600" };
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-5">내 체험단</h1>

      {/* 필터 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {([
          { key: "all", label: "전체" },
          { key: "pending", label: "신청중" },
          { key: "accepted", label: "리뷰 대기" },
          { key: "review", label: "검수중" },
          { key: "completed", label: "완료" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              filter === tab.key
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1 ${filter === tab.key ? "text-white/80" : "text-gray-400"}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400 mb-4 text-sm">
            {filter === "all" ? "신청한 체험단이 없습니다" : "해당하는 체험단이 없습니다"}
          </p>
          <Link
            href="/campaigns"
            className="inline-block px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
          >
            캠페인 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((app) => {
            const status = getStatusInfo(app);
            const platform = PLATFORM_ICONS[app.campaign.platform];

            return (
              <Link
                key={app.id}
                href={`/campaigns/${app.campaign.id}`}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 이미지 */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {app.campaign.imageUrl ? (
                    <img
                      src={app.campaign.imageUrl}
                      alt={app.campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                      📷
                    </div>
                  )}

                  {/* 상태 뱃지 */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className={`inline-block ${status.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-lg`}>
                      {status.label}
                    </span>
                  </div>

                  {/* 신청수 (신청중일 때) */}
                  {app.status === "PENDING" && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                      신청 <span className="font-bold">{app.campaign._count.applications}</span> / {app.campaign.maxReviewers}
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-gray-400">#{app.campaign.campaignNumber}</span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {app.campaign.businessName}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                    {app.campaign.title}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-500">
                      {platform?.icon} {platform?.label}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-[10px] text-gray-500">
                      {CONTENT_LABELS[app.campaign.contentType] || app.campaign.contentType}
                    </span>
                  </div>

                  {app.campaign.pointReward > 0 && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {app.campaign.pointReward.toLocaleString()} P
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
