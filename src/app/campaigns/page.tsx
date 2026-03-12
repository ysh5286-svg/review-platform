import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLATFORMS = [
  { value: "", label: "전체" },
  { value: "NAVER_BLOG", label: "네이버블로그" },
  { value: "INSTAGRAM", label: "인스타그램" },
  { value: "SHORT_FORM", label: "숏폼영상" },
];

const CATEGORIES = [
  "전체",
  "맛집",
  "뷰티",
  "여행",
  "생활",
  "패션",
  "육아",
  "IT/테크",
];

function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; className: string }> = {
    NAVER_BLOG: {
      label: "네이버블로그",
      className: "bg-green-100 text-green-700",
    },
    INSTAGRAM: {
      label: "인스타그램",
      className: "bg-pink-100 text-pink-700",
    },
    SHORT_FORM: {
      label: "숏폼영상",
      className: "bg-purple-100 text-purple-700",
    },
  };
  const info = map[platform] || { label: platform, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.className}`}>
      {info.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    RECRUITING: { label: "모집중", className: "bg-red-100 text-red-600" },
    IN_PROGRESS: { label: "진행중", className: "bg-yellow-100 text-yellow-700" },
    COMPLETED: { label: "완료", className: "bg-gray-100 text-gray-500" },
    CLOSED: { label: "마감", className: "bg-gray-100 text-gray-500" },
  };
  const info = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.className}`}>
      {info.label}
    </span>
  );
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const platform = params.platform || "";
  const category = params.category || "";
  const search = params.search || "";

  const where: Record<string, unknown> = {};
  if (platform) where.platform = platform;
  if (category && category !== "전체") where.category = category;
  if (search) where.title = { contains: search };

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      advertiser: { select: { businessName: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">캠페인 둘러보기</h1>

      {/* Platform Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {PLATFORMS.map((p) => (
          <Link
            key={p.value}
            href={`/campaigns?platform=${p.value}&category=${category}&search=${search}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              platform === p.value
                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                : "bg-white text-gray-600 border hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/campaigns?platform=${platform}&category=${c === "전체" ? "" : c}&search=${search}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              (c === "전체" && !category) || category === c
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-8">
        <input type="hidden" name="platform" value={platform} />
        <input type="hidden" name="category" value={category} />
        <div className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="캠페인 검색..."
            className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
          >
            검색
          </button>
        </div>
      </form>

      {/* Campaign Cards */}
      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">등록된 캠페인이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="bg-white rounded-xl border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-200 transition-all duration-300 overflow-hidden"
            >
              {campaign.imageUrl && (
                <div className="relative h-40 bg-gray-100">
                  <Image src={campaign.imageUrl} alt={campaign.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PlatformBadge platform={campaign.platform} />
                  <StatusBadge status={campaign.status} />
                  <span className="text-xs text-gray-400">{campaign.category}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                  {campaign.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {campaign.advertiser.businessName || campaign.businessName}
                </p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                  {campaign.offerDetails}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-500 font-semibold">
                    {campaign.pointReward.toLocaleString()}P
                  </span>
                  <span className="text-gray-400">
                    {campaign._count.applications}/{campaign.maxReviewers}명
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(campaign.startDate).toLocaleDateString("ko-KR")} ~{" "}
                  {new Date(campaign.endDate).toLocaleDateString("ko-KR")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
