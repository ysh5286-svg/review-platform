"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RankCheckButton from "@/components/RankCheckButton";

/* ===== 타입 ===== */
interface ReviewerInfo {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  grade: string;
  phone?: string | null;
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
  tagCounts: Record<string, number>;
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

/* ===== 상수 ===== */
const STATUS_STEPS = [
  { key: "RECRUITING", label: "모집", icon: "📋" },
  { key: "IN_PROGRESS", label: "체험&리뷰", icon: "✏️" },
  { key: "COMPLETED", label: "리뷰마감", icon: "✅" },
];

const APP_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "선정", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "미선정", className: "bg-red-100 text-red-700" },
};

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "제출됨", className: "bg-blue-100 text-blue-600" },
  APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "반려", className: "bg-red-100 text-red-700" },
};

const GRADE_LABELS: Record<string, string> = {
  BEGINNER: "일반", STANDARD: "초급", INTERMEDIATE: "중급",
  ADVANCED: "고급", PREMIUM: "프리미어", INFLUENCER: "네이버 인플",
};

const GRADE_COLORS: Record<string, string> = {
  BEGINNER: "bg-gray-100 text-gray-600",
  STANDARD: "bg-orange-100 text-orange-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-yellow-100 text-yellow-700",
  PREMIUM: "bg-purple-100 text-purple-700",
  INFLUENCER: "bg-green-100 text-green-700",
};

const RATING_TAGS = [
  { key: "photo_quality", label: "사진 퀄리티가 좋아요", icon: "📸" },
  { key: "good_manner", label: "매너가 좋아요", icon: "😊" },
  { key: "fast_review", label: "리뷰 등록이 빨라요", icon: "⚡" },
  { key: "good_writing", label: "포스팅 글을 잘써요", icon: "✍️" },
  { key: "want_again", label: "다음에 또 부르고 싶어요", icon: "💖" },
  { key: "punctual", label: "시간 약속 잘 지켜요", icon: "⏰" },
  { key: "recommended", label: "추천하는 리뷰어에요", icon: "👍" },
  { key: "disappointing", label: "전체적으로 아쉬워요", icon: "😞" },
];

/* ===== 메인 컴포넌트 ===== */
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
  const [profileModal, setProfileModal] = useState<Application | null>(null);
  const [ratingModal, setRatingModal] = useState<{ reviewId: string; reviewerId: string } | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/advertiser/campaigns/${campaignId}`).then((r) => r.json()),
      fetch(`/api/advertiser/campaigns/${campaignId}/applications`).then((r) => r.json()),
      fetch(`/api/advertiser/campaigns/${campaignId}/reviews`).then((r) => r.json()),
    ])
      .then(([c, a, r]) => {
        setCampaign(c);
        setApplications(Array.isArray(a) ? a : []);
        setReviews(Array.isArray(r) ? r : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function handleAppAction(id: string, action: "ACCEPTED" | "REJECTED") {
    try {
      const res = await fetch(`/api/advertiser/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: action } : a)));
    } catch {}
  }

  async function handleReviewAction(id: string, action: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/advertiser/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    } catch {}
  }

  async function handleRatingSubmit() {
    if (!ratingModal) return;
    setRatingLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: ratingModal.reviewId,
          rating: ratingValue,
          tags: ratingTags,
          comment: ratingComment,
        }),
      });
      if (res.ok) {
        setRatingModal(null);
        setRatingTags([]);
        setRatingComment("");
      }
    } finally {
      setRatingLoading(false);
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">로딩중...</div>;
  if (!campaign) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">캠페인을 찾을 수 없습니다.</div>;

  const filteredApps = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications;
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;

  // 현재 캠페인 상태에 따른 스텝 인덱스
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === campaign.status);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/advertiser/campaigns" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        캠페인 목록으로
      </Link>

      {/* 캠페인 제목 + 수정 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400">#{campaign.campaignNumber}</span>
            <h1 className="text-xl font-bold text-gray-900">{campaign.title}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {campaign.businessName} · {campaign.pointReward.toLocaleString()}P · 신청 {campaign._count.applications}/{campaign.maxReviewers}명
          </p>
        </div>
        <Link href={`/advertiser/campaigns/${campaignId}/edit`} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
          수정
        </Link>
      </div>

      {/* 진행 상태 스텝 */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-center gap-0">
          {STATUS_STEPS.map((step, i) => {
            const isActive = i === currentStepIdx;
            const isDone = i < currentStepIdx;
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                    isActive ? "border-blue-500 bg-blue-50 scale-110" : isDone ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}>
                    {isDone ? "✅" : step.icon}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? "text-blue-600" : isDone ? "text-green-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-16px] ${i < currentStepIdx ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4 border-b">
        <button onClick={() => setTab("applications")} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === "applications" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          인플루언서 목록 ({applications.length})
        </button>
        <button onClick={() => setTab("reviews")} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === "reviews" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          제출된 리뷰 ({reviews.length})
        </button>
      </div>

      {/* ===== 신청자 테이블 탭 ===== */}
      {tab === "applications" && (
        <div>
          {/* 필터 + 인원 */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {[
                { value: "", label: "전체", count: applications.length },
                { value: "PENDING", label: "대기중", count: pendingCount },
                { value: "ACCEPTED", label: "선정", count: acceptedCount },
                { value: "REJECTED", label: "미선정", count: applications.length - pendingCount - acceptedCount },
              ].map((f) => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    statusFilter === f.value ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              선정인원 / 가능인원 : <b>{acceptedCount}/{campaign.maxReviewers}</b>
            </span>
          </div>

          {/* 테이블 */}
          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-gray-400">신청자가 없습니다.</div>
            ) : (
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-center px-3 py-3 font-medium text-gray-500 w-12">번호</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500">이름</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">등급</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">협찬완료</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">취소횟수</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">SNS</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">평가</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">상태</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">리뷰등록일</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-500">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredApps.map((app, idx) => {
                    const r = app.reviewer;
                    const s = app.reviewerStats;
                    const name = r.nickname || r.name || "이름 없음";
                    const reviewDate = app.review?.createdAt ? new Date(app.review.createdAt).toLocaleDateString("ko-KR") : "-";

                    return (
                      <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="text-center px-3 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <button onClick={() => setProfileModal(app)} className="text-blue-600 hover:underline font-medium cursor-pointer text-left">
                            {name}
                          </button>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${GRADE_COLORS[r.grade] || "bg-gray-100 text-gray-600"}`}>
                            {GRADE_LABELS[r.grade]}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3 font-medium">{s.approvedReviews}</td>
                        <td className="text-center px-3 py-3">
                          <span className={s.rejectedApplications > 2 ? "text-red-500 font-bold" : ""}>{s.rejectedApplications}</span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {r.blogUrl && <span className="text-green-600 text-xs" title="블로그">{"📝"}</span>}
                            {r.instagramId && <span className="text-pink-600 text-xs" title="인스타">{"📸"}</span>}
                            {r.youtubeUrl && <span className="text-red-600 text-xs" title="유튜브">{"🎬"}</span>}
                            {r.tiktokId && <span className="text-gray-600 text-xs" title="틱톡">{"🎵"}</span>}
                          </div>
                        </td>
                        <td className="text-center px-3 py-3">
                          <RatingTooltip stats={s} />
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${APP_STATUS[app.status]?.className || "bg-gray-100"}`}>
                            {APP_STATUS[app.status]?.label || app.status}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3 text-xs text-gray-400">{reviewDate}</td>
                        <td className="text-center px-3 py-3">
                          {app.status === "PENDING" ? (
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => handleAppAction(app.id, "ACCEPTED")} className="px-2.5 py-1 bg-blue-500 text-white text-[11px] rounded hover:bg-blue-600 cursor-pointer">선정</button>
                              <button onClick={() => handleAppAction(app.id, "REJECTED")} className="px-2.5 py-1 bg-gray-200 text-gray-600 text-[11px] rounded hover:bg-gray-300 cursor-pointer">미선정</button>
                            </div>
                          ) : app.review?.status === "APPROVED" ? (
                            <button
                              onClick={() => setRatingModal({ reviewId: app.review!.id, reviewerId: r.id })}
                              className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[11px] rounded hover:bg-yellow-200 cursor-pointer"
                            >
                              {"⭐"} 평가
                            </button>
                          ) : (
                            <Link href={`/messages?partner=${r.id}`} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[11px] rounded hover:bg-blue-100 inline-block">
                              {"💬"}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===== 리뷰 탭 ===== */}
      {tab === "reviews" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">제출된 리뷰가 없습니다.</div>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">리뷰어</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">리뷰 URL</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">제출일</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{review.reviewer.name || "이름 없음"}</p>
                      <p className="text-xs text-gray-400">{review.reviewer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-xs">
                        {review.reviewUrl}
                      </a>
                      {review.status === "APPROVED" && <RankCheckButton reviewId={review.id} />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${REVIEW_STATUS[review.status]?.className || "bg-gray-100"}`}>
                        {REVIEW_STATUS[review.status]?.label || review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("ko-KR")}</td>
                    <td className="px-4 py-3 text-center">
                      {review.status === "SUBMITTED" && (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleReviewAction(review.id, "APPROVED")} className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 cursor-pointer">승인</button>
                          <button onClick={() => handleReviewAction(review.id, "REJECTED")} className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 cursor-pointer">반려</button>
                        </div>
                      )}
                      {review.status === "APPROVED" && (
                        <button onClick={() => setRatingModal({ reviewId: review.id, reviewerId: review.reviewer.id })} className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md hover:bg-yellow-200 cursor-pointer">
                          {"⭐"} 평가하기
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ===== 리뷰어 프로필 모달 ===== */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setProfileModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <ReviewerProfileModal app={profileModal} onClose={() => setProfileModal(null)} />
          </div>
        </div>
      )}

      {/* ===== 평가 모달 ===== */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRatingModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">리뷰어 평가</h3>

            {/* 별점 */}
            <div className="flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map((v) => (
                <button key={v} onClick={() => setRatingValue(v)} className="text-2xl cursor-pointer">
                  {v <= ratingValue ? "⭐" : "☆"}
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-2">{ratingValue}점</span>
            </div>

            {/* 평가 태그 */}
            <p className="text-sm font-medium text-gray-700 mb-2">평가 항목 (복수 선택 가능)</p>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {RATING_TAGS.map((tag) => {
                const selected = ratingTags.includes(tag.key);
                return (
                  <button
                    key={tag.key}
                    onClick={() => setRatingTags((prev) => selected ? prev.filter((t) => t !== tag.key) : [...prev, tag.key])}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors cursor-pointer ${
                      selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-blue-300 text-gray-600"
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                    {selected && <svg className="w-4 h-4 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                );
              })}
            </div>

            {/* 코멘트 */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={2}
              placeholder="추가 코멘트 (선택)"
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="flex gap-2 justify-end">
              <button onClick={() => setRatingModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">취소</button>
              <button onClick={handleRatingSubmit} disabled={ratingLoading} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 cursor-pointer">
                {ratingLoading ? "저장중..." : "평가 저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 평가 툴팁 (별 호버) ===== */
function RatingTooltip({ stats }: { stats: ReviewerStats }) {
  const [show, setShow] = useState(false);
  const hasRating = stats.ratingCount > 0;
  const hasTagData = Object.keys(stats.tagCounts).length > 0;

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="cursor-pointer">
        {hasRating ? (
          <span className="text-yellow-500 font-medium">{`⭐`} {stats.avgRating.toFixed(1)}</span>
        ) : (
          <span className="text-gray-300">{"☆"}</span>
        )}
      </span>

      {show && hasRating && (
        <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-xl shadow-xl border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">평가</span>
            <span className="text-xs text-gray-400">{stats.ratingCount}명</span>
          </div>
          {hasTagData ? (
            <div className="space-y-1.5">
              {RATING_TAGS.map((tag) => {
                const count = stats.tagCounts[tag.key] || 0;
                return (
                  <div key={tag.key} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <span>{tag.icon}</span> {tag.label}
                    </span>
                    <span className={`font-bold ${count > 0 ? "text-blue-600" : "text-gray-300"}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">상세 평가 데이터가 없습니다</p>
          )}
          {/* 삼각형 꼬리 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b rotate-45 -mt-1.5" />
        </div>
      )}
    </div>
  );
}

/* ===== 리뷰어 프로필 모달 ===== */
function ReviewerProfileModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const r = app.reviewer;
  const s = app.reviewerStats;
  const name = r.nickname || r.name || "이름 없음";

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">리뷰어 프로필</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* 프로필 헤더 */}
      <div className="flex items-center gap-4 mb-5">
        {r.image ? (
          <img src={r.image} alt="" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
            {name[0]}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GRADE_COLORS[r.grade] || "bg-gray-100 text-gray-600"}`}>
              {GRADE_LABELS[r.grade]}
            </span>
          </div>
          <p className="text-sm text-gray-400">{r.email}</p>
        </div>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{s.approvedReviews}</p>
          <p className="text-[10px] text-gray-500">협찬경력</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{r._count.applications}</p>
          <p className="text-[10px] text-gray-500">총신청</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-500">{s.rejectedApplications}</p>
          <p className="text-[10px] text-gray-500">취소횟수</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-yellow-600">
            {s.avgRating > 0 ? s.avgRating.toFixed(1) : "-"}
          </p>
          <p className="text-[10px] text-gray-500">평가 {s.ratingCount}명</p>
        </div>
      </div>

      {/* SNS 계정 */}
      <div className="mb-5">
        <h4 className="text-sm font-bold text-gray-700 mb-2">SNS</h4>
        <div className="grid grid-cols-2 gap-2">
          <SnsCard icon="📝" platform="네이버 블로그" url={r.blogUrl} verified={r.blogVerified} />
          <SnsCard icon="📸" platform="인스타그램" url={r.instagramId ? `https://instagram.com/${r.instagramId}` : null} label={r.instagramId ? `@${r.instagramId}` : null} verified={r.instagramVerified} />
          <SnsCard icon="🎬" platform="유튜브" url={r.youtubeUrl} verified={r.youtubeVerified} />
          <SnsCard icon="🎵" platform="틱톡" url={r.tiktokId ? `https://tiktok.com/@${r.tiktokId}` : null} label={r.tiktokId ? `@${r.tiktokId}` : null} verified={r.tiktokVerified} />
        </div>
      </div>

      {/* 평가 태그 요약 */}
      {Object.keys(s.tagCounts).length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-bold text-gray-700 mb-2">받은 평가</h4>
          <div className="space-y-1.5">
            {RATING_TAGS.filter((tag) => (s.tagCounts[tag.key] || 0) > 0).map((tag) => (
              <div key={tag.key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <span>{tag.icon}</span> {tag.label}
                </span>
                <span className="text-sm font-bold text-blue-600">{s.tagCounts[tag.key]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 신청 메시지 */}
      {app.message && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-400 mb-1">신청 메시지</p>
          <p className="text-sm text-blue-800">{app.message}</p>
        </div>
      )}

      {/* 포트폴리오 링크 */}
      <Link
        href={`/portfolio/${r.id}`}
        target="_blank"
        className="block w-full text-center py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        포트폴리오 보기 →
      </Link>
    </>
  );
}

/* ===== SNS 카드 ===== */
function SnsCard({ icon, platform, url, label, verified }: { icon: string; platform: string; url: string | null; label?: string | null; verified: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${url ? "bg-white" : "bg-gray-50"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        {verified && <span className="text-[10px] text-green-600">✅</span>}
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
          {label || platform}
        </a>
      ) : (
        <span className="text-xs text-gray-400">미등록</span>
      )}
    </div>
  );
}
