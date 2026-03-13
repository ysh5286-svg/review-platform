import Link from "next/link";
import Image from "next/image";

export interface CampaignCardData {
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
  offerDetails: string;
  pointReward: number;
  maxReviewers: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  advertiser: { businessName: string | null; role?: string };
  _count: { applications: number };
}

export const PLATFORM_ICONS: Record<string, string> = {
  NAVER_BLOG: "📝",
  INSTAGRAM: "📸",
  SHORT_FORM: "🎬",
};

export const CONTENT_LABELS: Record<string, string> = {
  BLOG_REVIEW: "블로그",
  BLOG_CLIP: "블로그+클립",
  CLIP: "클립",
  INSTAGRAM_POST: "인스타그램",
  INSTAGRAM_REEL: "릴스",
  YOUTUBE: "유튜브",
  YOUTUBE_SHORTS: "쇼츠",
  TIKTOK: "틱톡",
};

function getDaysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const daysLeft = getDaysLeft(campaign.endDate);
  const isRecruiting = campaign.status === "RECRUITING";

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block"
    >
      {/* 이미지 */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {campaign.imageUrl ? (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
            {"📷"}
          </div>
        )}

        {/* 상태 뱃지 */}
        {isRecruiting && daysLeft > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {daysLeft}일 남음
            </span>
            <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
              신청 <span className="font-bold">{campaign._count.applications}</span> / {campaign.maxReviewers}
            </span>
          </div>
        )}

        {!isRecruiting && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {campaign.status === "IN_PROGRESS" ? "진행중" : campaign.status === "COMPLETED" ? "완료" : "마감"}
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3">
        {/* 번호 + 플랫폼 + 유형 */}
        <div className="flex items-center gap-1 mb-1.5 text-[10px] text-gray-500">
          <span className="font-bold text-gray-400">#{campaign.campaignNumber}</span>
          <span className="text-gray-300">|</span>
          <span>{PLATFORM_ICONS[campaign.platform] || "📋"}</span>
          <span>{CONTENT_LABELS[campaign.contentType] || campaign.contentType}</span>
          <span className="text-gray-300">|</span>
          <span>{campaign.category}</span>
        </div>

        {/* 타이틀 */}
        <h3 className={`text-sm font-bold line-clamp-1 mb-0.5 ${campaign.advertiser?.role === "ADMIN" ? "text-red-500" : "text-gray-900"}`}>
          {campaign.advertiser?.businessName || campaign.businessName}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
          {campaign.offerDetails || campaign.title}
        </p>

        {/* 포인트 */}
        {campaign.pointReward > 0 && (
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {campaign.pointReward.toLocaleString()} P
          </span>
        )}
      </div>
    </Link>
  );
}
