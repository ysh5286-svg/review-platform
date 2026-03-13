"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NaverMap from "@/components/NaverMap";

/* ===== 타입 ===== */
interface CampaignData {
  id: string;
  campaignNumber: number;
  title: string;
  description: string;
  category: string;
  platform: string;
  contentType: string;
  imageUrl: string | null;
  businessName: string;
  businessAddress: string | null;
  addressDetail: string | null;
  offerDetails: string;
  requirements: string | null;
  pointReward: number;
  maxReviewers: number;
  startDate: string;
  endDate: string;
  selectionDate: string | null;
  reviewDeadline: string | null;
  status: string;
  promotionType: string | null;
  productUrl: string | null;
  contactPhone: string | null;
  availableDays: string | null;
  availableTimeStart: string | null;
  availableTimeEnd: string | null;
  is24Hours: boolean;
  sameDayReservation: boolean | null;
  reservationNote: string | null;
  missionText: string | null;
  keyword1: string | null;
  keyword2: string | null;
  keyword3: string | null;
  createdAt: string;
  updatedAt: string;
  advertiser: { id: string; businessName: string | null; name: string | null; image: string | null };
  _count: { applications: number };
}

/* ===== 상수 ===== */
const PLATFORM_MAP: Record<string, { label: string; className: string }> = {
  NAVER_BLOG: { label: "네이버블로그", className: "bg-green-100 text-green-700" },
  INSTAGRAM: { label: "인스타그램", className: "bg-pink-100 text-pink-700" },
  SHORT_FORM: { label: "숏폼영상", className: "bg-purple-100 text-purple-700" },
};

const CONTENT_LABELS: Record<string, string> = {
  BLOG_REVIEW: "블로그", BLOG_CLIP: "블로그+클립", CLIP: "클립",
  INSTAGRAM_POST: "인스타그램", INSTAGRAM_REEL: "릴스",
  YOUTUBE: "유튜브", YOUTUBE_SHORTS: "쇼츠", TIKTOK: "틱톡",
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  RECRUITING: { label: "모집중", className: "bg-red-100 text-red-600" },
  IN_PROGRESS: { label: "진행중", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-gray-100 text-gray-500" },
  CLOSED: { label: "마감", className: "bg-gray-100 text-gray-500" },
};

const PROMOTION_LABELS: Record<string, string> = {
  방문형: "방문형", 포장형: "포장형", 배송형: "배송형", 구매형: "구매형",
};

const APP_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "심사중", className: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  ACCEPTED: { label: "선정됨", className: "text-green-600 bg-green-50 border-green-200" },
  REJECTED: { label: "미선정", className: "text-red-600 bg-red-50 border-red-200" },
};

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

/* ===== 채널별 미션 아이콘 정의 ===== */
const MISSION_ICONS: Record<string, { label: string; icon: string }[]> = {
  BLOG_REVIEW: [
    { label: "키워드", icon: "keyword" },
    { label: "15장 이상", icon: "photo" },
    { label: "1,000자", icon: "text" },
    { label: "지도 첨부", icon: "map" },
    { label: "동영상 or GIF", icon: "video" },
    { label: "공정위 표기", icon: "ad" },
  ],
  BLOG_CLIP: [], // 특수 처리 (블로그 + 클립 두 섹션)
  CLIP: [
    { label: "해시태그", icon: "hashtag" },
    { label: "지도 첨부", icon: "map" },
    { label: "15초 이상", icon: "duration" },
    { label: "#협찬 #리뷰노트", icon: "sponsored" },
  ],
  INSTAGRAM_POST: [
    { label: "해시태그", icon: "hashtag" },
    { label: "사진 3장 이상", icon: "photo" },
    { label: "지도 첨부", icon: "map" },
    { label: "#협찬 표기", icon: "sponsored" },
  ],
  INSTAGRAM_REEL: [
    { label: "해시태그", icon: "hashtag" },
    { label: "지도 첨부", icon: "map" },
    { label: "30초 이상", icon: "duration" },
    { label: "#협찬 #리뷰노트", icon: "sponsored" },
    { label: "목소리 필수", icon: "voice" },
  ],
  YOUTUBE: [
    { label: "키워드", icon: "keyword" },
    { label: "태그", icon: "hashtag" },
    { label: "3분 이상", icon: "duration" },
    { label: "유료광고 표시", icon: "ad" },
    { label: "목소리 필수", icon: "voice" },
  ],
  YOUTUBE_SHORTS: [
    { label: "키워드", icon: "keyword" },
    { label: "지도 첨부", icon: "map" },
    { label: "30초 이상", icon: "duration" },
    { label: "유료광고 표시", icon: "ad" },
    { label: "목소리 필수", icon: "voice" },
  ],
  TIKTOK: [
    { label: "키워드", icon: "keyword" },
    { label: "지도 첨부", icon: "map" },
    { label: "30초 이상", icon: "duration" },
    { label: "유료광고 표시", icon: "ad" },
    { label: "목소리 필수", icon: "voice" },
  ],
};

const BLOG_CLIP_BLOG = [
  { label: "키워드", icon: "keyword" },
  { label: "15장 이상", icon: "photo" },
  { label: "1,000자", icon: "text" },
  { label: "지도 첨부", icon: "map" },
  { label: "동영상 or GIF", icon: "video" },
  { label: "공정위 표기", icon: "ad" },
];
const BLOG_CLIP_CLIP = [
  { label: "해시태그", icon: "hashtag" },
  { label: "지도 첨부", icon: "map" },
  { label: "15초 이상", icon: "duration" },
  { label: "#협찬 #리뷰노트", icon: "sponsored" },
];

function MissionIcon({ icon }: { icon: string }) {
  const svgClass = "w-6 h-6 text-gray-600";
  switch (icon) {
    case "keyword":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 7v4m-2-2h4" /></svg>;
    case "photo":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case "text":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 16l-4 4m0-4l4 4" /></svg>;
    case "map":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case "video":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>;
    case "duration":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>;
    case "hashtag":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
    case "ad":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    case "voice":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
    case "sponsored":
      return <svg className={svgClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;
    default:
      return null;
  }
}

function MissionIconRow({ items }: { items: { label: string; icon: string }[] }) {
  return (
    <div className="flex items-start justify-center gap-3 sm:gap-5 py-4 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 w-14 sm:w-16">
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <MissionIcon icon={item.icon} />
          </div>
          <span className="text-[10px] sm:text-[11px] text-gray-600 text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== 미니 달력 (기간별 컬러 바) ===== */
interface MiniCalendarProps {
  startDate: string;
  endDate: string;
  selectionDate?: string | null;
  reviewDeadline?: string | null;
}

function toLocalDate(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface PeriodBar {
  label: string;
  startDate: Date;
  endDate: Date;
  bgColor: string;
  textColor: string;
}

function MiniCalendar({ startDate, endDate, selectionDate, reviewDeadline }: MiniCalendarProps) {
  const recruitStart = toLocalDate(new Date(startDate));
  const recruitEnd = toLocalDate(new Date(endDate));
  const selDate = selectionDate ? toLocalDate(new Date(selectionDate)) : null;
  const revDeadline = reviewDeadline ? toLocalDate(new Date(reviewDeadline)) : null;

  const [viewDate, setViewDate] = useState(() => new Date(recruitStart));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Build cells: null for empty, number for day
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const today = toLocalDate(new Date());
  const isToday = (day: number) => year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  // Build period bars
  const periods: PeriodBar[] = [];
  periods.push({ label: "모집", startDate: recruitStart, endDate: recruitEnd, bgColor: "bg-amber-100", textColor: "text-amber-700" });
  if (selDate && revDeadline) {
    periods.push({ label: "체험&리뷰", startDate: selDate, endDate: revDeadline, bgColor: "bg-sky-100", textColor: "text-sky-700" });
  }

  // For each week row, compute which bars overlap
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  function getWeekDateRange(weekIdx: number): { weekStart: Date; weekEnd: Date } {
    // First cell of the week
    const firstCellIdx = weekIdx * 7;
    let startDay = 1;
    let endDay = daysInMonth;
    // Find first non-null day in week
    for (let i = 0; i < 7; i++) {
      const cell = cells[firstCellIdx + i];
      if (cell !== null) { startDay = cell; break; }
    }
    // Find last non-null day in week
    for (let i = 6; i >= 0; i--) {
      const cell = cells[firstCellIdx + i];
      if (cell !== null) { endDay = cell; break; }
    }
    return {
      weekStart: new Date(year, month, startDay),
      weekEnd: new Date(year, month, endDay),
    };
  }

  function getBarForWeek(period: PeriodBar, weekIdx: number): { colStart: number; colSpan: number } | null {
    const { weekStart, weekEnd } = getWeekDateRange(weekIdx);
    // Check overlap
    if (period.endDate < weekStart || period.startDate > weekEnd) return null;

    const barStart = period.startDate > weekStart ? period.startDate : weekStart;
    const barEnd = period.endDate < weekEnd ? period.endDate : weekEnd;

    // Find column positions
    const firstCellIdx = weekIdx * 7;
    let colStart = 0;
    let colEnd = 6;

    for (let i = 0; i < 7; i++) {
      const cell = cells[firstCellIdx + i];
      if (cell !== null) {
        const cellDate = new Date(year, month, cell);
        if (cellDate.getTime() === barStart.getTime()) { colStart = i; break; }
      }
      if (cell === null && i < 7) {
        // For empty cells at start of month, check if period starts before month
        if (period.startDate < weekStart) { colStart = i; break; }
      }
    }

    for (let i = 6; i >= 0; i--) {
      const cell = cells[firstCellIdx + i];
      if (cell !== null) {
        const cellDate = new Date(year, month, cell);
        if (cellDate.getTime() === barEnd.getTime()) { colEnd = i; break; }
      }
      if (cell === null && i > 0) {
        if (period.endDate > weekEnd) { colEnd = i; break; }
      }
    }

    // Handle period starting before this month
    if (period.startDate < new Date(year, month, 1) && weekIdx === 0) {
      colStart = 0;
    }
    // Handle period ending after this month
    if (period.endDate > new Date(year, month, daysInMonth) && weekIdx === weeks.length - 1) {
      colEnd = 6;
    }

    return { colStart, colSpan: colEnd - colStart + 1 };
  }

  // Check if deadline is in this month
  const deadlineInMonth = revDeadline && revDeadline.getFullYear() === year && revDeadline.getMonth() === month;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-bold text-gray-900">{year}년 {month + 1}월</span>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-xs mb-1">
        {["일","월","화","수","목","금","토"].map((d) => (
          <span key={d} className="py-1 text-gray-400 font-medium">{d}</span>
        ))}
      </div>

      {/* Calendar weeks with bars */}
      {weeks.map((week, wi) => (
        <div key={wi} className="relative">
          {/* Day numbers */}
          <div className="grid grid-cols-7 text-center text-xs">
            {week.map((day, di) => {
              if (day === null) return <span key={`e-${wi}-${di}`} className="py-1.5" />;
              const todayClass = isToday(day) ? "bg-blue-500 text-white font-bold rounded-full" : "";
              const isDeadline = deadlineInMonth && day === revDeadline!.getDate();
              return (
                <span key={day} className={`py-1.5 relative ${todayClass || "text-gray-600"}`}>
                  {day}일
                  {isDeadline && !isToday(day) && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                  )}
                </span>
              );
            })}
          </div>
          {/* Period bars */}
          <div className="relative h-auto">
            {periods.map((period) => {
              const bar = getBarForWeek(period, wi);
              if (!bar) return null;
              const left = `${(bar.colStart / 7) * 100}%`;
              const width = `${(bar.colSpan / 7) * 100}%`;
              return (
                <div
                  key={`${period.label}-${wi}`}
                  className={`${period.bgColor} ${period.textColor} text-[9px] font-bold rounded-sm h-4 flex items-center justify-center overflow-hidden`}
                  style={{ marginLeft: left, width }}
                >
                  {bar.colSpan >= 2 ? period.label : ""}
                </div>
              );
            })}
            {/* Deadline marker */}
            {revDeadline && (() => {
              const { weekStart, weekEnd } = getWeekDateRange(wi);
              if (revDeadline < weekStart || revDeadline > weekEnd) return null;
              // Find column
              const firstCellIdx = wi * 7;
              let col = 0;
              for (let i = 0; i < 7; i++) {
                const cell = cells[firstCellIdx + i];
                if (cell !== null && new Date(year, month, cell).getTime() === revDeadline.getTime()) { col = i; break; }
              }
              const left = `${(col / 7) * 100}%`;
              return (
                <div
                  className="bg-red-100 text-red-600 text-[9px] font-bold rounded-sm h-4 flex items-center justify-center"
                  style={{ marginLeft: left, width: `${(1 / 7) * 100}%` }}
                >
                  마감
                </div>
              );
            })()}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-200" /> 모집</span>
        {selDate && revDeadline && (
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-sky-200" /> 체험&리뷰</span>
        )}
        {revDeadline && (
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-100" /> 마감</span>
        )}
      </div>
    </div>
  );
}

/* ===== 키워드 복사 버튼 ===== */
function KeywordCopyButton({ keyword }: { keyword: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(keyword);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors cursor-pointer group"
    >
      <span className="font-medium text-gray-700">{keyword}</span>
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      )}
    </button>
  );
}

/* ===== 메인 컴포넌트 ===== */
export default function CampaignDetailClient({
  campaign,
  existingApplication,
  userRole,
  isLoggedIn,
}: {
  campaign: CampaignData;
  existingApplication: { status: string } | null;
  userRole: string | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");

  const platformInfo = PLATFORM_MAP[campaign.platform] || { label: campaign.platform, className: "bg-gray-100 text-gray-700" };
  const statusInfo = STATUS_MAP[campaign.status] || { label: campaign.status, className: "bg-gray-100 text-gray-700" };
  const contentLabel = CONTENT_LABELS[campaign.contentType] || campaign.contentType;

  const keywords = [campaign.keyword1, campaign.keyword2, campaign.keyword3].filter(Boolean) as string[];
  const availableDays = campaign.availableDays ? (() => { try { return JSON.parse(campaign.availableDays); } catch { return campaign.availableDays.split(","); } })() : [];

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "신청에 실패했습니다.");
      }
      setShowModal(false);
      router.refresh();
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 뒤로가기 */}
      <Link href="/campaigns" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        캠페인 목록으로
      </Link>

      {/* 타이틀 */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3 mb-2">{campaign.title}</h1>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-bold text-gray-400">#{campaign.campaignNumber}</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${platformInfo.className}`}>{platformInfo.label}</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
        {campaign.promotionType && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
            {PROMOTION_LABELS[campaign.promotionType] || campaign.promotionType}
          </span>
        )}
        <span className="text-xs text-gray-400">{contentLabel}</span>
        {campaign.pointReward > 0 && (
          <span className="text-xs font-bold text-red-500 ml-auto">{campaign.pointReward.toLocaleString()}P</span>
        )}
      </div>

      {/* 2열 레이아웃 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ===== 좌측: 상세 정보 ===== */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* 모바일에서만 보이는 썸네일 */}
          {campaign.imageUrl && (
            <div className="lg:hidden rounded-xl overflow-hidden border">
              <Image src={campaign.imageUrl} alt={campaign.title} width={800} height={600} className="w-full object-cover aspect-[4/3]" />
            </div>
          )}

          {/* 캠페인 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <span className="font-bold">{"✏️"} 해당 체험단은 {campaign.promotionType || "방문형"} 체험단입니다.</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              리뷰어에게 직접 방문하여 서비스나 제품을 체험한 뒤, 사진과 후기를 작성합니다.
            </p>
          </div>

          {/* 주최자 */}
          <div className="flex items-center gap-3 py-3 border-b">
            <span className="text-sm text-gray-400 w-20 shrink-0">주최자</span>
            <div className="flex items-center gap-2">
              {campaign.advertiser.image ? (
                <Image src={campaign.advertiser.image} alt="" width={28} height={28} className="rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {(campaign.advertiser.businessName || campaign.advertiser.name || "?")?.[0]}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900">
                {campaign.advertiser.businessName || campaign.advertiser.name} 사장님
              </span>
            </div>
          </div>

          {/* 제공 서비스/물품 */}
          <div className="py-3 border-b">
            <span className="text-sm text-gray-400 block mb-2">제공서비스/물품</span>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{campaign.offerDetails}</p>
          </div>

          {/* 방문 정보 (방문형/포장형) */}
          {campaign.businessAddress && (
            <div className="py-3 border-b">
              <span className="text-sm font-semibold text-gray-900 block mb-3">방문 정보</span>
              {/* 네이버 지도 */}
              <div className="mb-3">
                <NaverMap address={campaign.businessAddress} />
              </div>
              {/* 방문 주소 */}
              <div className="flex items-start gap-3">
                <span className="text-sm text-gray-400 shrink-0 pt-0.5">방문 주소</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{campaign.businessAddress}</p>
                  {campaign.addressDetail && <p className="text-xs text-gray-500 mt-0.5">{campaign.addressDetail}</p>}
                </div>
              </div>
            </div>
          )}

          {/* 방문 및 예약 안내 */}
          {(availableDays.length > 0 || campaign.availableTimeStart || campaign.is24Hours || campaign.sameDayReservation !== null) && (
            <div className="py-3 border-b">
              <span className="text-sm text-gray-400 block mb-3">방문 및 예약 안내</span>
              <div className="space-y-2 text-sm text-gray-700">
                {availableDays.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">-</span>
                    <span>체험 가능 요일 : {DAYS.filter(d => availableDays.includes(d)).join(" / ")}</span>
                  </div>
                )}
                {(campaign.availableTimeStart || campaign.is24Hours) && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">-</span>
                    <span>
                      체험 가능 시간 : {campaign.is24Hours ? "24시간" : `${campaign.availableTimeStart || ""} ~ ${campaign.availableTimeEnd || ""}`}
                    </span>
                  </div>
                )}
                {campaign.sameDayReservation !== null && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">-</span>
                    <span>당일 예약 및 방문 {campaign.sameDayReservation ? "가능" : "불가"}</span>
                  </div>
                )}
              </div>
              {campaign.reservationNote && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{campaign.reservationNote}</p>
                </div>
              )}
            </div>
          )}

          {/* 상세 설명 */}
          {campaign.description && campaign.description !== campaign.offerDetails && (
            <div className="py-3 border-b">
              <span className="text-sm text-gray-400 block mb-2">캠페인 상세</span>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
            </div>
          )}

          {/* 리뷰 조건 */}
          {campaign.requirements && (
            <div className="py-3 border-b">
              <span className="text-sm text-gray-400 block mb-2">리뷰 조건</span>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.requirements}</p>
            </div>
          )}

          {/* 키워드 정보 */}
          {keywords.length > 0 && (
            <div className="py-3 border-b">
              <span className="text-sm text-gray-400 block mb-3">키워드 정보</span>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <KeywordCopyButton key={i} keyword={kw} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">클릭하면 키워드가 복사됩니다</p>
            </div>
          )}

          {/* 체험단 미션 */}
          {campaign.missionText && (
            <div className="py-3 border-b">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">체험단 미션</span>
                <span className="text-sm text-gray-500">{contentLabel}</span>
              </div>

              {/* 채널별 미션 아이콘 */}
              {campaign.contentType === "BLOG_CLIP" ? (
                <>
                  <div className="border-b">
                    <p className="text-xs text-center text-gray-400 pt-2">블로그</p>
                    <MissionIconRow items={BLOG_CLIP_BLOG} />
                  </div>
                  <div>
                    <p className="text-xs text-center text-gray-400 pt-2">클립</p>
                    <MissionIconRow items={BLOG_CLIP_CLIP} />
                  </div>
                </>
              ) : (
                <MissionIconRow items={MISSION_ICONS[campaign.contentType] || MISSION_ICONS.BLOG_REVIEW} />
              )}

              {/* 사장님 요청 미션 */}
              {campaign.missionText && (
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">사장님 요청 미션</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.missionText}</p>
                </div>
              )}
            </div>
          )}

          {/* 방문형 필수 체크 사항 */}
          {(campaign.promotionType === "방문형" || campaign.promotionType === "포장형") && (
            <div className="bg-gray-50 rounded-xl p-5 border">
              <h4 className="text-sm font-bold text-gray-900 text-center mb-4">방문형 필수 체크 사항</h4>
              <div className="space-y-2.5">
                {[
                  "리뷰 미등록시 최소징수 부과대미, 제공한 서비스 비용이 청구될 수 있습니다.",
                  "초과비용은 본인 부담이며, 타 쿠폰 중복 적용 및 포장 불가합니다.",
                  "예약 후 방문하지 않거나, 당일취소의 경우 노쇼 패널티가 부과됩니다.",
                  "작성하신 콘텐츠는 6개월 유지, 업체 홍보용으로 활용될 수 있습니다.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="text-xs text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 배송형/구매형 제품 URL */}
          {campaign.productUrl && (
            <div className="py-3 border-b">
              <span className="text-sm text-gray-400 block mb-2">제품 링크</span>
              <a href={campaign.productUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">
                {campaign.productUrl}
              </a>
            </div>
          )}

          {/* 담당자 연락처 */}
          {campaign.contactPhone && (
            <div className="py-3 border-b">
              <span className="text-sm text-gray-400 block mb-2">담당자 연락처</span>
              <p className="text-sm text-gray-700">{campaign.contactPhone}</p>
            </div>
          )}
        </div>

        {/* ===== 우측: 스티키 사이드바 ===== */}
        <div className="lg:w-[320px] shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* 썸네일 */}
            {campaign.imageUrl && (
              <div className="hidden lg:block rounded-xl overflow-hidden border">
                <Image src={campaign.imageUrl} alt={campaign.title} width={320} height={240} className="w-full object-cover aspect-[4/3]" />
              </div>
            )}

            {/* 체험단 일정 (달력) */}
            <div className="bg-white rounded-xl border p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">체험단 일정</h4>
              <MiniCalendar startDate={campaign.startDate} endDate={campaign.endDate} selectionDate={campaign.selectionDate} reviewDeadline={campaign.reviewDeadline} />
            </div>

            {/* 모집 현황 */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">모집 인원</span>
                <span className="text-sm font-bold text-gray-900">{campaign._count.applications} / {campaign.maxReviewers}명</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((campaign._count.applications / campaign.maxReviewers) * 100, 100)}%` }}
                />
              </div>
              {campaign.pointReward > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">포인트 보상</span>
                  <span className="text-sm font-bold text-red-500">{campaign.pointReward.toLocaleString()}P</span>
                </div>
              )}
            </div>

            {/* 신청 버튼 영역 */}
            <div className="bg-white rounded-xl border p-4">
              {existingApplication ? (
                <div className={`text-center py-3 rounded-lg border ${APP_STATUS_MAP[existingApplication.status]?.className || "bg-gray-50"}`}>
                  <p className="font-medium text-sm">
                    이미 신청하셨습니다 - {APP_STATUS_MAP[existingApplication.status]?.label || existingApplication.status}
                  </p>
                </div>
              ) : !isLoggedIn ? (
                <Link href="/auth/login" className="block w-full text-center py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  로그인 후 신청하기
                </Link>
              ) : userRole === "REVIEWER" && campaign.status === "RECRUITING" ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm cursor-pointer"
                >
                  신청하기
                </button>
              ) : userRole !== "REVIEWER" ? (
                <p className="text-center text-gray-400 py-3 text-sm">리뷰어만 신청할 수 있습니다.</p>
              ) : (
                <p className="text-center text-gray-400 py-3 text-sm">현재 모집 기간이 아닙니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 신청 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">캠페인 신청</h3>
            <form onSubmit={handleApply}>
              <label className="block text-sm font-medium text-gray-700 mb-1">신청 메시지 (선택)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="자기소개나 관련 경험을 적어주세요..."
              />
              {applyError && <p className="text-red-500 text-sm mb-3">{applyError}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">취소</button>
                <button type="submit" disabled={applyLoading} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer">
                  {applyLoading ? "신청중..." : "신청하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
