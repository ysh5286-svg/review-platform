"use client";

import { useEffect, useState } from "react";

interface Charge {
  id: string;
  amount: number;
  method: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface PointHistoryItem {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

const CHARGE_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "취소", className: "bg-red-100 text-red-700" },
};

export default function AdvertiserPointsPage() {
  const [balance, setBalance] = useState(0);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeMethod, setChargeMethod] = useState("BANK_TRANSFER");
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"charges" | "history">("charges");

  useEffect(() => {
    fetch("/api/advertiser/points")
      .then((r) => r.json())
      .then((data) => {
        setBalance(data.balance || 0);
        setCharges(data.charges || []);
        setPointHistory(data.pointHistory || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCharge() {
    const amount = parseInt(chargeAmount);
    if (!amount || amount < 10000) {
      alert("최소 충전 금액은 10,000원입니다");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/advertiser/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: chargeMethod }),
      });
      if (res.ok) {
        const charge = await res.json();
        setCharges((prev) => [charge, ...prev]);
        setShowChargeForm(false);
        setChargeAmount("");
        alert("충전 신청이 완료되었습니다. 관리자 승인 후 포인트가 충전됩니다.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">로딩중...</div>;
  }

  const quickAmounts = [10000, 30000, 50000, 100000, 300000, 500000];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">포인트 관리</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
        <p className="text-sm opacity-80 mb-1">보유 포인트</p>
        <p className="text-3xl font-bold mb-4">{balance.toLocaleString()}P</p>
        <button
          onClick={() => setShowChargeForm(!showChargeForm)}
          className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
        >
          포인트 충전하기
        </button>
      </div>

      {/* Charge Form */}
      {showChargeForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">포인트 충전 신청</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">충전 금액</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setChargeAmount(amt.toString())}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    chargeAmount === amt.toString()
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  <span>{amt.toLocaleString()}P</span>
                  <span className={`block text-[10px] mt-0.5 ${chargeAmount === amt.toString() ? "text-blue-200" : "text-gray-400"}`}>
                    (VAT포함 {Math.round(amt * 1.1).toLocaleString()}원)
                  </span>
                </button>
              ))}
            </div>
            <input
              type="number"
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              placeholder="직접 입력 (최소 10,000원)"
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">충전 방법</label>
            <div className="flex gap-3">
              <button
                onClick={() => setChargeMethod("BANK_TRANSFER")}
                className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  chargeMethod === "BANK_TRANSFER"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                무통장입금
              </button>
              <button
                onClick={() => setChargeMethod("CARD")}
                className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  chargeMethod === "CARD"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                카드결제
              </button>
            </div>
          </div>

          {/* VAT 포함 결제 금액 안내 */}
          {chargeAmount && parseInt(chargeAmount) >= 10000 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">충전 포인트</span>
                <span className="text-gray-900">{parseInt(chargeAmount).toLocaleString()}P</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">VAT (10%)</span>
                <span className="text-gray-900">{Math.round(parseInt(chargeAmount) * 0.1).toLocaleString()}원</span>
              </div>
              <div className="border-t my-2" />
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-gray-700">총 결제 금액</span>
                <span className="text-blue-600 text-base">{Math.round(parseInt(chargeAmount) * 1.1).toLocaleString()}원</span>
              </div>
            </div>
          )}

          {chargeMethod === "BANK_TRANSFER" && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">입금 계좌 안내</p>
              <p>하나은행 010-668699-38807 (다즐피플)</p>
              <p className="text-xs mt-1 text-blue-600">* VAT 포함 금액을 입금해주세요.</p>
              <p className="text-xs text-blue-600">* 입금자명을 회원명과 동일하게 입력해주세요.</p>
              <p className="text-xs text-blue-600">* 입금 후 관리자 확인까지 영업일 기준 1~2일 소요됩니다.</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCharge}
              disabled={submitting || !chargeAmount}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? "처리중..." : chargeAmount && parseInt(chargeAmount) >= 10000 ? `${Math.round(parseInt(chargeAmount) * 1.1).toLocaleString()}원 충전 신청 (VAT 포함)` : "충전 신청"}
            </button>
            <button
              onClick={() => setShowChargeForm(false)}
              className="px-6 py-3 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setTab("charges")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === "charges" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          충전 내역
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === "history" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          포인트 사용 내역
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {tab === "charges" ? (
          charges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">충전 내역이 없습니다</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">방법</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {charges.map((charge) => (
                  <tr key={charge.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(charge.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {charge.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {charge.method === "BANK_TRANSFER" ? "무통장입금" : "카드결제"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        CHARGE_STATUS[charge.status]?.className || "bg-gray-100"
                      }`}>
                        {CHARGE_STATUS[charge.status]?.label || charge.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          pointHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">포인트 내역이 없습니다</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">내용</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">잔액</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pointHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.description}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      item.amount > 0 ? "text-green-600" : "text-red-500"
                    }`}>
                      {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}P
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.balanceAfter.toLocaleString()}P
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
