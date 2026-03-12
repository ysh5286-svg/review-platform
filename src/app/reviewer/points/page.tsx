"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PointEntry {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface PointData {
  balance: number;
  history: PointEntry[];
}

export default function ReviewerPointsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<PointData>({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviewer/points")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">로딩중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">포인트 내역</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white mb-8">
        <p className="text-red-200 text-sm mb-1">보유 포인트</p>
        <p className="text-4xl font-bold mb-4">{data.balance.toLocaleString()}P</p>
        <Link
          href="/reviewer/withdraw"
          className="inline-block px-5 py-2 bg-white text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          출금 신청
        </Link>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">포인트 이력</h2>
        </div>
        {data.history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">포인트 내역이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">내용</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">금액</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.history.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(entry.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.type === "EARN"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.type === "EARN" ? "적립" : "출금"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{entry.description}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      entry.type === "EARN" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {entry.type === "EARN" ? "+" : "-"}
                    {Math.abs(entry.amount).toLocaleString()}P
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {entry.balanceAfter.toLocaleString()}P
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
