"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

const BANKS = [
  "국민은행", "신한은행", "우리은행", "하나은행", "농협은행",
  "기업은행", "카카오뱅크", "토스뱅크", "SC제일은행", "씨티은행",
  "대구은행", "부산은행", "경남은행", "광주은행", "전북은행",
  "제주은행", "수협은행", "새마을금고", "신협", "우체국",
];

const FEE = 500; // 금융 수수료
const TAX_RATE = 0.033; // 소득세 3.3%
const MIN_AMOUNT = 10000; // 최소 출금

interface Withdrawal {
  id: string;
  amount: number;
  tax: number;
  netAmount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}

const WD_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "처리중", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "완료", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "거절됨", className: "bg-red-100 text-red-700" },
};

// 정산 달력 컴포넌트
function SettlementCalendar({ onClose }: { onClose: () => void }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // 정산일: 5일, 20일
  const settlementDays = [5, 20];

  // 신청 기간 표시 (1~15일: 초록, 16~말일: 파랑)
  const getDateStyle = (day: number) => {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const isSettlement = settlementDays.includes(day);

    return { isToday, isSettlement };
  };

  const getRowHighlight = (day: number) => {
    if (day >= 1 && day <= 15) return "bg-green-50 border-l-2 border-green-400";
    if (day >= 16) return "bg-blue-50 border-l-2 border-blue-400";
    return "";
  };

  const cells = [];
  // 빈 셀
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  // 마지막 주 패딩
  while (weeks.length > 0 && weeks[weeks.length - 1].length < 7) {
    weeks[weeks.length - 1].push(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-center mb-4">정산 일정</h3>

        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-gray-900">{year}년 {month + 1}월</span>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">›</button>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {["일","월","화","수","목","금","토"].map((d) => (
                <th key={d} className="py-2 text-center text-gray-500 font-medium border-b">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  if (!day) return <td key={di} className="py-2.5 text-center border-b" />;
                  const { isToday, isSettlement } = getDateStyle(day);
                  return (
                    <td key={di} className={`py-2.5 text-center border-b ${day <= 15 ? "border-l border-l-green-300" : "border-l border-l-blue-300"}`}>
                      {isSettlement ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-sky-500 text-white text-xs font-bold">정산</span>
                      ) : isToday ? (
                        <span className="inline-block w-7 h-7 leading-7 rounded-full bg-yellow-100 text-gray-900 font-bold">{day}</span>
                      ) : (
                        <span className={`${di === 0 ? "text-red-400" : di === 6 ? "text-blue-400" : "text-gray-700"}`}>{day}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 text-center space-y-1">
          <p className="text-sm font-medium text-gray-800">
            1일~15일 신청 → 당월 <span className="text-sky-500 font-bold">20일</span> 정산
          </p>
          <p className="text-sm font-medium text-gray-800">
            16일~말일 신청 → 익월 <span className="text-sky-500 font-bold">5일</span> 정산
          </p>
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          *정산 예정일(5일 / 20일)이 주말 또는 공휴일인 경우,<br />다음 영업일에 정산이 진행됩니다.
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors cursor-pointer"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default function ReviewerWithdrawPage() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [form, setForm] = useState({
    bankName: "",
    accountHolder: "",
    bankAccount: "",
    ssnFront: "",
    ssnBack: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/reviewer/points").then((r) => r.json()),
      fetch("/api/reviewer/withdrawals").then((r) => r.json()),
    ])
      .then(([pointsData, wdData]) => {
        setBalance(pointsData.balance || 0);
        setWithdrawals(Array.isArray(wdData) ? wdData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 출금액은 전액 출금 (잔액 전부)
  const amount = balance;
  const tax = Math.floor(amount * TAX_RATE);
  const netAmount = amount - FEE - tax;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    if (amount < MIN_AMOUNT) {
      setError(`최소 ${MIN_AMOUNT.toLocaleString()}원 이상 출금 가능합니다.`);
      setSubmitLoading(false);
      return;
    }
    if (!form.bankName) {
      setError("은행을 선택해 주세요.");
      setSubmitLoading(false);
      return;
    }
    if (!form.bankAccount) {
      setError("계좌번호를 입력해 주세요.");
      setSubmitLoading(false);
      return;
    }
    if (!agreePrivacy) {
      setError("개인정보 이용 동의가 필요합니다.");
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reviewer/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          accountHolder: form.accountHolder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "출금 신청에 실패했습니다.");
      }

      const newWd = await res.json();
      setWithdrawals((prev) => [newWd, ...prev]);
      setBalance(0);
      setForm({ bankName: "", accountHolder: "", bankAccount: "", ssnFront: "", ssnBack: "" });
      setAgreePrivacy(false);
      setSuccess("출금 신청이 완료되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  }, [amount, form, agreePrivacy]);

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">로딩중...</div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">출금 신청하기</h1>
      <p className="text-sm text-gray-400 mb-8">회원 정보와 동일한 예금주의 계좌 정보를 입력해주셔야 합니다</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 은행 선택 */}
        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">은행</label>
          <select
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white appearance-none cursor-pointer"
          >
            <option value="">은행을 선택해 주세요</option>
            {BANKS.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        {/* 예금주명 */}
        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">예금주명</label>
          <input
            type="text"
            value={form.accountHolder}
            onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
            required
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder={session?.user?.name || "예금주명"}
          />
        </div>

        {/* 출금액 + 정산 달력 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-base font-bold text-gray-900">출금액</label>
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              title="정산 일정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-2">출금 일정은 정산 달력을 통해 확인해 주세요</p>

          <div className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-medium">
            {amount.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-1">출금 신청 시 금융 수수료 {FEE.toLocaleString()}원이 발생합니다</p>

          {/* 수수료 계산 */}
          {amount >= MIN_AMOUNT && (
            <div className="mt-3 bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">수수료</span>
                <span className="text-gray-700">-{FEE.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">소득세 공제액</span>
                <span className="text-gray-700">-{tax.toLocaleString()} 원</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-sm text-sky-600 font-medium">
                  {session?.user?.name || "회원"}님이 실제로 받을 예상 금액이에요!
                </span>
                <span className="text-sky-600 font-bold text-lg">{netAmount.toLocaleString()} 원</span>
              </div>
            </div>
          )}

          <ul className="mt-3 space-y-1 text-xs text-gray-400 list-disc pl-4">
            <li>최소 {MIN_AMOUNT.toLocaleString()}원 이상 출금 가능합니다</li>
            <li>출금 금액은 지정이 불가하며 출금 시점 보유한 잔액 모두 출금됩니다</li>
          </ul>
        </div>

        {/* 계좌번호 */}
        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">계좌번호</label>
          <input
            type="text"
            value={form.bankAccount}
            onChange={(e) => setForm({ ...form, bankAccount: e.target.value.replace(/[^0-9]/g, "") })}
            required
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="(-)를 제외한 계좌번호 숫자만 입력해 주세요"
          />
        </div>

        {/* 주민등록번호 */}
        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">주민등록번호</label>
          <p className="text-xs text-gray-400 mb-2">
            위 입력한 예금주 주민등록번호로 기재해 주세요.<br />
            입력하신 정보가 예금주와 불일치할 경우, 출금 신청이 취소될 수 있습니다.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={form.ssnFront}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setForm({ ...form, ssnFront: v });
              }}
              maxLength={6}
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder=""
            />
            <span className="text-gray-400 text-lg">-</span>
            <input
              type="password"
              value={form.ssnBack}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                setForm({ ...form, ssnBack: v });
              }}
              maxLength={7}
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder=""
            />
          </div>
        </div>

        {/* 개인정보 동의 */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm text-gray-700">개인정보 이용 동의 (필수)</span>
          </label>
          <button type="button" className="text-sm text-gray-400 underline cursor-pointer">약관보기</button>
        </div>

        {/* 경고 문구 */}
        <p className="text-sm text-red-500 font-medium">
          * 출금 신청 완료 후에는 취소가 불가하오니, 신청 정보를 다시 한번 확인해 주세요.
        </p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl">{success}</div>}

        <button
          type="submit"
          disabled={submitLoading || amount < MIN_AMOUNT}
          className="w-full py-4 bg-sky-500 text-white rounded-xl text-base font-bold hover:bg-sky-600 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitLoading ? "신청중..." : "신청하기"}
        </button>
      </form>

      {/* 출금 내역 */}
      {withdrawals.length > 0 && (
        <div className="mt-10 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-bold text-gray-900">출금 내역</h2>
          </div>
          <div className="divide-y">
            {withdrawals.map((wd) => (
              <div key={wd.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{wd.bankName} {wd.accountHolder}</p>
                  <p className="text-xs text-gray-400">{new Date(wd.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{(wd.netAmount || wd.amount - Math.floor(wd.amount * TAX_RATE) - FEE).toLocaleString()}원</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${WD_STATUS[wd.status]?.className || "bg-gray-100"}`}>
                    {WD_STATUS[wd.status]?.label || wd.status}
                  </span>
                  {wd.adminNote && wd.status === "REJECTED" && (
                    <p className="text-xs text-red-400 mt-0.5">{wd.adminNote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 정산 달력 모달 */}
      {showCalendar && <SettlementCalendar onClose={() => setShowCalendar(false)} />}
    </div>
  );
}
