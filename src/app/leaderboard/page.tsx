import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GRADE_BADGES: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: "신입", className: "bg-gray-100 text-gray-600" },
  STANDARD: { label: "일반", className: "bg-blue-100 text-blue-600" },
  PREMIUM: { label: "프리미엄", className: "bg-purple-100 text-purple-600" },
  VIP: { label: "VIP", className: "bg-yellow-100 text-yellow-700" },
};

export default async function LeaderboardPage() {
  const reviewers = await prisma.user.findMany({
    where: { role: "REVIEWER", onboarded: true },
    select: {
      id: true,
      name: true,
      image: true,
      grade: true,
      blogUrl: true,
      instagramId: true,
      youtubeUrl: true,
      tiktokId: true,
      createdAt: true,
      _count: {
        select: {
          reviews: { where: { status: "APPROVED" } },
          applications: { where: { status: "ACCEPTED" } },
        },
      },
      receivedRatings: {
        select: { rating: true },
      },
    },
  });

  const ranked = reviewers
    .map((r) => {
      const avgRating = r.receivedRatings.length > 0
        ? r.receivedRatings.reduce((sum, rr) => sum + rr.rating, 0) / r.receivedRatings.length
        : 0;
      const score = r._count.reviews * 10 + r._count.applications * 2 + avgRating * 5;
      return {
        ...r,
        approvedReviews: r._count.reviews,
        acceptedApps: r._count.applications,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: r.receivedRatings.length,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">리뷰어 랭킹</h1>
      <p className="text-gray-500 text-sm mb-8">승인된 리뷰, 선정 횟수, 평점을 기반으로 산정됩니다.</p>

      {/* Top 3 */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[ranked[1], ranked[0], ranked[2]].map((r, idx) => {
            const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            return (
              <Link
                key={r.id}
                href={`/portfolio/${r.id}`}
                className={`bg-white rounded-2xl border shadow-sm p-5 text-center hover:shadow-lg transition-shadow ${
                  actualRank === 1 ? "ring-2 ring-yellow-400 scale-105" : ""
                }`}
              >
                <div className={`text-3xl mb-2 ${medalColors[actualRank - 1]}`}>
                  {actualRank === 1 ? "🥇" : actualRank === 2 ? "🥈" : "🥉"}
                </div>
                {r.image ? (
                  <img src={r.image} alt="" className="w-14 h-14 rounded-full mx-auto mb-2 object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center text-gray-500 font-bold">
                    {r.name?.[0] || "?"}
                  </div>
                )}
                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  GRADE_BADGES[r.grade]?.className || "bg-gray-100"
                }`}>
                  {GRADE_BADGES[r.grade]?.label || r.grade}
                </span>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-500">리뷰 <span className="font-bold text-gray-900">{r.approvedReviews}</span></p>
                  {r.avgRating > 0 && (
                    <p className="text-xs text-gray-500">평점 <span className="font-bold text-yellow-600">{r.avgRating}</span></p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-center px-4 py-3 font-medium text-gray-500 w-16">순위</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">리뷰어</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">등급</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">리뷰</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">선정</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">평점</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">SNS</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ranked.map((r, i) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-bold text-gray-700">
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/portfolio/${r.id}`} className="flex items-center gap-3 hover:text-red-500">
                    {r.image ? (
                      <img src={r.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                        {r.name?.[0] || "?"}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{r.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    GRADE_BADGES[r.grade]?.className || "bg-gray-100"
                  }`}>
                    {GRADE_BADGES[r.grade]?.label || r.grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gray-900">{r.approvedReviews}</td>
                <td className="px-4 py-3 text-center text-gray-600">{r.acceptedApps}</td>
                <td className="px-4 py-3 text-center">
                  {r.avgRating > 0 ? (
                    <span className="text-yellow-600 font-semibold">★ {r.avgRating}</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    {r.blogUrl && <span className="text-green-500 text-xs" title="블로그">📝</span>}
                    {r.instagramId && <span className="text-pink-500 text-xs" title="인스타">📸</span>}
                    {r.youtubeUrl && <span className="text-red-500 text-xs" title="유튜브">🎬</span>}
                    {r.tiktokId && <span className="text-purple-500 text-xs" title="틱톡">🎵</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
