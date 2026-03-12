"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RankCheckButton from "@/components/RankCheckButton";

interface ReviewerInfo {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  grade: string;
  blogUrl: string | null;
  instagramId: string | null;
  youtubeUrl: string | null;
  tiktokId: string | null;
  blogVerified: boolean;
  instagramVerified: boolean;
  youtubeVerified: boolean;
  tiktokVerified: boolean;
  _count: { reviews: number; applications: number };
}

interface ReviewerStats {
  approvedReviews: number;
  rejectedApplications: number;
  avgRating: number;
  ratingCount: number;
}

interface Application {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  reviewer: ReviewerInfo;
  reviewerStats: ReviewerStats;
  review?: Review | null;
}

interface Review {
  id: string;
  reviewUrl: string;
  status: string;
  createdAt: string;
  reviewer: { id: string; name: string | null; email: string | null };
}

interface Campaign {
  id: string;
  campaignNumber: number;
  title: string;
  platform: string;
  contentType: string;
  category: string;
  status: string;
  businessName: string;
  offerDetails: string;
  pointReward: number;
  maxReviewers: number;
  startDate: string;
  endDate: string;
  _count: { applications: number };
}

const APP_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "선정", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "미선정", className: "bg-red-100 text-red-700" },
};

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "제출됨", className: "bg-red-100 text-red-600" },
  APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "반려", className: "bg-red-100 text-red-700" },
};

// 높은 등급 먼저 표시
const GRADE_ORDER = ["INFLUENCER", "PREMIUM", "ADVANCED", "INTERMEDIATE", "STANDARD", "BEGINNER"];
const GRADE_LABELS: Record<string, string> = {
  BEGINNER: "일반",
  STANDARD: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  PREMIUM: "프리미어",
  INFLUENCER: "네이버 인플",
};
const GRADE_ICONS: Record<string, string> = {
  BEGINNER: "⚪",
  STANDARD: "🥉",
  INTERMEDIATE: "🥈",
  ADVANCED: "🥇",
  PREMIUM: "💎",
  INFLUENCER: "🅝",
};
const GRADE_COLORS: Record<string, string> = {
  BEGINNER: "border-gray-200 bg-gray-50",
  STANDARD: "border-orange-200 bg-orange-50",
  INTERMEDIATE: "border-blue-200 bg-blue-50",
  ADVANCED: "border-yellow-200 bg-yellow-50",
  PREMIUM: "border-purple-200 bg-purple-50",
  INFLUENCER: "border-green-200 bg-green-50",
};

export default function AdvertiserCampaignDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"applications" | "reviews">("applications");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/advertiser/campaigns/${campaignId}`).then((r) => r.json()),
      fetch(`/api/advertiser/campaigns/${campaignId}/applications`).then((r) => r.json()),
      fetch(`/api/advertiser/campaigns/${campaignId}/reviews`).then((r) => r.json()),
    ])
      .then(([campaignData, appsData, reviewsData]) => {
        setCampaign(campaignData);
        setApplications(Array.isArray(appsData) ? appsData : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function handleApplicationAction(applicationId: string, action: "ACCEPTED" | "REJECTED") {
    try {
      const res = await fetch(`/api/advertiser/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: action } : a))
        );
      }
    } catch {}
  }

  async function handleReviewAction(reviewId: string, action: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/advertiser/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: action } : r))
        );
      }
    } catch {}
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">로딩중...</div>;
  }

  if (!campaign) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">캠페인을 찾을 수 없습니다.</div>;
  }

  // 상태 필터링
  const filteredApps = statusFilter
    ? applications.filter((a) => a.status === statusFilter)
    : applications;

  // 등급별 그룹핑 (높은 등급 먼저)
  const groupedByGrade = GRADE_ORDER.reduce<Record<string, Application[]>>((acc, grade) => {
    const apps = filteredApps.filter((a) => a.reviewer.grade === grade);
    if (apps.length > 0) acc[grade] = apps;
    return acc;
  }, {});

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/advertiser/campaigns" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; 캠페인 목록으로
      </Link>

      {/* Campaign Summary */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400">#{campaign.campaignNumber}</span>
            <h1 className="text-xl font-bold">{campaign.title}</h1>
          </div>
          <Link
            href={`/advertiser/campaigns/${campaignId}/edit`}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            수정
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>업체: {campaign.businessName}</span>
          <span>포인트: {campaign.pointReward.toLocaleString()}P</span>
          <span>
            신청: {campaign._count.applications}/{campaign.maxReviewers}명
          </span>
          <span>
            {new Date(campaign.startDate).toLocaleDateString("ko-KR")} ~{" "}
            {new Date(campaign.endDate).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab("applications")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === "applications" ? "bg-red-500 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          신청자 목록 ({applications.length})
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === "reviews" ? "bg-red-500 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          제출된 리뷰 ({reviews.length})
        </button>
      </div>

      {/* Applications Tab */}
      {tab === "applications" && (
        <div>
          {/* 상태 필터 */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { value: "", label: "전체", count: applications.length },
              { value: "PENDING", label: "대기중", count: pendingCount },
              { value: "ACCEPTED", label: "선정", count: acceptedCount },
              { value: "REJECTED", label: "미선정", count: rejectedCount },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  statusFilter === f.value
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {filteredApps.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
              신청자가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByGrade).map(([grade, apps]) => (
                <div key={grade}>
                  {/* 등급 그룹 헤더 */}
                  <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border ${GRADE_COLORS[grade] || "bg-gray-50 border-gray-200"}`}>
                    <span className="text-lg">{GRADE_ICONS[grade]}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {GRADE_LABELS[grade]} 등급
                    </span>
                    <span className="text-xs text-gray-500">({apps.length}명)</span>
                  </div>

                  {/* 신청자 카드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {apps.map((app) => (
                      <ApplicantCard
                        key={app.id}
                        app={app}
                        onAccept={() => handleApplicationAction(app.id, "ACCEPTED")}
                        onReject={() => handleApplicationAction(app.id, "REJECTED")}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">제출된 리뷰가 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">리뷰어</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">리뷰 URL</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">제출일</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{review.reviewer.name || "이름 없음"}</p>
                        {review.reviewer.id && (
                          <Link
                            href={`/messages?partner=${review.reviewer.id}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-full hover:bg-blue-100 transition-colors"
                          >
                            💬 메시지
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{review.reviewer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={review.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:underline text-sm truncate block max-w-xs"
                      >
                        {review.reviewUrl}
                      </a>
                      {review.status === "APPROVED" && (
                        <RankCheckButton reviewId={review.id} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          REVIEW_STATUS[review.status]?.className || "bg-gray-100"
                        }`}
                      >
                        {REVIEW_STATUS[review.status]?.label || review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {review.status === "SUBMITTED" && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleReviewAction(review.id, "APPROVED")}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 cursor-pointer"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReviewAction(review.id, "REJECTED")}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 cursor-pointer"
                          >
                            반려
                          </button>
                        </div>
                      )}
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

/* ===== 신청자 카드 컴포넌트 ===== */
function ApplicantCard({
  app,
  onAccept,
  onReject,
}: {
  app: Application;
  onAccept: () => void;
  onReject: () => void;
}) {
  const r = app.reviewer;
  const s = app.reviewerStats;
  const displayName = r.nickname || r.name || "이름 없음";
  const snsCount = [r.blogUrl, r.instagramId, r.youtubeUrl, r.tiktokId].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
      {/* 상단: 프로필 + 상태 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {r.image ? (
            <img src={r.image} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              👤
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 text-sm">{displayName}</span>
              <span className="text-xs">{GRADE_ICONS[r.grade]}</span>
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {GRADE_LABELS[r.grade]}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">{r.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              APP_STATUS[app.status]?.className || "bg-gray-100"
            }`}
          >
            {APP_STATUS[app.status]?.label || app.status}
          </span>
          <Link
            href={`/messages?partner=${r.id}`}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title="메시지 보내기"
          >
            💬
          </Link>
        </div>
      </div>

      {/* 핵심 지표 4개 */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-gray-50 rounded-lg p-2.5">
        <div className="text-center">
          <p className="text-sm font-bold text-green-600">{s.approvedReviews}</p>
          <p className="text-[9px] text-gray-400">협찬완료</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-red-500">{s.rejectedApplications}</p>
          <p className="text-[9px] text-gray-400">취소횟수</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-blue-600">{r._count.applications}</p>
          <p className="text-[9px] text-gray-400">총신청</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-yellow-600">
            {s.avgRating > 0 ? `${s.avgRating.toFixed(1)}⭐` : "-"}
          </p>
          <p className="text-[9px] text-gray-400">평점{s.ratingCount > 0 ? `(${s.ratingCount})` : ""}</p>
        </div>
      </div>

      {/* SNS 계정 링크 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {r.blogUrl && (
          <a
            href={r.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 hover:bg-green-100"
          >
            📝 블로그 {r.blogVerified && "✅"}
          </a>
        )}
        {r.instagramId && (
          <a
            href={`https://www.instagram.com/${r.instagramId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 border border-pink-200 rounded text-[10px] text-pink-700 hover:bg-pink-100"
          >
            📸 @{r.instagramId} {r.instagramVerified && "✅"}
          </a>
        )}
        {r.youtubeUrl && (
          <a
            href={r.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded text-[10px] text-red-700 hover:bg-red-100"
          >
            🎬 유튜브 {r.youtubeVerified && "✅"}
          </a>
        )}
        {r.tiktokId && (
          <a
            href={`https://www.tiktok.com/@${r.tiktokId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-700 hover:bg-gray-100"
          >
            🎵 @{r.tiktokId} {r.tiktokVerified && "✅"}
          </a>
        )}
        {snsCount === 0 && (
          <span className="text-[10px] text-gray-400 py-1">SNS 미등록</span>
        )}
      </div>

      {/* 신청 메시지 */}
      {app.message && (
        <div className="bg-blue-50 rounded-lg p-2.5 mb-3">
          <p className="text-[10px] text-blue-400 mb-0.5">신청 메시지</p>
          <p className="text-xs text-blue-800 line-clamp-2">{app.message}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      {app.status === "PENDING" && (
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="flex-1 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
          >
            ✅ 선정
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 text-xs font-medium bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 cursor-pointer transition-colors"
          >
            미선정
          </button>
        </div>
      )}

      {/* 신청일 */}
      <p className="text-[10px] text-gray-400 mt-2 text-right">
        {new Date(app.createdAt).toLocaleDateString("ko-KR")} 신청
      </p>
    </div>
  );
}
