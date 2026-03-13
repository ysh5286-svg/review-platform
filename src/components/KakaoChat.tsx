"use client";

export default function KakaoChat() {
  return (
    <a
      href="http://pf.kakao.com/_vxgCVn"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#FEE500] rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      aria-label="카카오톡 상담"
    >
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.4-.99 3.62 0 0-.02.17.09.23.11.07.24.02.24.02.32-.04 3.7-2.42 4.28-2.83.56.08 1.14.13 1.72.13 5.52 0 10-3.58 10-7.84C22 6.58 17.52 3 12 3z"
          fill="#3C1E1E"
        />
      </svg>
      {/* 호버 라벨 */}
      <span className="absolute right-16 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        카카오톡 상담
        <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </span>
    </a>
  );
}
