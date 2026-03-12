"use client";

import { useEffect, useState } from "react";

interface DailyData {
  date: string;
  count: number;
}

interface StatsData {
  daily: {
    users: DailyData[];
    campaigns: DailyData[];
    applications: DailyData[];
    reviews: DailyData[];
  };
  gradeDistribution: { grade: string; count: number }[];
  platformDistribution: { platform: string; count: number }[];
}

const GRADE_LABELS: Record<string, string> = {
  BEGINNER: "신입",
  STANDARD: "일반",
  PREMIUM: "프리미엄",
  VIP: "VIP",
};

const GRADE_COLORS: Record<string, string> = {
  BEGINNER: "bg-gray-400",
  STANDARD: "bg-blue-500",
  PREMIUM: "bg-purple-500",
  VIP: "bg-yellow-500",
};

const PLATFORM_LABELS: Record<string, string> = {
  NAVER_BLOG: "네이버블로그",
  INSTAGRAM: "인스타그램",
  SHORT_FORM: "숏폼영상",
};

const PLATFORM_COLORS: Record<string, string> = {
  NAVER_BLOG: "bg-green-500",
  INSTAGRAM: "bg-pink-500",
  SHORT_FORM: "bg-purple-500",
};

function BarChart({
  data,
  color,
  label,
}: {
  data: DailyData[];
  color: string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
        <span className="text-lg font-bold text-gray-900">{total}</span>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 font-medium">
              {d.count > 0 ? d.count : ""}
            </span>
            <div
              className={`w-full ${color} rounded-t transition-all duration-300`}
              style={{
                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%`,
                minHeight: "2px",
              }}
            />
            <span className="text-[9px] text-gray-400">
              {new Date(d.date).getDate()}일
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionBar({
  items,
  labelMap,
  colorMap,
  title,
}: {
  items: { key: string; count: number }[];
  labelMap: Record<string, string>;
  colorMap: Record<string, string>;
  title: string;
}) {
  const total = items.reduce((sum, i) => sum + i.count, 0) || 1;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium">
                {labelMap[item.key] || item.key}
              </span>
              <span className="text-gray-500">{item.count}명</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorMap[item.key] || "bg-gray-400"} rounded-full transition-all duration-500`}
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCharts() {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => { if (d) setData(d); });
  }, []);

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        통계 로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">최근 7일 통계</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BarChart data={data.daily.users} color="bg-red-400" label="신규 가입" />
        <BarChart data={data.daily.campaigns} color="bg-green-400" label="캠페인 생성" />
        <BarChart data={data.daily.applications} color="bg-blue-400" label="신청" />
        <BarChart data={data.daily.reviews} color="bg-purple-400" label="리뷰 제출" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DistributionBar
          items={data.gradeDistribution.map((g) => ({ key: g.grade, count: g.count }))}
          labelMap={GRADE_LABELS}
          colorMap={GRADE_COLORS}
          title="리뷰어 등급 분포"
        />
        <DistributionBar
          items={data.platformDistribution.map((p) => ({ key: p.platform, count: p.count }))}
          labelMap={PLATFORM_LABELS}
          colorMap={PLATFORM_COLORS}
          title="플랫폼별 캠페인"
        />
      </div>
    </div>
  );
}
