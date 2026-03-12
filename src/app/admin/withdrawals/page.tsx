"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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
  user: { name: string | null; email: string | null };
}

const WD_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "거절", className: "bg-red-100 text-red-700" },
};

export default function AdminWithdrawalsPage() {
  const { data: session } = useSession();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/withdrawals")
      .then((r) => r.json())
      .then((data) => setWithdrawals(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, status: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: status === "REJECTED" ? rejectNote[id] || "" : undefined,
        }),
      });
      if (res.ok) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status, adminNote: rejectNote[id] || w.adminNote } : w))
        );
      }
    } catch {}
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">출금 관리</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">출금 요청이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">사용자</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">계좌 정보</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {withdrawals.map((wd) => (
                  <tr key={wd.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(wd.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{wd.user.name || "이름 없음"}</p>
                      <p className="text-xs text-gray-400">{wd.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {wd.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{wd.bankName} {wd.bankAccount}</p>
                      <p className="text-xs text-gray-400">예금주: {wd.accountHolder}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          WD_STATUS[wd.status]?.className || "bg-gray-100"
                        }`}
                      >
                        {WD_STATUS[wd.status]?.label || wd.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {wd.status === "PENDING" ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAction(wd.id, "APPROVED")}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleAction(wd.id, "REJECTED")}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
                            >
                              거절
                            </button>
                          </div>
                          <input
                            type="text"
                            value={rejectNote[wd.id] || ""}
                            onChange={(e) =>
                              setRejectNote({ ...rejectNote, [wd.id]: e.target.value })
                            }
                            placeholder="거절 사유 (선택)"
                            className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      ) : (
                        wd.adminNote && (
                          <p className="text-xs text-gray-400 text-center">{wd.adminNote}</p>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
