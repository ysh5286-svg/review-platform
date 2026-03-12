"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CampaignCard, { CampaignCardData } from "@/components/CampaignCard";
import StartButton from "@/components/StartButton";

interface HomepageData {
  premium: CampaignCardData[];
  deadline: CampaignCardData[];
  newest: CampaignCardData[];
}

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns/homepage")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section - 간결하게 */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 relative">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              체험단 매칭,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">더 쉽고 빠르게</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-xl mx-auto">
              네이버 블로그, 인스타그램, 유튜브 쇼츠, 틱톡까지. 지금 바로 시작하세요.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/campaigns"
                className="px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-xl text-sm hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                캠페인 둘러보기
              </Link>
              <StartButton />
            </div>
          </div>
        </div>
      </section>

      {/* 캠페인 섹션 */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {loading ? (
          <>
            <SkeletonSection title="프리미엄 체험단" />
            <SkeletonSection title="마감 임박 체험단" />
            <SkeletonSection title="신규 체험단" />
          </>
        ) : (
          <>
            <CampaignSection
              title="🏆 프리미엄 체험단"
              campaigns={data?.premium || []}
              moreLink="/campaigns?sort=popular"
            />
            <CampaignSection
              title="⏰ 마감 임박 체험단"
              campaigns={data?.deadline || []}
              moreLink="/campaigns?sort=deadline"
            />
            <CampaignSection
              title="✨ 신규 체험단"
              campaigns={data?.newest || []}
              moreLink="/campaigns?sort=latest"
            />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-3">서비스</h4>
              <div className="space-y-2 text-sm">
                <Link href="/campaigns" className="block hover:text-white transition-colors">캠페인 둘러보기</Link>
                <Link href="/leaderboard" className="block hover:text-white transition-colors">리뷰어 랭킹</Link>
                <Link href="/faq" className="block hover:text-white transition-colors">자주 묻는 질문</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">광고주</h4>
              <div className="space-y-2 text-sm">
                <Link href="/advertiser/campaigns" className="block hover:text-white transition-colors">캠페인 관리</Link>
                <Link href="/advertiser/points" className="block hover:text-white transition-colors">포인트 충전</Link>
                <Link href="/advertiser/stats" className="block hover:text-white transition-colors">리뷰 통계</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">리뷰어</h4>
              <div className="space-y-2 text-sm">
                <Link href="/reviewer/applications" className="block hover:text-white transition-colors">내 신청 내역</Link>
                <Link href="/reviewer/points" className="block hover:text-white transition-colors">포인트 내역</Link>
                <Link href="/reviewer/withdraw" className="block hover:text-white transition-colors">출금 신청</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">정책</h4>
              <div className="space-y-2 text-sm">
                <Link href="/terms" className="block hover:text-white transition-colors">이용약관</Link>
                <Link href="/privacy" className="block hover:text-white transition-colors">개인정보처리방침</Link>
                <Link href="/faq" className="block hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; 2026 핫플여기체험단. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===== 캠페인 섹션 컴포넌트 ===== */
function CampaignSection({
  title,
  campaigns,
  moreLink,
}: {
  title: string;
  campaigns: CampaignCardData[];
  moreLink: string;
}) {
  if (campaigns.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
        <Link
          href={moreLink}
          className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          더보기 →
        </Link>
      </div>

      {/* 모바일: 가로 스크롤 / 데스크톱: 그리드 */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 scrollbar-hide">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="min-w-[200px] sm:min-w-[220px] snap-start lg:min-w-0">
            <CampaignCard campaign={campaign} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===== 스켈레톤 섹션 ===== */
function SkeletonSection({ title }: { title: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[200px] sm:min-w-[220px] lg:min-w-0">
            <div className="bg-white rounded-xl border overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
