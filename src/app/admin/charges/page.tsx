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
  advertiser: { name: string | null; email: string | null; businessName: string | null };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "취소", className: "bg-red-100 text-red-700" },
};

export default function AdminChargesPage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/charges")
      .then((r) => r.json())
      .then((data) => setCharges(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, status: "COMPLETED" | "CANCELLED") {
    const res = await fetch(`/api/admin/charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: notes[id] || "" }),
    });
    if (res.ok) {
      setCharges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, adminNote: notes[id] || c.adminNote } : c))
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">충전 관리</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {charges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">충전 요청이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">광고주</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">방법</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {charges.map((charge) => (
                  <tr key={charge.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(charge.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{charge.advertiser.businessName || charge.advertiser.name}</p>
                      <p className="text-xs text-gray-400">{charge.advertiser.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {charge.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {charge.method === "BANK_TRANSFER" ? "무통장입금" : "카드결제"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_MAP[charge.status]?.className || "bg-gray-100"}`}>
                        {STATUS_MAP[charge.status]?.label || charge.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {charge.status === "PENDING" ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleAction(charge.id, "COMPLETED")}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 cursor-pointer">승인</button>
                            <button onClick={() => handleAction(charge.id, "CANCELLED")}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 cursor-pointer">취소</button>
                          </div>
                          <input type="text" value={notes[charge.id] || ""} onChange={(e) => setNotes({ ...notes, [charge.id]: e.target.value })}
                            placeholder="메모 (선택)" className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      ) : (
                        charge.adminNote && <p className="text-xs text-gray-400 text-center">{charge.adminNote}</p>
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
