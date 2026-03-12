"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    category: "일반",
    questions: [
      {
        q: "핫플여기체험단은 어떤 서비스인가요?",
        a: "핫플여기체험단은 사장님(광고주)과 체험단(리뷰어)을 매칭해주는 플랫폼입니다. 사장님은 체험단을 모집하여 매장을 홍보하고, 리뷰어는 체험 후 리뷰를 작성하여 포인트를 적립할 수 있습니다."
      },
      {
        q: "어떤 플랫폼을 지원하나요?",
        a: "네이버 블로그, 인스타그램(피드/릴스), 유튜브 쇼츠, 틱톡 등 다양한 SNS 플랫폼을 지원합니다."
      },
      {
        q: "가입비나 이용료가 있나요?",
        a: "리뷰어는 완전 무료로 이용 가능합니다. 광고주는 캠페인 등록 시 리뷰어에게 지급할 포인트만 충전하시면 됩니다."
      },
    ],
  },
  {
    category: "리뷰어",
    questions: [
      {
        q: "체험단에 어떻게 신청하나요?",
        a: "회원가입 후 '캠페인 둘러보기'에서 원하는 캠페인을 선택하고 신청하시면 됩니다. 광고주가 신청자 중 체험단을 선정합니다."
      },
      {
        q: "리뷰는 어떻게 작성하나요?",
        a: "선정 후 매장 방문(또는 제품 수령) → 체험 → 해당 플랫폼에 리뷰 작성 → 리뷰 URL을 제출하시면 됩니다."
      },
      {
        q: "포인트는 어떻게 적립되나요?",
        a: "리뷰 제출 후 광고주가 리뷰를 승인하면 자동으로 포인트가 적립됩니다."
      },
      {
        q: "포인트 출금은 어떻게 하나요?",
        a: "최소 5,000P 이상부터 출금 신청이 가능합니다. 출금 시 3.3% 원천징수세가 공제됩니다. 관리자 승인 후 등록된 계좌로 입금됩니다."
      },
      {
        q: "리뷰어 등급은 어떻게 올라가나요?",
        a: "승인된 리뷰 수, 리뷰 승인률, 상위노출률 등을 기준으로 자동 산정됩니다. 등급이 올라갈수록 포인트 보너스, 동시 신청 가능 수 등 혜택이 늘어납니다."
      },
    ],
  },
  {
    category: "광고주",
    questions: [
      {
        q: "캠페인은 어떻게 등록하나요?",
        a: "광고주 계정으로 로그인 후 '캠페인 등록'에서 업체 정보, 제공 내용, 리뷰 조건 등을 입력하여 등록하실 수 있습니다."
      },
      {
        q: "포인트 충전은 어떻게 하나요?",
        a: "포인트 관리 페이지에서 무통장입금 또는 카드결제로 충전 신청하시면, 관리자 확인 후 포인트가 충전됩니다."
      },
      {
        q: "리뷰어를 어떻게 선정하나요?",
        a: "캠페인 상세 페이지에서 신청자 목록을 확인하고, 프로필과 포트폴리오를 보고 원하는 리뷰어를 선정하시면 됩니다."
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">자주 묻는 질문 (FAQ)</h1>
      <p className="text-gray-500 text-sm mb-8">궁금한 점이 있으시면 아래에서 확인해보세요.</p>

      {faqs.map((section) => (
        <div key={section.category} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            {section.category}
          </h2>
          <div className="space-y-2">
            {section.questions.map((faq, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = openIndex === key;
              return (
                <div key={key} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : key)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                    <span className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Links */}
      <div className="flex gap-4 mt-12 justify-center">
        <Link href="/terms" className="text-sm text-gray-500 hover:text-red-500 underline">
          이용약관
        </Link>
        <Link href="/privacy" className="text-sm text-gray-500 hover:text-red-500 underline">
          개인정보처리방침
        </Link>
      </div>
    </div>
  );
}
