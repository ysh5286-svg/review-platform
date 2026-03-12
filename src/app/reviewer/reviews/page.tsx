"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import RankCheckButton from "@/components/RankCheckButton";

interface AcceptedApp {
  id: string;
  campaign: { id: string; title: string; businessName: string; platform: string; pointReward: number };
  review: { id: string; reviewUrl: string; status: string; createdAt: string } | null;
}

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "심사중", className: "bg-red-100 text-red-600" },
  APPROVED: { label: "승인됨", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "반려됨", className: "bg-red-100 text-red-700" },
};

export default function ReviewerReviewsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<AcceptedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitForm, setSubmitForm] = useState<{ applicationId: string; url: string } | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reviewer/reviews")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!submitForm) return;
    setSubmitLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviewer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: submitForm.applicationId,
          reviewUrl: submitForm.url,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "리뷰 제출에 실패했습니다.");
      }

      const newReview = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === submitForm.applicationId ? { ...item, review: newReview } : item
        )
      );
      setSubmitForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 리뷰 관리</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400 mb-4">선정된 캠페인이 없습니다.</p>
          <Link href="/campaigns" className="text-red-500 font-medium hover:underline">
            캠페인 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <Link
                    href={`/campaigns/${item.campaign.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-red-500"
                  >
                    {item.campaign.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{item.campaign.businessName}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-500 font-bold">
                    {item.campaign.pointReward.toLocaleString()}P
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                {item.review ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            REVIEW_STATUS[item.review.status]?.className || "bg-gray-100"
                          }`}
                        >
                          {REVIEW_STATUS[item.review.status]?.label || item.review.status}
                        </span>
                        <a
                          href={item.review.reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-sm text-red-500 hover:underline"
                        >
                          {item.review.reviewUrl}
                        </a>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(item.review.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    {item.review.status === "APPROVED" && (
                      <RankCheckButton reviewId={item.review.id} />
                    )}
                  </div>
                ) : (
                  <div>
                    {submitForm?.applicationId === item.id ? (
                      <form onSubmit={handleSubmitReview} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            리뷰 URL
                          </label>
                          <input
                            type="url"
                            value={submitForm.url}
                            onChange={(e) =>
                              setSubmitForm({ ...submitForm, url: e.target.value })
                            }
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="https://..."
                          />
                          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        </div>
                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {submitLoading ? "제출중..." : "제출"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSubmitForm(null);
                            setError("");
                          }}
                          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          취소
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setSubmitForm({ applicationId: item.id, url: "" })}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        리뷰 제출
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
