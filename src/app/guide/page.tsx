"use client";

import { useState } from "react";

type Tab = "reviewer" | "advertiser" | "common";
type SubTab = string;

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<Tab>("reviewer");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("process");

  const subTabs: Record<Tab, { key: string; label: string }[]> = {
    reviewer: [
      { key: "process", label: "신청 방법" },
      { key: "review-guide", label: "리뷰 가이드" },
      { key: "extension", label: "체험단 연장" },
      { key: "cancel", label: "취소 시스템" },
    ],
    advertiser: [
      { key: "visit", label: "방문/포장형" },
      { key: "delivery", label: "배송형" },
      { key: "purchase", label: "구매형" },
      { key: "reporter", label: "기자단" },
      { key: "ad-process", label: "진행 절차" },
      { key: "rejection", label: "반려사유" },
      { key: "agency", label: "대행 서비스" },
    ],
    common: [
      { key: "grades", label: "등급 안내" },
      { key: "penalty", label: "페널티" },
      { key: "prohibited", label: "금지/제한" },
    ],
  };

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setActiveSubTab(subTabs[tab][0].key);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">📖 이용가이드</h1>
        <p className="text-sm text-gray-500 mt-1">핫플여기체험단 이용 방법을 안내합니다</p>
      </div>

      {/* 메인 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {([
          { key: "reviewer", label: "🧑‍💻 리뷰어", desc: "체험단 신청/리뷰" },
          { key: "advertiser", label: "🏪 광고주", desc: "체험단 등록/관리" },
          { key: "common", label: "📋 공통", desc: "등급/페널티" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-red-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 서브 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {subTabs[activeTab].map((sub) => (
          <button
            key={sub.key}
            onClick={() => setActiveSubTab(sub.key)}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeSubTab === sub.key
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="space-y-6">
        {/* ===== 리뷰어 ===== */}
        {activeTab === "reviewer" && activeSubTab === "process" && <ReviewerProcess />}
        {activeTab === "reviewer" && activeSubTab === "review-guide" && <ReviewerReviewGuide />}
        {activeTab === "reviewer" && activeSubTab === "extension" && <ReviewerExtension />}
        {activeTab === "reviewer" && activeSubTab === "cancel" && <ReviewerCancel />}

        {/* ===== 광고주 ===== */}
        {activeTab === "advertiser" && activeSubTab === "visit" && <AdvertiserVisit />}
        {activeTab === "advertiser" && activeSubTab === "delivery" && <AdvertiserDelivery />}
        {activeTab === "advertiser" && activeSubTab === "purchase" && <AdvertiserPurchase />}
        {activeTab === "advertiser" && activeSubTab === "reporter" && <AdvertiserReporter />}
        {activeTab === "advertiser" && activeSubTab === "ad-process" && <AdvertiserProcess />}
        {activeTab === "advertiser" && activeSubTab === "rejection" && <AdvertiserRejection />}
        {activeTab === "advertiser" && activeSubTab === "agency" && <AdvertiserAgency />}

        {/* ===== 공통 ===== */}
        {activeTab === "common" && activeSubTab === "grades" && <CommonGrades />}
        {activeTab === "common" && activeSubTab === "penalty" && <CommonPenalty />}
        {activeTab === "common" && activeSubTab === "prohibited" && <CommonProhibited />}
      </div>
    </div>
  );
}

/* ===================== 공통 UI 컴포넌트 ===================== */

function SectionCard({ title, children, color = "bg-white" }: { title?: string; children: React.ReactNode; color?: string }) {
  return (
    <div className={`${color} rounded-2xl border shadow-sm p-5`}>
      {title && <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function StepFlow({ steps }: { steps: { label: string; sub?: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="bg-gray-50 border rounded-xl px-3 py-2.5 text-center min-w-[80px]">
            <p className="text-[10px] text-gray-400 mb-0.5">STEP.{i + 1}</p>
            <p className="text-xs font-bold text-gray-800">{s.label}</p>
            {s.sub && <p className="text-[10px] text-red-500 mt-0.5">{s.sub}</p>}
          </div>
          {i < steps.length - 1 && <span className="text-gray-300 text-xs">▸</span>}
        </div>
      ))}
    </div>
  );
}

function InfoBox({ type = "info", children }: { type?: "info" | "warn" | "error"; children: React.ReactNode }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-700",
    warn: "bg-yellow-50 border-yellow-200 text-yellow-700",
    error: "bg-red-50 border-red-200 text-red-600",
  };
  const icons = { info: "💡", warn: "⚠️", error: "🚫" };
  return (
    <div className={`${styles[type]} border rounded-xl p-3.5 text-xs leading-relaxed`}>
      <span className="mr-1">{icons[type]}</span>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-xs text-gray-700">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-gray-400 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChannelRequirements({ channel, items }: { channel: string; items: string[] }) {
  const colors: Record<string, string> = {
    "블로그": "bg-green-500",
    "블로그+클립": "bg-green-600",
    "인스타그램": "bg-pink-500",
    "유튜브": "bg-red-500",
    "릴스": "bg-purple-500",
    "틱톡": "bg-gray-800",
    "쇼츠": "bg-red-600",
    "클립": "bg-green-400",
  };
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className={`${colors[channel] || "bg-gray-500"} text-white text-xs font-bold px-4 py-2 text-center`}>
        {channel}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-gray-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== 리뷰어 섹션 ===================== */

function ReviewerProcess() {
  return (
    <>
      <SectionCard title="체험단 신청 및 진행 방법">
        <p className="text-xs text-gray-500 mb-5">체험단은 어떻게 신청하고 진행되나요?</p>
        <StepFlow
          steps={[
            { label: "회원가입\n기본정보 입력" },
            { label: "체험단\n신청하기" },
            { label: "신청 확인" },
            { label: "선정된\n리뷰어 발표" },
            { label: "리뷰 등록" },
          ]}
        />
      </SectionCard>

      <SectionCard title="① 회원가입 및 기본 정보 입력">
        <BulletList
          items={[
            "이름, 연락처, 활동 채널 URL, 주소 등 기본 정보를 정확하게 입력해주세요",
            "소셜 로그인(구글/카카오/네이버)으로 간편 가입 가능",
            "리뷰어로 가입 후 프로필에서 SNS 계정을 등록하세요",
          ]}
        />
      </SectionCard>

      <SectionCard title="② 체험단 신청하기">
        <BulletList
          items={[
            "캠페인 목록에서 원하는 체험단을 선택하세요",
            "카테고리, 채널, 지역별로 필터링 가능",
            "신청 시 간단한 메시지를 작성하면 선정 확률이 올라갑니다",
          ]}
        />
      </SectionCard>

      <SectionCard title="③ 선정 및 리뷰 작성">
        <BulletList
          items={[
            "광고주가 리뷰어의 등급, 채널, 평점 등을 확인하고 선정합니다",
            "선정되면 알림을 받고, 체험 후 리뷰를 작성합니다",
            "각 채널별 필수 가이드를 지켜 리뷰를 작성해주세요",
            "리뷰 승인 시 포인트가 자동 적립됩니다",
          ]}
        />
      </SectionCard>

      <InfoBox type="info">
        체험단은 제품 또는 서비스를 무료로 제공받고 홍보를 목적으로 후기를 작성하는 광고성 콘텐츠입니다.
        브랜드에 도움이 되는 긍정적·예의 리뷰를 원칙으로 합니다.
      </InfoBox>
    </>
  );
}

function ReviewerReviewGuide() {
  return (
    <>
      <SectionCard title="리뷰어 필수 가이드">
        <p className="text-xs text-gray-500 mb-5">
          각 SNS채널에 맞는 가이드를 지켜 리뷰를 작성해 주시기 바랍니다.
        </p>

        <InfoBox type="warn">
          아래 사유로 발생하는 문제에 대해서는 핫플여기체험단이 책임지지 않습니다.
          광고주에게 리뷰 조건 외 추가 제공을 요구하는 경우, 당일 노쇼 및 리뷰가등록 시 페널티가 부과됩니다.
        </InfoBox>

        <div className="space-y-3 mt-5">
          <ChannelRequirements channel="블로그" items={["🔍 키워드", "📸 15장 이상", "📝 1,000자", "📍 지도 첨부", "🎬 동영상/GIF"]} />
          <ChannelRequirements channel="인스타그램" items={["#️⃣ 해시태그", "📸 3장 이상", "📝 100자", "🏷 계정 태그", "#️⃣ #협찬"]} />
          <ChannelRequirements channel="유튜브" items={["🔍 키워드", "🏷 태그", "⏱ 3분 이상", "📢 유료광고 표시", "🔊 목소리 필수"]} />
          <ChannelRequirements channel="릴스" items={["#️⃣ 해시태그", "📍 지도 첨부", "⏱ 30초 이상", "#️⃣ #협찬", "🔊 목소리 필수"]} />
          <ChannelRequirements channel="틱톡" items={["🔍 키워드", "📍 지도 첨부", "⏱ 30초 이상", "📢 유료광고 표시", "🔊 목소리 필수"]} />
          <ChannelRequirements channel="쇼츠" items={["🔍 키워드", "📍 지도 첨부", "⏱ 30초 이상", "📢 유료광고 표시", "🔊 목소리 필수"]} />
          <ChannelRequirements channel="클립" items={["#️⃣ 해시태그", "📍 지도 첨부", "⏱ 30초 이상", "#️⃣ #협찬", "🔊 목소리 필수"]} />
        </div>
      </SectionCard>
    </>
  );
}

function ReviewerExtension() {
  return (
    <>
      <SectionCard title="체험단 연장">
        <p className="text-xs text-gray-500 mb-5">체험 기간은 어떻게 연장하나요?</p>
        <StepFlow
          steps={[
            { label: "광고주와\n협의" },
            { label: "광고주 직접\n연장 활성화" },
            { label: "체험단 연장\n확인" },
          ]}
        />
      </SectionCard>

      <SectionCard title="① 광고주와 협의">
        <BulletList
          items={[
            "리뷰어가 체험단 연장을 원하는 경우 광고주에게 연장을 요청합니다",
            "광고주는 연장 요청을 승인 또는 거절할 수 있습니다",
            "기간 내 일정 조율이 어려운 경우에는 기존 마감일 전에 체험단 취소를 권장합니다",
          ]}
        />
      </SectionCard>

      <SectionCard title="② 광고주가 직접 연장 활성화">
        <BulletList
          items={[
            "마감일 이전, 광고주가 직접 활성화 시 체험 기간이 2주 연장됩니다",
            "연장은 체험단 단위로 적용되며, 광고주와 협의가 이루어지지 않은 리뷰어는 기존 마감일을 준수해야 합니다",
          ]}
        />
      </SectionCard>

      <InfoBox type="warn">
        연장은 1회만 가능합니다. 이미 마감일이 지났다면 연장은 불가합니다.
      </InfoBox>
    </>
  );
}

function ReviewerCancel() {
  return (
    <>
      <SectionCard title="체험단 취소 시스템">
        <p className="text-xs text-gray-500 mb-4">
          취소 신청은 영업일 기준으로 순차 처리되며, 승인 전까지 취소 횟수가 일시적으로 부과될 수 있으나 이후 승인 시 차감됩니다.
        </p>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">1. 단순 취소</h4>
            <BulletList
              items={[
                "인플루언서의 단순 변심 및 광고주와 조율없는 일방적인 취소",
                "취소 신청 즉시 반영되며 취소 횟수가 부과됩니다",
              ]}
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">2. 협의 취소</h4>
            <BulletList
              items={[
                "광고주와 협의가 완료된 경우, 취소 횟수 없이 취소 가능",
                "광고주와 협의한 내용을 이미지로 첨부해 주세요 (문자 캡처 등)",
              ]}
            />
          </div>
        </div>
      </SectionCard>

      <InfoBox type="warn">
        연장 기간에는 취소 신청이 불가합니다. 취소 신청은 기존 체험 마감일 이전에만 가능합니다.
        노쇼의 경우 페널티가 부과됩니다.
      </InfoBox>

      <SectionCard title="협의 취소로 인정되는 경우">
        <BulletList
          items={[
            "가이드가 아닌 추가 가이드를 전달받은 경우",
            "광고주 연락 두절 (2일 이상 연락 시도+취소의사 전달을 포함한 문자내역 필요)",
            "체험단 설명에 기재된 체험 가능 시간과 전달받은 체험 기간이 다른 경우",
          ]}
        />
      </SectionCard>
    </>
  );
}

/* ===================== 광고주 섹션 ===================== */

function AdvertiserVisit() {
  return (
    <>
      <SectionCard title="방문형/포장형 체험단 등록">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-700 text-center">
            <span className="font-bold">🏪 방문형</span> · <span className="font-bold">📦 포장형</span><br />
            리뷰어가 매장을 방문하여 체험 · 포장 후 채널 리뷰 작성
          </p>
        </div>

        <InfoBox type="error">
          정책 위반 시 광고주에게 책임 및 페널티 부과. 영수증 리뷰 및 예약(네이버, 캐치테이블 등) 요청 금지
        </InfoBox>
      </SectionCard>

      <SectionCard title="등록 절차">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">① 회원가입 및 기본 정보 입력</h4>
            <BulletList items={["상호명, 연락처, 주소 등 기본 정보를 정확하게 입력해주세요"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">② 체험단 모집 클릭</h4>
            <BulletList items={["마이페이지 > 체험단 관리 > 체험단 모집 버튼 클릭"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">③ 필수 입력 사항 작성</h4>
            <BulletList
              items={[
                "기본 정보: 상호명, 홍보 이미지, 연락처",
                "홍보 유형: 방문형 또는 포장형 선택",
                "주소: 상세 주소까지 작성",
                "카테고리, 채널, 제공 내역 작성",
                "체험 가능 요일 및 시간 설정",
              ]}
            />
          </div>
        </div>
      </SectionCard>

      <InfoBox type="info">
        방문 포장만 가능할 경우, 포장형으로 선택해 주세요. 오프라인 매장은 주소를 상세하게 작성해주세요.
      </InfoBox>
    </>
  );
}

function AdvertiserDelivery() {
  return (
    <>
      <SectionCard title="배송형 체험단 등록">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-green-700 text-center">
            <span className="font-bold">📦 배송형</span><br />
            광고주가 선정 리뷰어에게 직접 배송<br />
            리뷰어가 체험 물건을 받고 채널 리뷰 작성
          </p>
        </div>

        <InfoBox type="warn">
          배송 전 반드시 리뷰어와 소통하여, 주소를 확인 후 물건을 발송해 주세요.
        </InfoBox>
      </SectionCard>

      <SectionCard title="등록 절차">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">① 회원가입 및 기본 정보 입력</h4>
            <BulletList items={["상호명, 연락처, 주소 등 기본 정보를 정확하게 입력"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">② 체험단 모집</h4>
            <BulletList items={["마이페이지 > 체험단 관리 > 체험단 모집"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">③ 필수 입력 사항</h4>
            <BulletList
              items={[
                "기본 정보: 상호명, 홍보 이미지, 연락처",
                "홍보 유형: 배송형 선택",
                "카테고리, 채널 선택",
                "제공 내역 상세 작성",
              ]}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function AdvertiserPurchase() {
  return (
    <>
      <SectionCard title="구매형 체험단 등록">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-purple-700 text-center">
            <span className="font-bold">🛒 구매형</span><br />
            광고주가 상품 금액에 맞는 포인트로 등록하여<br />
            리뷰어가 직접 구매 후 채널 · 구매평 리뷰 등록 시 자동 페이백
          </p>
        </div>

        <InfoBox type="warn">
          전체 비용(상품금액+배송비)은 포인트로만 지급 가능합니다. 구매 링크는 네이버 스토어와 쿠팡만 가능합니다.
        </InfoBox>
      </SectionCard>

      <SectionCard title="등록 절차">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">① 소상공인 or 광고대행사로 가입</h4>
            <BulletList items={["상호명, 연락처, 주소 등 기본 정보 입력"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">② 체험단 모집</h4>
            <BulletList items={["홍보 유형에서 구매형 선택", "구매 URL: 네이버 스토어/쿠팡 상세페이지와 일치하는 링크 입력"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">③ 필수 입력 사항</h4>
            <BulletList items={["상호명, 홍보 이미지, 연락처", "구매 URL, 카테고리, 홍보 채널"]} />
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function AdvertiserReporter() {
  return (
    <>
      <SectionCard title="기자단 체험단 등록">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-orange-700 text-center">
            <span className="font-bold">📰 기자단</span><br />
            승인을 받은 대행사만 진행 가능<br />
            제공된 원고와 자료 기반으로 리뷰 작성
          </p>
        </div>

        <InfoBox type="warn">
          정책 위반 시 광고주에게 책임 및 페널티 부과. 리뷰어에게 포인트 지급 필수, 추가 가이드는 체험단 미션에만 기재 가능.
        </InfoBox>
      </SectionCard>

      <SectionCard title="등록 절차">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">① 광고대행사로 가입</h4>
            <BulletList items={["사업자 등록증을 1:1 문의로 전달해 주시면 확인 후 승인"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">② 체험단 모집</h4>
            <BulletList items={["마이페이지 > 체험단 관리 > 체험단 모집"]} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">③ 필수 입력 사항</h4>
            <BulletList items={["상호명, 홍보 이미지, 연락처", "홍보 유형: 기자단 선택", "카테고리, 채널 선택"]} />
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function AdvertiserProcess() {
  return (
    <>
      <SectionCard title="체험단 진행 절차 안내">
        <p className="text-xs text-gray-500 mb-5">체험단은 어떻게 진행되나요?</p>
        <StepFlow
          steps={[
            { label: "리뷰어\n모집 및 선정", sub: "10일" },
            { label: "체험단\n진행하기", sub: "모집 마감 4일 전 가능" },
            { label: "체험\n& 리뷰 작성", sub: "14일 (+14일 연장)" },
            { label: "리뷰 마감\n및 평가" },
            { label: "결과보고서" },
          ]}
        />
      </SectionCard>

      <SectionCard title="① 리뷰어 모집 및 선정">
        <BulletList
          items={[
            "검수 완료 후 체험단이 오픈되면 리뷰어 신청이 시작됩니다 (10일간 모집)",
            "마이페이지 > 체험단 관리 > 체험단 진행 상세에서 리뷰어의 채널, 등급, 평점, 페널티 여부를 확인",
            "[선정하기] 버튼으로 체험단 리뷰어를 선정하세요",
            "리뷰어 발표일까지 미선정 시 페널티가 부과됩니다",
          ]}
        />
      </SectionCard>

      <SectionCard title="② 체험 & 리뷰 작성">
        <BulletList
          items={[
            "선정된 리뷰어에게 체험 기회를 제공합니다",
            "리뷰어는 체험 후 14일 이내에 리뷰를 작성합니다",
            "필요시 광고주 직접 연장 활성화로 +14일 연장 가능",
          ]}
        />
      </SectionCard>

      <InfoBox type="info">
        체험단 진행 기간은 총 3~4주 소요됩니다. 체험단 등록 후 인플루언서 모집 10일 → 모집 완료 후 명단 전달 → 방문/포스팅까지 14일
      </InfoBox>
    </>
  );
}

function AdvertiserRejection() {
  return (
    <>
      <SectionCard title="체험단 반려사유">
        <p className="text-xs text-gray-500 mb-4">가이드 미준수로 인해 발생하는 문제에 대해서는 핫플여기체험단이 책임지지 않습니다.</p>

        <h4 className="text-sm font-bold text-gray-800 mb-3">자주 반려되는 사유</h4>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-1">1. 제공내역 금액이 기준에 미달한 경우</p>
            <p className="text-[10px] text-gray-500">방문·포장형: 음식점 2만 5천원 / 카페 1만 5천원 이상<br />배송·구매형: 5천원 이상</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-1">2. 필수 가이드 외 추가 가이드를 별도로 전달하는 경우</p>
            <p className="text-[10px] text-gray-500">필수 가이드 내에서만 진행 가능, 추가 요청사항은 미션 항목에 기재</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-1">3. 추가 금액이 필수로 발생하는 구조인 경우</p>
            <p className="text-[10px] text-gray-500">메뉴 1가지 이상 주문 가능한 금액이 제공되지 않거나, 추가 결제가 필수인 경우 불가</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-1">4. 신체 접촉 체험단인데 관리사 성별 미기재</p>
            <p className="text-[10px] text-gray-500">마사지·관리 등 신체 접촉 체험단은 관리사 성별 필수 기재</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-800 mb-1">5. 영수증 리뷰 또는 방문자 예약 방식 진행</p>
            <p className="text-[10px] text-gray-500">네이버 예약, 캐치테이블, 당근 예약 등 외부 플랫폼 예약 및 리뷰 불가</p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function AdvertiserAgency() {
  return (
    <>
      <SectionCard title="체험단 대행 진행" color="bg-gradient-to-br from-blue-50 to-white">
        <p className="text-sm font-bold text-blue-800 text-center mb-4">
          번거로운 체험단 운영, 대행으로 간편하게!
        </p>
        <p className="text-xs text-gray-600 text-center mb-5">
          모집 및 선정 · 키워드 분석 · 리뷰어 채널 확인 · 리뷰 검수 · 결과 확인까지<br />
          체험단 전문 마케터가 체계적으로 진행합니다.
        </p>

        <div className="space-y-3 mb-5">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-bold text-blue-700 mb-1">01 사장님은 매장 운영에만 집중할 수 있습니다.</p>
            <p className="text-[10px] text-gray-500">체험단을 직접 모집하고 관리하는 과정은 많은 시간과 노력이 필요합니다. 대행 서비스를 이용하시면 번거로운 과정을 줄일 수 있습니다.</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-bold text-blue-700 mb-1">02 체험단 전문 마케터가 체계적으로 진행합니다.</p>
            <p className="text-[10px] text-gray-500">키워드 분석부터 인플루언서 선정·관리, 결과 확인까지 전 과정을 체계적으로 진행합니다.</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-bold text-blue-700 mb-1">03 안정적이고 만족도 높은 결과를 만들어 냅니다.</p>
            <p className="text-[10px] text-gray-500">각 SNS 채널 노출 구조를 고려한 운영으로 효율적인 상위 노출을 유도하며, 검증된 인플루언서를 관리합니다.</p>
          </div>
        </div>

        <div className="bg-gray-800 text-white rounded-xl p-4 text-center">
          <p className="text-xs font-bold mb-1">체험단 비용</p>
          <p className="text-sm font-bold">체험단 10건 진행 시 30만 원 ~</p>
          <p className="text-[10px] text-gray-300 mt-1">상품별 금액 및 유효기간은 상이할 수 있으며, 30건 이상부터는 높은 할인율이 적용됩니다.</p>
        </div>
      </SectionCard>

      <SectionCard title="체험단 진행 순서">
        <div className="space-y-2">
          {[
            "체험단 등록 후 인플루언서 모집 10일",
            "모집 완료 후 명단 전달",
            "명단 전달 후 방문 및 포스팅까지 14일 소요",
            "포스팅은 실시간으로 확인 후 노출 시 보고",
            "리뷰 검수 완료 후 결과보고서 전달",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-xs text-gray-700">{item}</p>
            </div>
          ))}
        </div>
        <InfoBox type="info">
          체험단 진행 기간은 총 3~4주 소요됩니다.
        </InfoBox>
      </SectionCard>
    </>
  );
}

/* ===================== 공통 섹션 ===================== */

function CommonGrades() {
  const grades = [
    { label: "일반", icon: "⚪", color: "bg-gray-100 border-gray-300", desc: "모든 체험단에 선정될 확률 낮음" },
    { label: "초급", icon: "🥉", color: "bg-amber-50 border-amber-400", desc: "일반 체험단에 선정될 확률 높음" },
    { label: "중급", icon: "🥈", color: "bg-yellow-50 border-yellow-400", desc: "일반 체험단에 선정될 확률 매우 높음" },
    { label: "고급", icon: "🥇", color: "bg-orange-50 border-orange-400", desc: "프리미엄 체험단에 선정될 확률 높음" },
    { label: "프리미어", icon: "💎", color: "bg-blue-50 border-blue-400", desc: "프리미엄 체험단에 선정될 확률 매우 높음" },
    { label: "네이버 인플", icon: "🅝", color: "bg-green-50 border-green-400", desc: "네이버에서 공식 인증한 네이버 인플루언서" },
  ];

  return (
    <>
      <SectionCard title="체험단 등급 안내">
        <div className="space-y-2.5">
          {grades.map((g) => (
            <div key={g.label} className={`flex items-center gap-4 ${g.color} border rounded-xl p-3.5`}>
              <div className="text-center min-w-[50px]">
                <p className="text-2xl">{g.icon}</p>
                <p className="text-[10px] font-bold text-gray-700 mt-0.5">{g.label}</p>
              </div>
              <p className="text-xs text-gray-700">{g.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="등급 FAQ">
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-600 mb-1">Q. 등급은 어떤 기준으로 정해지나요?</p>
            <p className="text-xs text-gray-600">A. 체험단 포스팅의 노출 효과를 기준으로, 시스템에 따라 등급이 결정됩니다.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-600 mb-1">Q. 등급은 변경될 수 있나요?</p>
            <p className="text-xs text-gray-600">A. 네, 플랫폼 내에서 체험단 활동을 열심히 하고 양질의 글을 포스팅하면 등급이 올라갑니다. (등급은 마지막 업데이트일로부터 30일 후 자동 갱신)</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-600 mb-1">Q. 네이버 인플루언서 인증은 어떻게 하나요?</p>
            <p className="text-xs text-gray-600">A. 프로필에서 네이버 블로그 URL을 등록하면 관리자 확인 후 인플루언서 등급이 부여됩니다. 네이버 인플루언서 인증 시 바로 최상위 등급으로 시작합니다.</p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function CommonPenalty() {
  return (
    <>
      <SectionCard title="페널티 안내">
        <p className="text-xs text-gray-500 mb-4">
          페널티 제도는 성실하게 활동하는 회원에게 더 많은 체험 기회를 제공하기 위해 운영됩니다.
          회원의 의무를 이행하지 않는 경우에는 서비스의 신뢰도와 공정한 운영을 위해 페널티가 적용될 수 있습니다.
        </p>

        <h4 className="text-sm font-bold text-gray-800 mb-3">리뷰어 페널티 사유</h4>
        <BulletList
          items={[
            "리뷰어가 서비스를 제공 받은 이후 리뷰를 작성하지 않는 경우",
            "리뷰어가 당일 노쇼한 경우",
            "리뷰를 가등록하거나 허위 링크를 업로드하는 경우",
            "취소 횟수가 5회 누적될 때마다 부과 (예: 5회 시 1회, 10회 시 2회)",
            "커뮤니티 규칙을 위반한 경우",
          ]}
        />

        <h4 className="text-sm font-bold text-gray-800 mb-3 mt-5">광고주 페널티 사유</h4>
        <BulletList
          items={[
            "체험단 모집을 등록 후 리뷰어를 선정하지 않은 경우",
            "리뷰어 선정 후, 진행 중인 체험을 취소하거나 삭제하는 경우",
            "광고주가 당일 노쇼한 경우",
          ]}
        />
      </SectionCard>

      <SectionCard title="페널티 누적 횟수에 따른 이용 제한">
        <div className="space-y-2">
          {[
            { count: "페널티 1회", action: "사이트 이용 7일 정지" },
            { count: "페널티 2회", action: "사이트 이용 30일 정지" },
            { count: "페널티 3회", action: "사이트 이용 영구 정지" },
          ].map((p) => (
            <div key={p.count} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="text-xs font-bold text-red-600">{p.count}</span>
              <span className="text-xs text-red-700">{p.action}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5">
          <InfoBox type="info">
            이용 정지 중에도 리뷰 등록은 가능합니다. 진행 중인 체험단이 있다면 성실하게 리뷰를 작성하고 등록해 주세요.
          </InfoBox>
          <InfoBox type="warn">
            페널티는 초기화되지 않고 누적됩니다. 페널티가 있다면 탈퇴 후 재가입이 불가합니다.
          </InfoBox>
        </div>
      </SectionCard>
    </>
  );
}

function CommonProhibited() {
  return (
    <>
      <SectionCard title="진행불가 체험단">
        <InfoBox type="error">
          아래 항목에 해당하는 체험단은 등록 및 진행이 불가합니다.
        </InfoBox>
        <div className="mt-4">
          <BulletList
            items={[
              "불법, 도박, 성인 콘텐츠 등",
              "문신, 타투, 반영구 시술 등",
              "반영구 화장 등 (브로우메이크업, 퍼스널림컬러 등)",
              "병원/의료 관련 시술 등 (도수치료, 척추교정, 통증치료, 탈모 등)",
              "수술, 필러, MTS, 주사, 바늘 관련 시술 등",
              "다이어트 관련 시술 및 약물 등 (의료기기 활용 체험단 포함)",
              "동물병원 및 반려동물 분양 등",
              "유흥 목적 마사지 업종 (스웨디시, 딥티슈, 림프 마사지 등)",
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="일부 가능 체험단">
        <InfoBox type="warn">
          아래 항목은 무료 체험단으로는 진행이 어려우나, 대행 체험단(유료)으로 도와드릴 수 있습니다. 1:1 문의 주세요.
        </InfoBox>
        <div className="mt-4">
          <BulletList
            items={[
              "앱 설치 및 가입, 재무·자산 관리, 보험 등",
              "온라인 강의, 플랫폼 홍보 등",
              "대여/렌탈, 제품 할인, 할인권, 상품권 등",
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="공통 금지 항목">
        <BulletList
          items={[
            "플랫폼 외 거래 및 별도 조건 제안을 하는 행위",
            "부당한 방법으로 포인트를 취득하는 행위",
            "사이트 내 오류를 악용하여 이득을 취하는 행위",
            "회원·상담원에게 갑질/업무 방해/폭언을 하는 행위",
            "회원의 개인정보를 무단으로 사용하는 행위",
            "인플루언서는 긍정적인 홍보 및 포스팅을 진행해야 합니다",
          ]}
        />
      </SectionCard>
    </>
  );
}
