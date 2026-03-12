import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import CampaignApplyButton from "./CampaignApplyButton";

function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; className: string }> = {
    NAVER_BLOG: { label: "네이버블로그", className: "bg-green-100 text-green-700" },
    INSTAGRAM: { label: "인스타그램", className: "bg-pink-100 text-pink-700" },
    SHORT_FORM: { label: "숏폼영상", className: "bg-purple-100 text-purple-700" },
  };
  const info = map[platform] || { label: platform, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${info.className}`}>
      {info.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    RECRUITING: { label: "모집중", className: "bg-red-100 text-red-600" },
    IN_PROGRESS: { label: "진행중", className: "bg-yellow-100 text-yellow-700" },
    COMPLETED: { label: "완료", className: "bg-gray-100 text-gray-500" },
    CLOSED: { label: "마감", className: "bg-gray-100 text-gray-500" },
  };
  const info = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-sm font-medium px-3 py-1 rounded-full ${info.className}`}>
      {info.label}
    </span>
  );
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  BLOG_REVIEW: "블로그 리뷰",
  INSTAGRAM_POST: "인스타그램 게시물",
  INSTAGRAM_REEL: "인스타그램 릴스",
  YOUTUBE_SHORTS: "유튜브 쇼츠",
  TIKTOK: "틱톡",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      advertiser: { select: { businessName: true, name: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!campaign) return notFound();

  // Check if current user already applied
  let existingApplication = null;
  if (session?.user?.id) {
    existingApplication = await prisma.application.findUnique({
      where: {
        campaignId_reviewerId: {
          campaignId: id,
          reviewerId: session.user.id,
        },
      },
    });
  }

  const applicationStatusLabels: Record<string, { label: string; className: string }> = {
    PENDING: { label: "심사중", className: "text-yellow-600 bg-yellow-50" },
    ACCEPTED: { label: "선정됨", className: "text-green-600 bg-green-50" },
    REJECTED: { label: "미선정", className: "text-red-600 bg-red-50" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/campaigns"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; 캠페인 목록으로
      </Link>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <PlatformBadge platform={campaign.platform} />
            <StatusBadge status={campaign.status} />
            <span className="text-sm text-gray-400">
              {CONTENT_TYPE_LABELS[campaign.contentType] || campaign.contentType}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
          <p className="text-gray-500 mb-6">
            {campaign.advertiser.businessName || campaign.businessName}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-400 mb-1">포인트 보상</p>
              <p className="text-lg font-bold text-red-500">
                {campaign.pointReward.toLocaleString()}P
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">모집 인원</p>
              <p className="text-lg font-bold text-gray-900">
                {campaign._count.applications}/{campaign.maxReviewers}명
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">시작일</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(campaign.startDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">종료일</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(campaign.endDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">캠페인 상세</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
          </div>

          {/* Offer Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">제공 내용</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{campaign.offerDetails}</p>
          </div>

          {/* Requirements */}
          {campaign.requirements && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">리뷰 조건</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{campaign.requirements}</p>
            </div>
          )}

          {/* Business Address */}
          {campaign.businessAddress && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">방문 주소</h2>
              <p className="text-gray-600">{campaign.businessAddress}</p>
            </div>
          )}

          {/* Category */}
          <div className="mb-8">
            <span className="text-sm text-gray-400">카테고리: </span>
            <span className="text-sm font-medium text-gray-600">{campaign.category}</span>
          </div>

          {/* Apply Section */}
          <div className="border-t pt-6">
            {existingApplication ? (
              <div
                className={`text-center py-4 rounded-lg ${
                  applicationStatusLabels[existingApplication.status]?.className || "bg-gray-50"
                }`}
              >
                <p className="font-medium">
                  이미 신청하셨습니다 -{" "}
                  {applicationStatusLabels[existingApplication.status]?.label ||
                    existingApplication.status}
                </p>
              </div>
            ) : !session?.user ? (
              <div className="text-center">
                <p className="text-gray-500 mb-3">캠페인에 신청하려면 로그인이 필요합니다.</p>
                <Link
                  href="/auth/login"
                  className="inline-block px-8 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  로그인하기
                </Link>
              </div>
            ) : session.user.role === "REVIEWER" && campaign.status === "RECRUITING" ? (
              <CampaignApplyButton campaignId={campaign.id} />
            ) : session.user.role !== "REVIEWER" ? (
              <p className="text-center text-gray-400 py-4">
                리뷰어만 캠페인에 신청할 수 있습니다.
              </p>
            ) : (
              <p className="text-center text-gray-400 py-4">현재 모집 기간이 아닙니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
