"use client";

import { useState, useEffect } from "react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이미 PWA로 실행 중이면 표시 안 함
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone);
    if (isStandalone) return;

    // PC에서는 표시 안 함
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // 이미 닫았으면 3일간 표시 안 함
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) return;

    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));

    // 3초 후 표시
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border p-4">
        <div className="flex items-start gap-3">
          {/* 앱 아이콘 */}
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">H</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">핫플여기체험단 앱 설치</p>
            {isIOS ? (
              <p className="text-xs text-gray-500 mt-0.5">
                하단 <span className="inline-block">
                  <svg className="w-4 h-4 inline -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span> 공유 버튼 → <strong>&quot;홈 화면에 추가&quot;</strong>를 눌러주세요
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                홈 화면에 추가하면 앱처럼 사용할 수 있어요
              </p>
            )}
          </div>

          {/* 닫기 */}
          <button
            onClick={dismiss}
            className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
