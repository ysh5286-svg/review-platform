// 이메일 알림 유틸리티
// 실제 이메일 발송은 Resend, Nodemailer 등 연동 필요
// 현재는 로깅 + 알림 생성으로 대체

import { prisma } from "./prisma";

interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

// 이메일 발송 (향후 Resend/Nodemailer 연동)
async function sendEmail(params: EmailParams) {
  // TODO: 실제 이메일 발송 연동
  console.log(`[EMAIL] To: ${params.to}, Subject: ${params.subject}`);
  return true;
}

// 이메일 알림이 설정된 경우 이메일도 함께 발송
export async function notifyWithEmail(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  // 인앱 알림 생성
  await prisma.notification.create({ data: params });

  // 이메일 발송
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true },
  });

  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: `[핫플여기체험단] ${params.title}`,
      body: `안녕하세요 ${user.name || "회원"}님,\n\n${params.message}\n\n핫플여기체험단 드림`,
    });
  }
}

// 편의 함수들 (이메일 포함)
export async function emailNotifySelected(reviewerId: string, campaignTitle: string) {
  return notifyWithEmail({
    userId: reviewerId,
    type: "SELECTED",
    title: "체험단 선정 알림",
    message: `"${campaignTitle}" 캠페인에 선정되었습니다! 체험 후 리뷰를 작성해주세요.`,
    link: "/reviewer/reviews",
  });
}

export async function emailNotifyReviewApproved(reviewerId: string, campaignTitle: string, points: number) {
  return notifyWithEmail({
    userId: reviewerId,
    type: "REVIEW_APPROVED",
    title: "리뷰 승인 및 포인트 적립",
    message: `"${campaignTitle}" 리뷰가 승인되었습니다! ${points.toLocaleString()}P가 적립되었습니다.`,
    link: "/reviewer/points",
  });
}

export async function emailNotifyWithdrawal(userId: string, amount: number, approved: boolean) {
  return notifyWithEmail({
    userId,
    type: "WITHDRAWAL_PROCESSED",
    title: approved ? "출금 승인 완료" : "출금 거절",
    message: approved
      ? `${amount.toLocaleString()}원 출금이 승인되었습니다. 등록된 계좌로 입금 예정입니다.`
      : `${amount.toLocaleString()}원 출금이 거절되었습니다. 자세한 사유는 출금 내역에서 확인해주세요.`,
    link: "/reviewer/withdraw",
  });
}

export async function emailNotifyNewApplication(advertiserId: string, reviewerName: string, campaignTitle: string, campaignId: string) {
  return notifyWithEmail({
    userId: advertiserId,
    type: "APPLICATION_RECEIVED",
    title: "새로운 체험단 신청",
    message: `${reviewerName}님이 "${campaignTitle}" 캠페인에 신청했습니다.`,
    link: `/advertiser/campaigns/${campaignId}`,
  });
}

export async function emailNotifyNewMessage(receiverId: string, senderName: string) {
  return notifyWithEmail({
    userId: receiverId,
    type: "NEW_MESSAGE",
    title: "새 메시지 도착",
    message: `${senderName}님이 메시지를 보냈습니다.`,
    link: "/messages",
  });
}
