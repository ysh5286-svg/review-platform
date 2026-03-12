"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const BANKS = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
  "기업은행",
  "카카오뱅크",
  "토스뱅크",
];

interface Withdrawal {
  id: string;
  amount: number;
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

export default function ReviewerWithdrawPage() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    amount: "",
    bankName: BANKS[0],
    bankAccount: "",
    accountHolder: "",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    const amount = Number(form.amount);
    if (amount < 5000) {
      setError("최소 출금 금액은 5,000원입니다.");
      setSubmitLoading(false);
      return;
    }
    if (amount > balance) {
      setError("보유 포인트보다 많은 금액은 출금할 수 없습니다.");
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
      setBalance((prev) => prev - amount);
      setForm({ amount: "", bankName: BANKS[0], bankAccount: "", accountHolder: "" });
      setSuccess("출금 신청이 완료되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">로딩중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">출금 신청</h1>

      {/* Balance Display */}
      <div className="bg-red-50 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-red-500 mb-1">보유 포인트</p>
          <p className="text-3xl font-bold text-red-600">{balance.toLocaleString()}P</p>
        </div>
        <p className="text-sm text-red-500">최소 출금: 5,000원</p>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-900 mb-2">출금 정보 입력</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">출금 금액</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            min={5000}
            max={balance}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="5000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">은행</label>
            <select
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
            <input
              type="text"
              value={form.accountHolder}
              onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="예금주명"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
          <input
            type="text"
            value={form.bankAccount}
            onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="- 없이 숫자만 입력"
          />
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">{success}</div>}

        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {submitLoading ? "신청중..." : "출금 신청"}
        </button>
      </form>

      {/* Withdrawal History */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">출금 내역</h2>
        </div>
        {withdrawals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">출금 내역이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">계좌</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withdrawals.map((wd) => (
                <tr key={wd.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(wd.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {wd.amount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {wd.bankName} {wd.bankAccount} ({wd.accountHolder})
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        WD_STATUS[wd.status]?.className || "bg-gray-100"
                      }`}
                    >
                      {WD_STATUS[wd.status]?.label || wd.status}
                    </span>
                    {wd.adminNote && wd.status === "REJECTED" && (
                      <p className="text-xs text-red-400 mt-1">{wd.adminNote}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
