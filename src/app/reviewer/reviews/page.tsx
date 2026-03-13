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

const STORE_TAGS = [
  { key: "kind_staff", label: "사장님/직원이 매우 친절해요", icon: "😊" },
  { key: "generous_offer", label: "제공 내역이 명확하고 푸짐해요", icon: "🎁" },
  { key: "clean_store", label: "매장이 청결하고 관리가 잘 되어 있어요", icon: "✨" },
  { key: "photo_friendly", label: "인테리어가 예뻐서 사진 찍기 좋아요", icon: "📸" },
  { key: "fast_response", label: "예약 응대가 빠르고 매끄러워요", icon: "⚡" },
  { key: "easy_access", label: "주차나 접근성이 편리해요", icon: "🚗" },
  { key: "great_quality", label: "음식(제품)의 퀄리티가 기대 이상이에요", icon: "👨‍🍳" },
  { key: "fair_guide", label: "리뷰 가이드라인이 합리적이고 간결해요", icon: "📋" },
];

export default function ReviewerReviewsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<AcceptedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitForm, setSubmitForm] = useState<{
    applicationId: string;
    url: string;
    storeTags: string[];
    storeFeedback: string;
  } | null>(null);
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
          storeTags: submitForm.storeTags,
          storeFeedback: submitForm.storeFeedback || undefined,
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

  function toggleStoreTag(key: string) {
    if (!submitForm) return;
    const selected = submitForm.storeTags.includes(key);
    if (!selected && submitForm.storeTags.length >= 3) return;
    setSubmitForm({
      ...submitForm,
      storeTags: selected
        ? submitForm.storeTags.filter((t) => t !== key)
        : [...submitForm.storeTags, key],
    });
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
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        {/* 리뷰 URL */}
                        <div>
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
                        </div>

                        {/* 매장 평가 */}
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-sm font-bold text-gray-900">매장 평가</h4>
                            <span className="text-xs text-gray-400">(최대 3개 선택)</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {STORE_TAGS.map((tag) => {
                              const selected = submitForm.storeTags.includes(tag.key);
                              const disabled = !selected && submitForm.storeTags.length >= 3;
                              return (
                                <button
                                  key={tag.key}
                                  type="button"
                                  onClick={() => toggleStoreTag(tag.key)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors cursor-pointer ${
                                    selected
                                      ? "border-red-500 bg-red-50 text-red-700"
                                      : disabled
                                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                      : "border-gray-200 hover:border-red-300 text-gray-600"
                                  }`}
                                >
                                  <span>{tag.icon}</span>
                                  <span>{tag.label}</span>
                                  {selected && (
                                    <svg className="w-4 h-4 ml-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 건의 및 불편사항 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            건의 및 불편사항 <span className="text-gray-400 font-normal">(선택)</span>
                          </label>
                          <textarea
                            value={submitForm.storeFeedback}
                            onChange={(e) =>
                              setSubmitForm({ ...submitForm, storeFeedback: e.target.value })
                            }
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="매장에 전달하기 어려운 피드백을 작성해 주세요 (익명으로 전달됩니다)"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            * 건의사항은 익명으로 사장님에게만 전달됩니다
                          </p>
                        </div>

                        {error && <p className="text-red-500 text-xs">{error}</p>}

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submitLoading}
                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                          >
                            {submitLoading ? "제출중..." : "제출"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSubmitForm(null);
                              setError("");
                            }}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            취소
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() =>
                          setSubmitForm({
                            applicationId: item.id,
                            url: "",
                            storeTags: [],
                            storeFeedback: "",
                          })
                        }
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
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
