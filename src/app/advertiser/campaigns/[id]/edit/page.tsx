"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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

const STATUS_OPTIONS = [
  { value: "RECRUITING", label: "모집중" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CLOSED", label: "마감" },
];

export default function EditCampaignPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    status: "RECRUITING",
    businessName: "",
    businessAddress: "",
    offerDetails: "",
    requirements: "",
    pointReward: 0,
    maxReviewers: 1,
    startDate: "",
    endDate: "",
    selectionDate: "",
    reviewDeadline: "",
  });

  useEffect(() => {
    fetch(`/api/advertiser/campaigns/${campaignId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setForm({
          title: data.title || "",
          description: data.description || "",
          platform: data.platform || "NAVER_BLOG",
          contentType: data.contentType || "BLOG_REVIEW",
          category: data.category || "맛집",
          status: data.status || "RECRUITING",
          businessName: data.businessName || "",
          businessAddress: data.businessAddress || "",
          offerDetails: data.offerDetails || "",
          requirements: data.requirements || "",
          pointReward: data.pointReward || 0,
          maxReviewers: data.maxReviewers || 1,
          startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
          selectionDate: data.selectionDate ? new Date(data.selectionDate).toISOString().split("T")[0] : "",
          reviewDeadline: data.reviewDeadline ? new Date(data.reviewDeadline).toISOString().split("T")[0] : "",
        });
        setImageUrl(data.imageUrl || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "platform") {
        const contentTypes = PLATFORM_CONTENT_MAP[value];
        if (contentTypes?.length) updated.contentType = contentTypes[0].value;
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
      if (!res.ok) throw new Error("업로드 실패");
      const { url } = await res.json();
      setImageUrl(url);
    } catch {
      setError("이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/advertiser/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: imageUrl || null,
          pointReward: Number(form.pointReward),
          maxReviewers: Number(form.maxReviewers),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "수정 실패");
      }
      router.push(`/advertiser/campaigns/${campaignId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 이 캠페인을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      const res = await fetch(`/api/advertiser/campaigns/${campaignId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      router.push("/advertiser/campaigns");
    } catch {
      setError("캠페인 삭제에 실패했습니다.");
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">로딩중...</div>;

  const contentTypes = PLATFORM_CONTENT_MAP[form.platform] || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">캠페인 수정</h1>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          캠페인 삭제
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">캠페인 제목</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">캠페인 설명</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
          <div className="flex items-start gap-4">
            {imageUrl ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                <Image src={imageUrl} alt="" fill className="object-cover" />
                <button type="button" onClick={() => setImageUrl("")} className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors cursor-pointer">
                {uploading ? <span className="text-xs">업로드중...</span> : <><span className="text-2xl mb-1">📷</span><span className="text-xs">이미지 추가</span></>}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">캠페인 상태</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
            <select name="platform" value={form.platform} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="NAVER_BLOG">네이버블로그</option>
              <option value="INSTAGRAM">인스타그램</option>
              <option value="SHORT_FORM">숏폼영상</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">콘텐츠 유형</label>
            <select name="contentType" value={form.contentType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              {contentTypes.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체명</label>
            <input type="text" name="businessName" value={form.businessName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체 주소</label>
            <input type="text" name="businessAddress" value={form.businessAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제공 내용</label>
          <textarea name="offerDetails" value={form.offerDetails} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">리뷰 조건</label>
          <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">포인트 보상</label>
            <input type="number" name="pointReward" value={form.pointReward} onChange={handleChange} min={0} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원</label>
            <input type="number" name="maxReviewers" value={form.maxReviewers} onChange={handleChange} min={1} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모집 시작일</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모집 마감일</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">선정 발표일</label>
            <input type="date" name="selectionDate" value={form.selectionDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">체험/리뷰 마감일</label>
            <input type="date" name="reviewDeadline" value={form.reviewDeadline} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800">취소</button>
          <button type="submit" disabled={saving} className="px-8 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors">
            {saving ? "저장중..." : "변경사항 저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
