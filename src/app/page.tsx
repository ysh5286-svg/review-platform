"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import CampaignCard, { CampaignCardData } from "@/components/CampaignCard";
import StartButton from "@/components/StartButton";

interface HomepageData {
  premium: CampaignCardData[];
  deadline: CampaignCardData[];
  newest: CampaignCardData[];
}

/* ===== 히어로 슬라이드 데이터 ===== */
const HERO_SLIDES = [
  {
    title: "체험단 매칭,",
    highlight: "더 쉽고 빠르게",
    description: "네이버 블로그, 인스타그램, 유튜브 쇼츠, 틱톡까지.\n사장님은 체험단을 모집하고, 리뷰어는 포인트를 적립하세요.",
    buttonLabel: "캠페인 둘러보기",
    buttonLink: "/campaigns",
    showStartButton: true,
    gradient: "from-red-500/10 to-orange-500/10",
  },
  {
    title: "사장님,",
    highlight: "체험단 모집이 쉬워집니다",
    description: "간편한 캠페인 등록으로 블로거·인플루언서를 바로 모집하세요.\n상위노출 키워드 체크까지 한 번에!",
    buttonLabel: "캠페인 등록하기",
    buttonLink: "/advertiser/campaigns/new",
    showStartButton: false,
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    title: "리뷰어라면,",
    highlight: "포인트 적립 시작하세요",
    description: "맛집, 뷰티, 여행 등 다양한 체험 기회!\n리뷰 작성하고 포인트를 받아보세요.",
    buttonLabel: "체험단 신청하기",
    buttonLink: "/campaigns",
    showStartButton: false,
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    title: "공지사항",
    highlight: "핫플여기 체험단 오픈!",
    description: "새롭게 오픈한 핫플여기 체험단에 오신 것을 환영합니다.\n다양한 혜택과 이벤트를 확인해보세요.",
    buttonLabel: "자세히 보기",
    buttonLink: "/faq",
    showStartButton: false,
    gradient: "from-amber-500/10 to-red-500/10",
  },
];

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSlide(idx);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    goToSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [slide, goToSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((slide + 1) % HERO_SLIDES.length);
  }, [slide, goToSlide]);

  // 자동 슬라이드 (4초)
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/campaigns/homepage")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div>
      {/* Hero 슬라이드 배너 */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${current.gradient} transition-all duration-700`}></div>
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 relative">
          {/* 좌측 화살표 */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="이전 슬라이드"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* 우측 화살표 */}
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="다음 슬라이드"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* 슬라이드 내용 */}
          <div className="text-center min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 transition-all duration-500" key={`title-${slide}`} style={{ animation: "fadeInUp 0.5s ease-out" }}>
              {current.title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">{current.highlight}</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-xl mx-auto whitespace-pre-line transition-all duration-500" key={`desc-${slide}`} style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}>
              {current.description}
            </p>
            <div className="flex gap-3 justify-center" key={`btn-${slide}`} style={{ animation: "fadeInUp 0.5s ease-out 0.2s both" }}>
              <Link
                href={current.buttonLink}
                className="px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-xl text-sm hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                {current.buttonLabel}
              </Link>
              {current.showStartButton && <StartButton />}
            </div>
          </div>

          {/* 도트 인디케이터 */}
          <div className="flex justify-center gap-2 mt-5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === slide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`슬라이드 ${i + 1}`}
              />
            ))}
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
