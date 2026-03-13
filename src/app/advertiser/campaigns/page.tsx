"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  campaignNumber: number;
  title: string;
  platform: string;
  contentType: string;
  status: string;
  maxReviewers: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  thumbnailUrl: string | null;
  _count: { applications: number };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  RECRUITING: { label: "모집중", className: "bg-red-500 text-white" },
  IN_PROGRESS: { label: "진행중", className: "bg-yellow-500 text-white" },
  COMPLETED: { label: "완료", className: "bg-gray-400 text-white" },
  CLOSED: { label: "마감", className: "bg-gray-400 text-white" },
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
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/advertiser/campaigns")
      .then((r) => r.json())
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? campaigns : campaigns.filter((c) => c.status === filter);

  const getDday = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "마감";
    if (diff === 0) return "D-Day";
    return `D-${diff}`;
  };

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

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "ALL", label: "전체" },
          { key: "RECRUITING", label: "모집중" },
          { key: "IN_PROGRESS", label: "진행중" },
          { key: "COMPLETED", label: "완료" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.key === "ALL" ? ` ${campaigns.length}` : ` ${campaigns.filter((c) => c.status === tab.key).length}`}
          </button>
        ))}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400">해당 상태의 캠페인이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c) => {
            const status = STATUS_MAP[c.status] || { label: c.status, className: "bg-gray-400 text-white" };
            const dday = getDday(c.endDate);

            return (
              <Link
                key={c.id}
                href={`/advertiser/campaigns/${c.id}`}
                className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* 썸네일 */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {c.thumbnailUrl ? (
                    <Image
                      src={c.thumbnailUrl}
                      alt={c.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* 상태 뱃지 */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                    {c.status === "RECRUITING" && dday !== "마감" && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">
                        {dday}
                      </span>
                    )}
                  </div>

                  {/* 신청자 수 */}
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white">
                      {c._count.applications}/{c.maxReviewers}명
                    </span>
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] text-gray-400">#{c.campaignNumber}</span>
                    <span className="text-[11px] text-red-400 font-medium">
                      {PLATFORM_MAP[c.platform] || c.platform}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">
                    {c.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ~{new Date(c.endDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                    {c.pointReward > 0 && (
                      <span className="text-xs font-bold text-red-500">
                        {c.pointReward.toLocaleString()}P
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
