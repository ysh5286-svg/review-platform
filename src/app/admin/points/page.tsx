"use client";

import { useEffect, useState } from "react";

interface PointRecord {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
  user: { name: string | null; email: string | null };
}

const TYPE_MAP: Record<string, { label: string; className: string }> = {
  EARN: { label: "적립", className: "text-green-600" },
  WITHDRAW: { label: "출금", className: "text-red-600" },
};

export default function AdminPointsPage() {
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/points")
      .then((r) => r.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">포인트 내역 관리</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {records.length === 0 ? (
            <div className="text-center py-12 text-gray-400">포인트 내역이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">사용자</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">유형</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">설명</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">잔액</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.user.name || "이름 없음"}</p>
                      <p className="text-xs text-gray-400">{r.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold ${TYPE_MAP[r.type]?.className || ""}`}>
                        {TYPE_MAP[r.type]?.label || r.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${r.type === "EARN" ? "text-green-600" : "text-red-600"}`}>
                      {r.type === "EARN" ? "+" : "-"}{Math.abs(r.amount).toLocaleString()}P
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {r.description}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {r.balanceAfter.toLocaleString()}P
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
