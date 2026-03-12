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
  const [changing, setChanging] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: string, newRole: string) {
    if (!confirm(`이 사용자의 역할을 ${ROLE_MAP[newRole]?.label || newRole}(으)로 변경하시겠습니까?`)) return;
    setChanging(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
        );
      }
    } finally {
      setChanging(null);
    }
  }

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
                  <th className="text-center px-4 py-3 font-medium text-gray-500">역할 변경</th>
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
                    <td className="px-4 py-3 text-center">
                      {user.id === session?.user?.id ? (
                        <span className="text-xs text-gray-400">본인</span>
                      ) : (
                        <select
                          value={user.role || ""}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={changing === user.id}
                          className="text-xs border rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="REVIEWER">리뷰어</option>
                          <option value="ADVERTISER">광고주</option>
                          <option value="ADMIN">관리자</option>
                        </select>
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
