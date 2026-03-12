"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RankCheckButton from "@/components/RankCheckButton";

interface Application {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  reviewer: { id: string; name: string | null; email: string | null; blogUrl: string | null; instagramId: string | null };
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

export default function AdvertiserCampaignDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"applications" | "reviews">("applications");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/advertiser/campaigns" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; 캠페인 목록으로
      </Link>

      {/* Campaign Summary */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold">{campaign.title}</h1>
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
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "applications" ? "bg-red-500 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          신청자 목록 ({applications.length})
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "reviews" ? "bg-red-500 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          제출된 리뷰 ({reviews.length})
        </button>
      </div>

      {/* Applications Tab */}
      {tab === "applications" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">신청자가 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">리뷰어</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">신청 메시지</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">신청일</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{app.reviewer.name || "이름 없음"}</p>
                          <Link
                            href={`/messages?partner=${app.reviewer.id}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-full hover:bg-blue-100 transition-colors"
                          >
                            💬 메시지
                          </Link>
                        </div>
                        <p className="text-xs text-gray-400">{app.reviewer.email}</p>
                        {app.reviewer.blogUrl && (
                          <p className="text-xs text-green-600">블로그: {app.reviewer.blogUrl}</p>
                        )}
                        {app.reviewer.instagramId && (
                          <p className="text-xs text-pink-600">인스타: @{app.reviewer.instagramId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {app.message || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          APP_STATUS[app.status]?.className || "bg-gray-100"
                        }`}
                      >
                        {APP_STATUS[app.status]?.label || app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(app.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {app.status === "PENDING" && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleApplicationAction(app.id, "ACCEPTED")}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                          >
                            선정
                          </button>
                          <button
                            onClick={() => handleApplicationAction(app.id, "REJECTED")}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
                          >
                            미선정
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
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReviewAction(review.id, "REJECTED")}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
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
