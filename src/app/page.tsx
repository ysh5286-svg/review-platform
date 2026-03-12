import Link from "next/link";
import StartButton from "@/components/StartButton";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              체험단 매칭,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">더 쉽고 빠르게</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              네이버 블로그, 인스타그램, 유튜브 쇼츠, 틱톡까지.
              <br />
              사장님은 체험단을 모집하고, 리뷰어는 포인트를 적립하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/campaigns"
                className="px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
              >
                캠페인 둘러보기
              </Link>
              <StartButton />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          다양한 플랫폼 지원
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "📝", title: "네이버 블로그", desc: "블로그 리뷰를 통한 검색 노출과 매장 홍보" },
            { icon: "📸", title: "인스타그램", desc: "피드 게시물과 릴스를 통한 SNS 바이럴 마케팅" },
            { icon: "🎬", title: "숏폼 영상", desc: "유튜브 쇼츠, 틱톡을 통한 영상 콘텐츠 마케팅" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border text-center hover:shadow-xl hover:-translate-y-2 hover:border-red-200 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">이용 방법</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-6">
                🏪 사장님 (광고주)
              </h3>
              <div className="space-y-4">
                {[
                  "캠페인 등록 (업체 정보, 제공 내용, 리뷰 조건)",
                  "체험단 신청자 확인 및 선정",
                  "리뷰 제출 확인 및 승인",
                  "자동으로 포인트 지급 완료",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-600 mb-6">
                ✍️ 체험단 (리뷰어)
              </h3>
              <div className="space-y-4">
                {[
                  "마음에 드는 캠페인에 신청",
                  "선정 후 체험 및 리뷰 작성",
                  "리뷰 URL 제출",
                  "승인 후 포인트 적립 → 출금",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 핫플여기체험단. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
