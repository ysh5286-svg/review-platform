export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>
      <div className="bg-white rounded-xl border shadow-sm p-6 prose prose-sm max-w-none">
        <h2 className="text-lg font-bold mt-0">제1조 (목적)</h2>
        <p className="text-gray-600">이 약관은 핫플여기체험단(이하 &quot;회사&quot;)이 제공하는 체험단 매칭 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용에 관한 기본적인 사항을 규정함을 목적으로 합니다.</p>

        <h2 className="text-lg font-bold">제2조 (용어의 정의)</h2>
        <p className="text-gray-600">1. &quot;광고주&quot;란 체험단을 모집하여 매장 또는 제품을 홍보하고자 하는 사업자를 말합니다.</p>
        <p className="text-gray-600">2. &quot;리뷰어&quot;란 체험단에 참여하여 리뷰를 작성하는 이용자를 말합니다.</p>
        <p className="text-gray-600">3. &quot;캠페인&quot;이란 광고주가 등록한 체험단 모집 건을 말합니다.</p>
        <p className="text-gray-600">4. &quot;포인트&quot;란 서비스 내에서 사용되는 가상 화폐를 말합니다.</p>

        <h2 className="text-lg font-bold">제3조 (서비스의 제공)</h2>
        <p className="text-gray-600">회사는 다음과 같은 서비스를 제공합니다.</p>
        <ul className="text-gray-600">
          <li>체험단 매칭 서비스</li>
          <li>리뷰 관리 서비스</li>
          <li>포인트 적립 및 출금 서비스</li>
          <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
        </ul>

        <h2 className="text-lg font-bold">제4조 (회원가입)</h2>
        <p className="text-gray-600">서비스 이용을 위해서는 소셜 로그인(구글, 카카오)을 통한 회원가입이 필요합니다. 가입 시 역할(광고주/리뷰어)을 선택하고 필요한 정보를 입력해야 합니다.</p>

        <h2 className="text-lg font-bold">제5조 (포인트)</h2>
        <p className="text-gray-600">1. 리뷰어는 리뷰 승인 시 포인트를 적립받습니다.</p>
        <p className="text-gray-600">2. 포인트 출금 시 3.3% 원천징수세가 공제됩니다.</p>
        <p className="text-gray-600">3. 최소 출금 금액은 5,000P입니다.</p>
        <p className="text-gray-600">4. 광고주는 포인트를 충전하여 리뷰어에게 지급할 수 있습니다.</p>

        <h2 className="text-lg font-bold">제6조 (금지 행위)</h2>
        <p className="text-gray-600">이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ul className="text-gray-600">
          <li>허위 리뷰 작성</li>
          <li>타인의 정보 도용</li>
          <li>서비스의 정상적 운영을 방해하는 행위</li>
          <li>부정한 방법으로 포인트를 취득하는 행위</li>
        </ul>

        <h2 className="text-lg font-bold">제7조 (면책)</h2>
        <p className="text-gray-600">회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</p>

        <p className="text-gray-500 text-xs mt-8">시행일: 2026년 1월 1일</p>
      </div>
    </div>
  );
}
