"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";

const PLATFORM_CONTENT_MAP: Record<string, { value: string; label: string }[]> = {
  NAVER_BLOG: [{ value: "BLOG_REVIEW", label: "블로그 리뷰" }],
  INSTAGRAM: [
    { value: "INSTAGRAM_POST", label: "인스타그램 게시물" },
    { value: "INSTAGRAM_REEL", label: "인스타그램 릴스" },
  ],
  SHORT_FORM: [
    { value: "YOUTUBE_SHORTS", label: "유튜브 쇼츠" },
    { value: "TIKTOK", label: "틱톡" },
  ],
};

const CATEGORIES = ["맛집", "뷰티", "여행", "생활", "패션", "육아", "IT/테크"];

export default function NewCampaignPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "NAVER_BLOG",
    contentType: "BLOG_REVIEW",
    category: "맛집",
    businessName: "",
    businessAddress: "",
    offerDetails: "",
    requirements: "",
    pointReward: 0,
    maxReviewers: 1,
    startDate: "",
    endDate: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset contentType when platform changes
      if (name === "platform") {
        const contentTypes = PLATFORM_CONTENT_MAP[value];
        if (contentTypes?.length) {
          updated.contentType = contentTypes[0].value;
        }
      }
      return updated;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "업로드 실패");
      }
      const { url } = await res.json();
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: imageUrl || undefined,
          pointReward: Number(form.pointReward),
          maxReviewers: Number(form.maxReviewers),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "캠페인 등록에 실패했습니다.");
      }

      router.push("/advertiser/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const contentTypes = PLATFORM_CONTENT_MAP[form.platform] || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">새 캠페인 등록</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">캠페인 제목</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="캠페인 제목을 입력하세요"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">캠페인 설명</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="캠페인에 대한 상세 설명을 입력하세요"
          />
        </div>

        {/* Campaign Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
          <div className="flex items-start gap-4">
            {imageUrl ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                <Image src={imageUrl} alt="캠페인 이미지" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <span className="text-xs">업로드중...</span>
                ) : (
                  <>
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs">이미지 추가</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP (최대 5MB)</p>
          </div>
        </div>

        {/* Platform & ContentType */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="NAVER_BLOG">네이버블로그</option>
              <option value="INSTAGRAM">인스타그램</option>
              <option value="SHORT_FORM">숏폼영상</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">콘텐츠 유형</label>
            <select
              name="contentType"
              value={form.contentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {contentTypes.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Business Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체명</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="업체 이름"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체 주소</label>
            <input
              type="text"
              name="businessAddress"
              value={form.businessAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="방문 주소 (선택)"
            />
          </div>
        </div>

        {/* Offer Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제공 내용</label>
          <textarea
            name="offerDetails"
            value={form.offerDetails}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="리뷰어에게 제공할 내용 (예: 2인 식사 제공, 제품 무료 제공 등)"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">리뷰 조건</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="리뷰 작성 시 필수 조건 (선택)"
          />
        </div>

        {/* Points & Max Reviewers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">포인트 보상</label>
            <input
              type="number"
              name="pointReward"
              value={form.pointReward}
              onChange={handleChange}
              min={0}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원</label>
            <input
              type="number"
              name="maxReviewers"
              value={form.maxReviewers}
              onChange={handleChange}
              min={1}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "등록중..." : "캠페인 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
