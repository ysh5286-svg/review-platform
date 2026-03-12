"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/* ===== 채널 정의 ===== */
const CHANNELS = [
  { value: "BLOG_REVIEW", label: "블로그", desc: "블로그 게시물 1건 업로드", premium: false },
  { value: "INSTAGRAM_POST", label: "인스타그램", desc: "사진 3장 이상의 피드 게시물 1개 업로드", premium: false },
  { value: "BLOG_CLIP", label: "블로그+클립", desc: "1회 체험으로 블로그 게시물 1건+15초 영상(클립) 1개", premium: true },
  { value: "CLIP", label: "클립", desc: "30초 영상(클립) 1개 업로드", premium: true },
  { value: "INSTAGRAM_REEL", label: "릴스", desc: "30초 이상의 영상(릴스) 1개 업로드", premium: true },
  { value: "YOUTUBE", label: "유튜브", desc: "3분 이상의 영상(유튜브) 1개 업로드", premium: true },
  { value: "YOUTUBE_SHORTS", label: "쇼츠", desc: "30초 이상의 영상(유튜브 쇼츠) 1개 업로드", premium: true },
  { value: "TIKTOK", label: "틱톡", desc: "30초 이상의 영상(틱톡) 1개 업로드", premium: true },
];

const CATEGORIES = ["맛집", "식품", "뷰티", "여행", "디지털", "반려동물", "기타"];

const PROMOTION_TYPES = [
  { value: "방문형", icon: "🏪", desc: "매장을 방문하고 체험 후 리뷰 작성" },
  { value: "포장형", icon: "🛍️", desc: "방문 후 포장하여 리뷰 작성" },
  { value: "배송형", icon: "📦", desc: "배송받은 제품 사용 후 리뷰 작성" },
  { value: "구매형", icon: "🛒", desc: "제품 구매 후 리뷰, 구매평 리뷰 작성" },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const HOURS = ["1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00"];

const STEP_LABELS = [
  "기본 정보",
  "홍보 유형 및 채널과 카테고리",
  "체험 가능 요일 및 시간",
  "체험단 설정",
  "제공 내역 및 포인트 결제",
];

interface FormData {
  businessName: string;
  imageUrl: string;
  contactPhone1: string;
  contactPhone2: string;
  contactPhone3: string;
  promotionType: string;
  businessAddress: string;
  addressDetail: string;
  productUrl: string;
  category: string;
  contentType: string;
  availableDays: string[];
  timeAmPm1: string;
  timeHour1: string;
  timeAmPm2: string;
  timeHour2: string;
  is24Hours: boolean;
  sameDayReservation: boolean | null;
  reservationNote: string;
  missionText: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
  offerDetails: string;
  maxReviewers: number;
  pointReward: number;
}

const initialForm: FormData = {
  businessName: "",
  imageUrl: "",
  contactPhone1: "010",
  contactPhone2: "",
  contactPhone3: "",
  promotionType: "방문형",
  businessAddress: "",
  addressDetail: "",
  productUrl: "",
  category: "맛집",
  contentType: "BLOG_REVIEW",
  availableDays: [],
  timeAmPm1: "오전",
  timeHour1: "10:00",
  timeAmPm2: "오후",
  timeHour2: "6:00",
  is24Hours: false,
  sameDayReservation: null,
  reservationNote: "",
  missionText: "",
  keyword1: "",
  keyword2: "",
  keyword3: "",
  offerDetails: "",
  maxReviewers: 0,
  pointReward: 0,
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/advertiser/profile")
      .then((r) => r.json())
      .then((d) => setUserPoints(d.points || 0))
      .catch(() => {});
  }, []);

  function updateForm(updates: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("5MB 이하 파일만 업로드 가능합니다."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("업로드 실패");
      const { url } = await res.json();
      updateForm({ imageUrl: url });
    } catch { setError("이미지 업로드 실패"); } finally { setUploading(false); }
  }

  function validateStep(s: number): boolean {
    setError("");
    if (s === 1 && !form.businessName.trim()) { setError("상호명을 입력해주세요."); return false; }
    if (s === 2) {
      if ((form.promotionType === "방문형" || form.promotionType === "포장형") && !form.businessAddress.trim()) { setError("주소를 입력해주세요."); return false; }
      if ((form.promotionType === "배송형" || form.promotionType === "구매형") && !form.productUrl.trim()) { setError("제품 URL을 입력해주세요."); return false; }
    }
    if (s === 4 && !form.keyword1.trim()) { setError("키워드 1은 필수입니다."); return false; }
    if (s === 5) {
      if (!form.offerDetails.trim()) { setError("제공 내역을 입력해주세요."); return false; }
      if (form.maxReviewers < 1) { setError("모집 인원을 입력해주세요."); return false; }
    }
    return true;
  }

  function nextStep() { if (validateStep(step)) { setStep((s) => Math.min(s + 1, 5)); window.scrollTo(0, 0); } }
  function prevStep() { setError(""); setStep((s) => Math.max(s - 1, 1)); window.scrollTo(0, 0); }

  const channelInfo = CHANNELS.find((c) => c.value === form.contentType);
  const totalCost = form.maxReviewers * form.pointReward;
  const fee = Math.floor(totalCost * 0.2);
  const requiredPoints = totalCost + fee;
  const shortage = Math.max(0, requiredPoints - userPoints);

  async function handleSubmit() {
    if (!validateStep(5)) return;
    setLoading(true);
    setError("");
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.businessName,
          description: form.offerDetails,
          category: form.category,
          contentType: form.contentType,
          imageUrl: form.imageUrl || undefined,
          businessName: form.businessName,
          businessAddress: form.businessAddress || undefined,
          addressDetail: form.addressDetail || undefined,
          offerDetails: form.offerDetails,
          requirements: form.missionText || undefined,
          pointReward: Number(form.pointReward),
          maxReviewers: Number(form.maxReviewers),
          startDate: now.toISOString(),
          endDate: twoWeeks.toISOString(),
          promotionType: form.promotionType,
          productUrl: form.productUrl || undefined,
          contactPhone: [form.contactPhone1, form.contactPhone2, form.contactPhone3].filter(Boolean).join("-") || undefined,
          availableDays: form.availableDays.length > 0 ? JSON.stringify(form.availableDays) : undefined,
          availableTimeStart: form.is24Hours ? undefined : `${form.timeAmPm1} ${form.timeHour1}`,
          availableTimeEnd: form.is24Hours ? undefined : `${form.timeAmPm2} ${form.timeHour2}`,
          is24Hours: form.is24Hours,
          sameDayReservation: form.sameDayReservation,
          reservationNote: form.reservationNote || undefined,
          missionText: form.missionText || undefined,
          keyword1: form.keyword1 || undefined,
          keyword2: form.keyword2 || undefined,
          keyword3: form.keyword3 || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "캠페인 등록 실패"); }
      router.push("/advertiser/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">체험단 등록</h1>

      {/* 스텝 인디케이터 */}
      <div className="mb-6 space-y-2">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          if (s > step) return null;
          const done = s < step;
          return (
            <div key={s} className="flex items-center gap-3">
              {done ? (
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{s}</div>
              )}
              <span className={`text-sm ${s === step ? "font-bold text-gray-900" : "text-gray-400"}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">

        {/* ===== Step 1 ===== */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">상호명</label>
              <p className="text-xs text-gray-400 mb-2">방문형/포장형의 경우 네이버 플레이스에 등록되어 있는 업체명으로 입력해 주세요</p>
              <input type="text" value={form.businessName} onChange={(e) => updateForm({ businessName: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="업체명을 입력하세요" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">썸네일 등록</label>
              <div className="flex items-start gap-4">
                {form.imageUrl ? (
                  <div className="relative w-40 h-32 rounded-lg overflow-hidden border">
                    <Image src={form.imageUrl} alt="" fill className="object-cover" />
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-7 h-7 bg-white/80 rounded flex items-center justify-center text-xs hover:bg-white cursor-pointer">{"✏️"}</button>
                      <button type="button" onClick={() => { updateForm({ imageUrl: "" }); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="w-7 h-7 bg-white/80 rounded flex items-center justify-center text-xs hover:bg-white cursor-pointer">{"🗑️"}</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors cursor-pointer">
                    {uploading ? <span className="text-xs">업로드중...</span> : <><span className="text-2xl mb-1">{"📷"}</span><span className="text-xs">이미지 추가</span></>}
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
              </div>
              <p className="text-xs text-red-400 mt-2">검수 불가 사진: 간판 / 로고 / 화면 캡쳐 / 텍스트가 크게 들어간 이미지</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">담당자 연락처</label>
              <div className="flex items-center gap-2">
                <input type="text" value={form.contactPhone1} onChange={(e) => updateForm({ contactPhone1: e.target.value.replace(/\D/g, "").slice(0, 3) })} className="w-20 px-3 py-3 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-gray-400">-</span>
                <input type="text" value={form.contactPhone2} onChange={(e) => updateForm({ contactPhone2: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="w-24 px-3 py-3 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0000" />
                <span className="text-gray-400">-</span>
                <input type="text" value={form.contactPhone3} onChange={(e) => updateForm({ contactPhone3: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="w-24 px-3 py-3 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0000" />
              </div>
            </div>
          </div>
        )}

        {/* ===== Step 2 ===== */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">홍보 유형</label>
              <div className="grid grid-cols-2 gap-3">
                {PROMOTION_TYPES.map((pt) => (
                  <button key={pt.value} type="button" onClick={() => updateForm({ promotionType: pt.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${form.promotionType === pt.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{pt.icon}</span>
                      <span className={`text-sm font-bold ${form.promotionType === pt.value ? "text-blue-600" : "text-gray-700"}`}>{pt.value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {(form.promotionType === "방문형" || form.promotionType === "포장형") && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">주소</label>
                <input type="text" value={form.businessAddress} onChange={(e) => updateForm({ businessAddress: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="주소를 입력하세요" />
                <input type="text" value={form.addressDetail} onChange={(e) => updateForm({ addressDetail: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="상세주소 (층, 호수 등)" />
              </div>
            )}
            {(form.promotionType === "배송형" || form.promotionType === "구매형") && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">제품 URL</label>
                <input type="url" value={form.productUrl} onChange={(e) => updateForm({ productUrl: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://" />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">카테고리</label>
              <select value={form.category} onChange={(e) => updateForm({ category: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">채널</label>
              <div className="grid grid-cols-2 gap-3">
                {CHANNELS.map((ch) => (
                  <label key={ch.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.contentType === ch.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="contentType" value={ch.value} checked={form.contentType === ch.value} onChange={() => updateForm({ contentType: ch.value })} className="mt-1 accent-blue-500" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-800">{ch.label}</span>
                        {ch.premium && <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full">P</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{ch.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">P</span>
                <span className="text-sm font-bold text-gray-800">프리미엄 체험단이란?</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                인플루언서에게 포인트가 필수로 지급되는 체험단입니다.<br />
                포인트를 지급하는 경우 지원율이 <span className="font-bold text-gray-700">평균 400% 이상 상승</span>하며, 등급이 높은 인플루언서들의 적극적인 참여도 기대할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* ===== Step 3 ===== */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">체험 가능 요일</label>
              <div className="flex gap-4">
                {DAYS.map((day) => (
                  <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.availableDays.includes(day)}
                      onChange={() => { const d = form.availableDays.includes(day) ? form.availableDays.filter((x) => x !== day) : [...form.availableDays, day]; updateForm({ availableDays: d }); }}
                      className="accent-blue-500" />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-800">체험 가능 시간</label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form.is24Hours} onChange={() => updateForm({ is24Hours: !form.is24Hours })} className="accent-blue-500" />
                  <span className="text-sm text-gray-600">24시간 영업</span>
                </label>
              </div>
              <div className={`flex items-center gap-2 flex-wrap ${form.is24Hours ? "opacity-40 pointer-events-none" : ""}`}>
                <select value={form.timeAmPm1} onChange={(e) => updateForm({ timeAmPm1: e.target.value })} className="px-3 py-2.5 border rounded-lg text-sm"><option>오전</option><option>오후</option></select>
                <select value={form.timeHour1} onChange={(e) => updateForm({ timeHour1: e.target.value })} className="px-3 py-2.5 border rounded-lg text-sm">{HOURS.map((h) => <option key={h} value={h}>{h}</option>)}</select>
                <span className="text-sm text-gray-500">부터</span>
                <select value={form.timeAmPm2} onChange={(e) => updateForm({ timeAmPm2: e.target.value })} className="px-3 py-2.5 border rounded-lg text-sm"><option>오전</option><option>오후</option></select>
                <select value={form.timeHour2} onChange={(e) => updateForm({ timeHour2: e.target.value })} className="px-3 py-2.5 border rounded-lg text-sm">{HOURS.map((h) => <option key={h} value={h}>{h}</option>)}</select>
                <span className="text-sm text-gray-500">까지</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">당일 예약 및 방문</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="sameDay" checked={form.sameDayReservation === true} onChange={() => updateForm({ sameDayReservation: true })} className="accent-blue-500" /><span className="text-sm">가능</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="sameDay" checked={form.sameDayReservation === false} onChange={() => updateForm({ sameDayReservation: false })} className="accent-blue-500" /><span className="text-sm">불가능</span></label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">예약 시 주의사항 <span className="text-gray-400 font-normal">(선택)</span></label>
              <textarea value={form.reservationNote} onChange={(e) => updateForm({ reservationNote: e.target.value.slice(0, 50) })} rows={3}
                className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="브레이크 타임 또는 예약 시 주의사항(대리체험 불가 등)을 입력해 주세요" />
              <p className="text-xs text-gray-400 mt-1">50자 이내로 작성해 주세요. ({form.reservationNote.length}/50)</p>
            </div>
          </div>
        )}

        {/* ===== Step 4 ===== */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">체험단 미션</label>
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">영수증 리뷰/네이버 예약은 불가합니다.<br />필수 가이드(사진 개수, 글자수 등)는 핫플여기체험단 가이드로 진행됩니다.</p>
              <textarea value={form.missionText} onChange={(e) => updateForm({ missionText: e.target.value })} rows={6}
                className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={"홍보를 하고 싶은 키워드 위주로 명확하게 작성해 주세요!\n예시)\n- 3대 째 내려온 치킨집\n- 바삭한 식감 강조\n- 단체석, 회식, 넓은 주차장\n- 감성적인 인테리어"} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">홍보할 검색 키워드</label>
              <p className="text-xs text-gray-500 mb-3">키워드는 명확하게 3가지를 선택해서 작성해 주세요.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 shrink-0">키워드 1<span className="text-red-500">*</span></span>
                  <input type="text" value={form.keyword1} onChange={(e) => updateForm({ keyword1: e.target.value.slice(0, 10) })} className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예) 강남역 맛집 (10자 이내)" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 shrink-0">키워드 2</span>
                  <input type="text" value={form.keyword2} onChange={(e) => updateForm({ keyword2: e.target.value.slice(0, 10) })} className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 shrink-0">키워드 3</span>
                  <input type="text" value={form.keyword3} onChange={(e) => updateForm({ keyword3: e.target.value.slice(0, 10) })} className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <p className="text-xs text-red-500 mt-2 leading-relaxed">*띄어쓰기까지 반영되므로 명확하게 작성해 주세요<br />*해당 키워드는 리뷰 순위를 체크하는데 활용됩니다</p>
            </div>
          </div>
        )}

        {/* ===== Step 5 ===== */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">제공 내역</label>
              <p className="text-xs text-gray-500 mb-2">인플루언서에게 제공할 서비스를 입력해주세요</p>
              <input type="text" value={form.offerDetails} onChange={(e) => updateForm({ offerDetails: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예) 2인 식사 제공 (30,000원 상당)" />
              <p className="text-xs text-red-500 mt-1">가격과 품목을 명확히 표기하지 않으면 반려되니 주의하세요</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">체험단 모집 인원</label>
              <div className="flex items-center gap-2">
                <input type="number" value={form.maxReviewers || ""} onChange={(e) => updateForm({ maxReviewers: Number(e.target.value) })} min={0} className="w-32 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">명</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">1인당 지급할 포인트</label>
              <div className="flex items-center gap-2">
                <input type="number" value={form.pointReward || ""} onChange={(e) => updateForm({ pointReward: Number(e.target.value) })} min={0} className="w-40 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">포인트</span>
              </div>
              {channelInfo?.premium && form.contentType === "CLIP" && (
                <p className="text-xs text-red-500 mt-1">클립은 최소 30,000P 지급이 필수입니다.</p>
              )}
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-700"><span className="font-bold">TIP!</span> 포인트를 지급하는 경우 지원율이 평균 400% 이상 상승하며, 등급이 높은 인플루언서들의 적극적인 참여도 기대할 수 있습니다.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">모집 채널</span><span className="font-medium">{channelInfo?.label || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">모집 인원</span><span className="font-medium">{form.maxReviewers} 명</span></div>
              <div className="flex justify-between"><span className="text-gray-500">체험단 비용</span><span className="font-medium">{totalCost.toLocaleString()} P</span></div>
              <div className="flex justify-between"><span className="text-gray-500">수수료 (20%)</span><span className="font-medium">{fee.toLocaleString()} P</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="font-bold text-gray-700">필요 포인트</span><span className="font-bold text-blue-600">{requiredPoints.toLocaleString()} P</span></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">현재 나의 보유 포인트</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600">{userPoints.toLocaleString()} P</span>
                  <Link href="/advertiser/points" className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">충전하기</Link>
                </div>
              </div>
              {shortage > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">부족한 포인트</span>
                  <span className="text-sm font-bold text-red-500">{shortage.toLocaleString()} P</span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="flex justify-between mt-6 pt-4 border-t">
          {step > 1 ? <button type="button" onClick={prevStep} className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">← 이전</button> : <div />}
          {step < 5 ? (
            <button type="button" onClick={nextStep} className="px-8 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 active:scale-95 transition-all cursor-pointer">다음으로</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50 active:scale-95 transition-all cursor-pointer">{loading ? "등록중..." : "체험단 등록"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
