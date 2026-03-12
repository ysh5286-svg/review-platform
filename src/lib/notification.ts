import { prisma } from "./prisma";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({ data: params });
}

// 편의 함수들
export async function notifyApplicationReceived(advertiserId: string, campaignTitle: string, reviewerName: string, campaignId: string) {
  return createNotification({
    userId: advertiserId,
    type: "APPLICATION_RECEIVED",
    title: "새로운 신청",
    message: `${reviewerName}님이 "${campaignTitle}" 캠페인에 신청했습니다.`,
    link: `/advertiser/campaigns/${campaignId}`,
  });
}

export async function notifySelected(reviewerId: string, campaignTitle: string, campaignId: string) {
  return createNotification({
    userId: reviewerId,
    type: "SELECTED",
    title: "체험단 선정",
    message: `"${campaignTitle}" 캠페인에 선정되었습니다! 체험 후 리뷰를 작성해주세요.`,
    link: `/reviewer/reviews`,
  });
}

export async function notifyRejected(reviewerId: string, campaignTitle: string) {
  return createNotification({
    userId: reviewerId,
    type: "REJECTED",
    title: "신청 결과",
    message: `"${campaignTitle}" 캠페인에 아쉽게도 선정되지 못했습니다.`,
    link: `/reviewer/applications`,
  });
}

export async function notifyReviewApproved(reviewerId: string, campaignTitle: string, points: number) {
  return createNotification({
    userId: reviewerId,
    type: "REVIEW_APPROVED",
    title: "리뷰 승인",
    message: `"${campaignTitle}" 리뷰가 승인되었습니다! ${points.toLocaleString()}P가 적립되었습니다.`,
    link: `/reviewer/points`,
  });
}

export async function notifyReviewRejected(reviewerId: string, campaignTitle: string) {
  return createNotification({
    userId: reviewerId,
    type: "REVIEW_REJECTED",
    title: "리뷰 반려",
    message: `"${campaignTitle}" 리뷰가 반려되었습니다. 수정 후 다시 제출해주세요.`,
    link: `/reviewer/reviews`,
  });
}

export async function notifyWithdrawalProcessed(userId: string, amount: number, approved: boolean) {
  return createNotification({
    userId,
    type: "WITHDRAWAL_PROCESSED",
    title: approved ? "출금 승인" : "출금 거절",
    message: approved
      ? `${amount.toLocaleString()}원 출금이 승인되었습니다.`
      : `${amount.toLocaleString()}원 출금이 거절되었습니다.`,
    link: `/reviewer/withdraw`,
  });
}
