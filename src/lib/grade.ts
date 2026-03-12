import { ReviewerGrade } from "@/generated/prisma/client";

// 등급별 라벨
export const GRADE_LABELS: Record<string, string> = {
  BEGINNER: "일반",
  STANDARD: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  PREMIUM: "프리미어",
  INFLUENCER: "네이버 인플",
};

// 등급별 아이콘
export const GRADE_ICONS: Record<string, string> = {
  BEGINNER: "⚪",
  STANDARD: "🥉",
  INTERMEDIATE: "🥈",
  ADVANCED: "🥇",
  PREMIUM: "💎",
  INFLUENCER: "🅝",
};

// 등급별 조건
export const GRADE_REQUIREMENTS = {
  BEGINNER: { minReviews: 0, minApprovalRate: 0, minTopRate: 0, label: "일반" },
  STANDARD: { minReviews: 3, minApprovalRate: 60, minTopRate: 0, label: "초급" },
  INTERMEDIATE: { minReviews: 10, minApprovalRate: 75, minTopRate: 10, label: "중급" },
  ADVANCED: { minReviews: 20, minApprovalRate: 85, minTopRate: 25, label: "고급" },
  PREMIUM: { minReviews: 35, minApprovalRate: 90, minTopRate: 40, label: "프리미어" },
  INFLUENCER: { minReviews: 0, minApprovalRate: 0, minTopRate: 0, label: "네이버 인플" },
} as const;

// 등급별 혜택
export const GRADE_BENEFITS = {
  BEGINNER: { pointBonus: 0, prioritySelection: false, maxApplications: 3, description: "모든 체험단에 선정될 확률 낮음" },
  STANDARD: { pointBonus: 3, prioritySelection: false, maxApplications: 5, description: "일반 체험단에 선정될 확률 높음" },
  INTERMEDIATE: { pointBonus: 5, prioritySelection: false, maxApplications: 8, description: "일반 체험단에 선정될 확률 매우 높음" },
  ADVANCED: { pointBonus: 10, prioritySelection: true, maxApplications: 12, description: "프리미엄 체험단에 선정될 확률 높음" },
  PREMIUM: { pointBonus: 15, prioritySelection: true, maxApplications: 20, description: "프리미엄 체험단에 선정될 확률 매우 높음" },
  INFLUENCER: { pointBonus: 20, prioritySelection: true, maxApplications: 30, description: "네이버에서 공식 인증한 네이버 인플루언서" },
} as const;

// 등급 색상
export const GRADE_COLORS = {
  BEGINNER: { bg: "bg-gray-100", text: "text-gray-600", badge: "bg-gray-400", border: "border-gray-300" },
  STANDARD: { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-600", border: "border-amber-400" },
  INTERMEDIATE: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-500", border: "border-yellow-400" },
  ADVANCED: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-500", border: "border-orange-400" },
  PREMIUM: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-600", border: "border-blue-400" },
  INFLUENCER: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-600", border: "border-green-400" },
} as const;

// 등급 순서 (비교용)
export const GRADE_ORDER: ReviewerGrade[] = [
  "BEGINNER",
  "STANDARD",
  "INTERMEDIATE",
  "ADVANCED",
  "PREMIUM",
  "INFLUENCER",
];

// 등급 산정 로직
export function calculateGrade(stats: {
  totalReviews: number;
  approvedReviews: number;
  topRankCount: number;
}): ReviewerGrade {
  const { totalReviews, approvedReviews, topRankCount } = stats;
  const approvalRate = totalReviews > 0 ? (approvedReviews / totalReviews) * 100 : 0;
  const topRate = totalReviews > 0 ? (topRankCount / totalReviews) * 100 : 0;

  if (
    totalReviews >= GRADE_REQUIREMENTS.PREMIUM.minReviews &&
    approvalRate >= GRADE_REQUIREMENTS.PREMIUM.minApprovalRate &&
    topRate >= GRADE_REQUIREMENTS.PREMIUM.minTopRate
  ) {
    return "PREMIUM";
  }

  if (
    totalReviews >= GRADE_REQUIREMENTS.ADVANCED.minReviews &&
    approvalRate >= GRADE_REQUIREMENTS.ADVANCED.minApprovalRate &&
    topRate >= GRADE_REQUIREMENTS.ADVANCED.minTopRate
  ) {
    return "ADVANCED";
  }

  if (
    totalReviews >= GRADE_REQUIREMENTS.INTERMEDIATE.minReviews &&
    approvalRate >= GRADE_REQUIREMENTS.INTERMEDIATE.minApprovalRate &&
    topRate >= GRADE_REQUIREMENTS.INTERMEDIATE.minTopRate
  ) {
    return "INTERMEDIATE";
  }

  if (
    totalReviews >= GRADE_REQUIREMENTS.STANDARD.minReviews &&
    approvalRate >= GRADE_REQUIREMENTS.STANDARD.minApprovalRate
  ) {
    return "STANDARD";
  }

  return "BEGINNER";
}

export function getGradeLabel(grade: ReviewerGrade): string {
  return GRADE_LABELS[grade] || grade;
}
