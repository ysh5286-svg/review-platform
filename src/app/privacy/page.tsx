export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">개인정보처리방침</h1>
      <div className="bg-white rounded-xl border shadow-sm p-6 prose prose-sm max-w-none">
        <h2 className="text-lg font-bold mt-0">1. 개인정보의 처리 목적</h2>
        <p className="text-gray-600">핫플여기체험단(이하 &quot;회사&quot;)은 다음의 목적을 위해 개인정보를 처리합니다.</p>
        <ul className="text-gray-600">
          <li>회원 가입 및 관리</li>
          <li>서비스 제공 및 운영</li>
          <li>포인트 정산 및 출금 처리</li>
          <li>고객 문의 대응</li>
        </ul>

        <h2 className="text-lg font-bold">2. 수집하는 개인정보 항목</h2>
        <p className="text-gray-600">필수: 이메일, 이름</p>
        <p className="text-gray-600">선택: 연락처, SNS 계정 정보, 프로필 사진</p>
        <p className="text-gray-600">출금 시: 은행명, 계좌번호, 예금주명</p>

        <h2 className="text-lg font-bold">3. 개인정보의 보유 및 이용기간</h2>
        <p className="text-gray-600">회원 탈퇴 시까지 보유하며, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 보관합니다.</p>
        <ul className="text-gray-600">
          <li>계약 또는 청약철회에 관한 기록: 5년</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
          <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
        </ul>

        <h2 className="text-lg font-bold">4. 개인정보의 제3자 제공</h2>
        <p className="text-gray-600">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법률에 특별한 규정이 있는 경우에는 예외로 합니다.</p>

        <h2 className="text-lg font-bold">5. 개인정보의 안전성 확보 조치</h2>
        <p className="text-gray-600">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
        <ul className="text-gray-600">
          <li>개인정보의 암호화</li>
          <li>접근 권한의 제한</li>
          <li>보안 프로그램 설치 및 갱신</li>
        </ul>

        <h2 className="text-lg font-bold">6. 정보주체의 권리</h2>
        <p className="text-gray-600">이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의 처리 정지를 요청할 수 있습니다.</p>

        <h2 className="text-lg font-bold">7. 개인정보 보호책임자</h2>
        <p className="text-gray-600">개인정보 관련 문의사항은 아래로 연락 부탁드립니다.</p>
        <p className="text-gray-600">이메일: dazzlepeople@naver.com</p>

        <p className="text-gray-500 text-xs mt-8">시행일: 2026년 1월 1일</p>
      </div>
    </div>
  );
}
