import { ReviewerGrade } from "@/generated/prisma/client";

// 등급별 조건
export const GRADE_REQUIREMENTS = {
  BEGINNER: { minReviews: 0, minApprovalRate: 0, minTopRate: 0, label: "신입" },
  STANDARD: { minReviews: 5, minApprovalRate: 70, minTopRate: 0, label: "일반" },
  PREMIUM: { minReviews: 15, minApprovalRate: 85, minTopRate: 20, label: "프리미엄" },
  VIP: { minReviews: 30, minApprovalRate: 90, minTopRate: 40, label: "VIP" },
} as const;

// 등급별 혜택
export const GRADE_BENEFITS = {
  BEGINNER: { pointBonus: 0, prioritySelection: false, maxApplications: 3 },
  STANDARD: { pointBonus: 5, prioritySelection: false, maxApplications: 5 },
  PREMIUM: { pointBonus: 10, prioritySelection: true, maxApplications: 10 },
  VIP: { pointBonus: 20, prioritySelection: true, maxApplications: 20 },
} as const;

// 등급 색상
export const GRADE_COLORS = {
  BEGINNER: { bg: "bg-gray-100", text: "text-gray-600", badge: "bg-gray-500" },
  STANDARD: { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-500" },
  PREMIUM: { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-500" },
  VIP: { bg: "bg-yellow-100", text: "text-yellow-700", badge: "bg-yellow-500" },
} as const;

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
    totalReviews >= GRADE_REQUIREMENTS.VIP.minReviews &&
    approvalRate >= GRADE_REQUIREMENTS.VIP.minApprovalRate &&
    topRate >= GRADE_REQUIREMENTS.VIP.minTopRate
  ) {
    return "VIP";
  }

  if (
    totalReviews >= GRADE_REQUIREMENTS.PREMIUM.minReviews &&
    approvalRate >= GRADE_REQUIREMENTS.PREMIUM.minApprovalRate &&
    topRate >= GRADE_REQUIREMENTS.PREMIUM.minTopRate
  ) {
    return "PREMIUM";
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
  return GRADE_REQUIREMENTS[grade].label;
}
