"use client";

const GRADE_MAP: Record<string, { label: string; icon: string; className: string }> = {
  BEGINNER: { label: "일반", icon: "⚪", className: "bg-gray-100 text-gray-600" },
  STANDARD: { label: "초급", icon: "🥉", className: "bg-amber-50 text-amber-700" },
  INTERMEDIATE: { label: "중급", icon: "🥈", className: "bg-yellow-50 text-yellow-700" },
  ADVANCED: { label: "고급", icon: "🥇", className: "bg-orange-50 text-orange-700" },
  PREMIUM: { label: "프리미어", icon: "💎", className: "bg-blue-100 text-blue-600" },
  INFLUENCER: { label: "네이버 인플", icon: "🅝", className: "bg-green-100 text-green-700" },
  // 하위호환 (기존 VIP)
  VIP: { label: "VIP", icon: "👑", className: "bg-yellow-100 text-yellow-700" },
};

export default function GradeBadge({ grade, size = "sm" }: { grade: string; size?: "sm" | "md" }) {
  const info = GRADE_MAP[grade] || GRADE_MAP.BEGINNER;

  if (size === "md") {
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${info.className}`}>
        <span>{info.icon}</span>
        <span>{info.label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${info.className}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}
