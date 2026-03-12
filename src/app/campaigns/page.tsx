"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  contentType: string;
  imageUrl: string | null;
  businessName: string;
  businessAddress: string | null;
  offerDetails: string;
  pointReward: number;
  maxReviewers: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  advertiser: { businessName: string | null };
  _count: { applications: number };
}

/* ===== 필터 옵션 ===== */
const REGIONS = [
  "재택", "기자단", "당일지급",
  "서울", "경기", "인천", "강원", "대전", "세종", "충남",
  "충북", "부산", "울산", "경남", "경북", "대구", "광주", "전남", "전북", "제주",
];

const CATEGORIES = [
  { value: "", label: "카테고리" },
  { value: "맛집", label: "맛집" },
  { value: "식품", label: "식품" },
  { value: "뷰티", label: "뷰티" },
  { value: "여행", label: "여행" },
  { value: "생활", label: "생활" },
  { value: "패션", label: "패션" },
  { value: "디지털", label: "디지털" },
  { value: "반려동물", label: "반려동물" },
  { value: "육아", label: "육아" },
  { value: "IT/테크", label: "IT/테크" },
  { value: "기타", label: "기타" },
];

const CHANNELS = [
  { value: "", label: "채널" },
  { value: "NAVER_BLOG", label: "블로그" },
  { value: "INSTAGRAM", label: "인스타그램" },
  { value: "YOUTUBE_SHORTS", label: "유튜브" },
  { value: "INSTAGRAM_REEL", label: "릴스" },
  { value: "TIKTOK", label: "틱톡" },
  { value: "SHORT_FORM", label: "쇼츠" },
];

const TYPES = [
  { value: "", label: "유형" },
  { value: "방문형", label: "방문형" },
  { value: "구매형", label: "구매형" },
  { value: "배송형", label: "배송형" },
  { value: "기자단", label: "기자단" },
  { value: "포장", label: "포장" },
];

const SORTS = [
  { value: "latest", label: "최신순" },
  { value: "deadline", label: "마감임박순" },
  { value: "popular", label: "인기순" },
];

const PLATFORM_ICONS: Record<string, string> = {
  NAVER_BLOG: "📝",
  INSTAGRAM: "📸",
  SHORT_FORM: "🎬",
};

const CONTENT_LABELS: Record<string, string> = {
  BLOG_REVIEW: "블로그",
  INSTAGRAM_POST: "인스타포스트",
  INSTAGRAM_REEL: "릴스",
  YOUTUBE_SHORTS: "쇼츠",
  TIKTOK: "틱톡",
};

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">로딩중...</div>}>
      <CampaignsContent />
    </Suspense>
  );
}

function CampaignsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [channel, setChannel] = useState(searchParams.get("channel") || "");
  const [campaignType, setCampaignType] = useState(searchParams.get("type") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (channel) params.set("channel", channel);
      if (campaignType) params.set("type", campaignType);
      if (sort) params.set("sort", sort);
      if (selectedRegions.length > 0) params.set("regions", selectedRegions.join(","));

      const res = await fetch(`/api/campaigns?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [search, category, channel, campaignType, sort, selectedRegions]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  function toggleRegion(region: string) {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCampaigns();
  }

  function getDaysLeft(endDate: string) {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 검색바 */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="어떤 체험단을 찾고 있나요?"
            className="w-full px-5 py-3.5 pr-12 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* 지역 태그 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-gray-800">지역</span>
          <span className="text-xs text-gray-400">▼</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {REGIONS.map((region) => {
            const isSelected = selectedRegions.includes(region);
            return (
              <button
                key={region}
                onClick={() => toggleRegion(region)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500"
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* 드롭다운 필터 */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <FilterSelect
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
        />
        <FilterSelect
          options={CHANNELS}
          value={channel}
          onChange={setChannel}
        />
        <FilterSelect
          options={TYPES}
          value={campaignType}
          onChange={setCampaignType}
        />
        <div className="ml-auto">
          <FilterSelect
            options={SORTS}
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>

      {/* 결과 수 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          총 <span className="font-bold text-gray-900">{campaigns.length}</span>개 캠페인
        </p>
        {(selectedRegions.length > 0 || category || channel || campaignType) && (
          <button
            onClick={() => {
              setSelectedRegions([]);
              setCategory("");
              setChannel("");
              setCampaignType("");
              setSearch("");
            }}
            className="text-xs text-red-500 hover:underline cursor-pointer"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 캠페인 카드 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-400 text-sm">조건에 맞는 캠페인이 없습니다</p>
          <p className="text-gray-300 text-xs mt-1">필터를 변경하거나 검색어를 수정해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {campaigns.map((campaign) => {
            const daysLeft = getDaysLeft(campaign.endDate);
            const isRecruiting = campaign.status === "RECRUITING";

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* 이미지 */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {campaign.imageUrl ? (
                    <Image
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                      📷
                    </div>
                  )}

                  {/* 상태 뱃지 */}
                  {isRecruiting && daysLeft > 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {daysLeft}일 남음
                      </span>
                      <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                        신청 <span className="font-bold">{campaign._count.applications}</span> / {campaign.maxReviewers}
                      </span>
                    </div>
                  )}

                  {!isRecruiting && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {campaign.status === "IN_PROGRESS" ? "진행중" : campaign.status === "COMPLETED" ? "완료" : "마감"}
                      </span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-3">
                  {/* 플랫폼 + 유형 */}
                  <div className="flex items-center gap-1 mb-1.5 text-[10px] text-gray-500">
                    <span>{PLATFORM_ICONS[campaign.platform] || "📋"}</span>
                    <span>{CONTENT_LABELS[campaign.contentType] || campaign.contentType}</span>
                    <span className="text-gray-300">|</span>
                    <span>{campaign.category}</span>
                  </div>

                  {/* 타이틀 */}
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-0.5">
                    {campaign.advertiser?.businessName || campaign.businessName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                    {campaign.offerDetails || campaign.title}
                  </p>

                  {/* 포인트 */}
                  {campaign.pointReward > 0 && (
                    <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {campaign.pointReward.toLocaleString()} P
                    </span>
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

/* ===== 드롭다운 필터 컴포넌트 ===== */
function FilterSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
