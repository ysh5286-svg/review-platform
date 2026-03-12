import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GRADE_BADGES: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: "신입", className: "bg-gray-100 text-gray-600" },
  STANDARD: { label: "일반", className: "bg-blue-100 text-blue-600" },
  PREMIUM: { label: "프리미엄", className: "bg-purple-100 text-purple-600" },
  VIP: { label: "VIP", className: "bg-yellow-100 text-yellow-700" },
};

const PLATFORM_LABELS: Record<string, string> = {
  NAVER_BLOG: "네이버블로그",
  INSTAGRAM: "인스타그램",
  SHORT_FORM: "숏폼영상",
};

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId, role: "REVIEWER" },
    select: {
      id: true, name: true, image: true, grade: true,
      blogUrl: true, instagramId: true, youtubeUrl: true, tiktokId: true,
      createdAt: true,
      _count: {
        select: {
          reviews: { where: { status: "APPROVED" } },
          applications: { where: { status: "ACCEPTED" } },
        },
      },
      receivedRatings: { select: { rating: true } },
    },
  });

  if (!user) return notFound();

  const reviews = await prisma.review.findMany({
    where: { reviewerId: userId, status: "APPROVED" },
    include: {
      application: {
        include: {
          campaign: {
            select: {
              id: true, title: true, platform: true, category: true,
              businessName: true, imageUrl: true,
            },
          },
        },
      },
      rating: { select: { rating: true, comment: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = user.receivedRatings.length > 0
    ? Math.round(
        (user.receivedRatings.reduce((s, r) => s + r.rating, 0) / user.receivedRatings.length) * 10
      ) / 10
    : 0;

  const platformCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    const p = r.application.campaign.platform;
    const c = r.application.campaign.category;
    platformCounts[p] = (platformCounts[p] || 0) + 1;
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-red-500 mb-4 inline-block">
        ← 랭킹으로 돌아가기
      </Link>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {user.image ? (
            <img src={user.image} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
              {user.name?.[0] || "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              GRADE_BADGES[user.grade]?.className || "bg-gray-100"
            }`}>
              {GRADE_BADGES[user.grade]?.label || user.grade}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              가입일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{user._count.reviews}</p>
            <p className="text-xs text-gray-500 mt-1">승인된 리뷰</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{user._count.applications}</p>
            <p className="text-xs text-gray-500 mt-1">선정 횟수</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {avgRating > 0 ? `★ ${avgRating}` : "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">평균 평점 ({user.receivedRatings.length})</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex justify-center gap-2 text-lg">
              {user.blogUrl && <span title="블로그">📝</span>}
              {user.instagramId && <span title="인스타">📸</span>}
              {user.youtubeUrl && <span title="유튜브">🎬</span>}
              {user.tiktokId && <span title="틱톡">🎵</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">활동 채널</p>
          </div>
        </div>

        {/* Platform Distribution */}
        {Object.keys(platformCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(platformCounts).map(([p, count]) => (
              <span key={p} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {PLATFORM_LABELS[p] || p} {count}건
              </span>
            ))}
            {Object.entries(categoryCounts).map(([c, count]) => (
              <span key={c} className="text-xs bg-red-50 px-3 py-1 rounded-full text-red-600">
                {c} {count}건
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review Portfolio */}
      <h2 className="text-lg font-bold mb-4">리뷰 포트폴리오 ({reviews.length}건)</h2>
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          아직 승인된 리뷰가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    {review.application.campaign.title}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {review.application.campaign.businessName} · {review.application.campaign.category}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      review.application.campaign.platform === "NAVER_BLOG" ? "bg-green-100 text-green-700" :
                      review.application.campaign.platform === "INSTAGRAM" ? "bg-pink-100 text-pink-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {PLATFORM_LABELS[review.application.campaign.platform]}
                    </span>
                    {review.rating && (
                      <span className="text-[10px] text-yellow-600 font-semibold">
                        ★ {review.rating.rating}
                      </span>
                    )}
                  </div>
                  <a
                    href={review.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    리뷰 보기 →
                  </a>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR")}
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
