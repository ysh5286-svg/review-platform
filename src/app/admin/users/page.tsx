"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  createdAt: string;
  points: number;
}

const ROLE_MAP: Record<string, { label: string; className: string }> = {
  REVIEWER: { label: "리뷰어", className: "bg-green-100 text-green-700" },
  ADVERTISER: { label: "광고주", className: "bg-red-100 text-red-600" },
  ADMIN: { label: "관리자", className: "bg-purple-100 text-purple-700" },
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="text-sm text-gray-500">총 {users.length}명</p>
          </div>
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">사용자가 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">이름</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">이메일</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">역할</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">포인트</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.name || "이름 없음"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {user.role ? (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            ROLE_MAP[user.role]?.className || "bg-gray-100"
                          }`}
                        >
                          {ROLE_MAP[user.role]?.label || user.role}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">미설정</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {user.points.toLocaleString()}P
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
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
