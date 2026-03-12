"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  title: string;
  platform: string;
  contentType: string;
  category: string;
  businessName: string;
  offerDetails: string;
  pointReward: number;
  maxReviewers: number;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  advertiser: { businessName: string | null };
  _count: { applications: number };
}

const PLATFORM_BADGE: Record<string, { label: string; className: string }> = {
  NAVER_BLOG: { label: "네이버블로그", className: "bg-green-100 text-green-700" },
  INSTAGRAM: { label: "인스타그램", className: "bg-pink-100 text-pink-700" },
  SHORT_FORM: { label: "숏폼영상", className: "bg-purple-100 text-purple-700" },
};

export default function RecommendedCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns/recommended")
      .then((r) => r.json())
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">추천 캠페인을 불러오는 중...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">맞춤 추천 캠페인</h1>
          <p className="text-sm text-gray-500 mt-1">회원님의 SNS 채널과 활동 이력을 기반으로 추천합니다.</p>
        </div>
        <Link href="/campaigns" className="text-sm text-gray-500 hover:text-red-500">
          전체 캠페인 보기 →
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400 mb-4">추천 가능한 캠페인이 없습니다.</p>
          <Link href="/campaigns" className="text-red-500 hover:underline text-sm">
            전체 캠페인 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="bg-white rounded-xl border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-200 transition-all duration-300 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    PLATFORM_BADGE[campaign.platform]?.className || "bg-gray-100"
                  }`}>
                    {PLATFORM_BADGE[campaign.platform]?.label || campaign.platform}
                  </span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">모집중</span>
                  <span className="text-xs text-gray-400">{campaign.category}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{campaign.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{campaign.advertiser.businessName || campaign.businessName}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{campaign.offerDetails}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-500 font-semibold">{campaign.pointReward.toLocaleString()}P</span>
                  <span className="text-gray-400">{campaign._count.applications}/{campaign.maxReviewers}명</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
