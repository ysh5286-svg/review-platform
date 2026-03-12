"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  role: string | null;
  createdAt: string;
  points: number;
  grade: string | null;
  blogUrl: string | null;
  blogVerified: boolean;
  instagramId: string | null;
  instagramVerified: boolean;
  youtubeUrl: string | null;
  youtubeVerified: boolean;
  tiktokId: string | null;
  tiktokVerified: boolean;
  businessName: string | null;
}

const ROLE_MAP: Record<string, { label: string; className: string }> = {
  REVIEWER: { label: "리뷰어", className: "bg-green-100 text-green-700" },
  ADVERTISER: { label: "광고주", className: "bg-red-100 text-red-600" },
  ADMIN: { label: "관리자", className: "bg-purple-100 text-purple-700" },
};

const GRADE_MAP: Record<string, string> = {
  BEGINNER: "일반",
  STANDARD: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  PREMIUM: "프리미어",
  INFLUENCER: "인플루언서",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.nickname?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.businessName?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  function hasSns(user: User) {
    return user.blogUrl || user.instagramId || user.youtubeUrl || user.tiktokId;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      {/* 필터/검색 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="이름, 닉네임, 이메일 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
        >
          <option value="">전체 역할</option>
          <option value="REVIEWER">리뷰어</option>
          <option value="ADVERTISER">광고주</option>
          <option value="ADMIN">관리자</option>
        </select>
        <p className="text-sm text-gray-500 ml-auto">
          총 <span className="font-bold text-gray-900">{filteredUsers.length}</span>명
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">사용자가 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">이름</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">이메일</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">역할</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">SNS</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">포인트</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">가입일</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">역할 변경</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <>
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user.name || "이름 없음"}</p>
                        {user.nickname && (
                          <p className="text-xs text-gray-400">@{user.nickname}</p>
                        )}
                        {user.role === "REVIEWER" && user.grade && (
                          <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                            {GRADE_MAP[user.grade] || user.grade}
                          </span>
                        )}
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
                      <td className="px-4 py-3 text-center">
                        {hasSns(user) ? (
                          <button
                            onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            {expandedUser === user.id ? "접기" : "보기"}
                            {" "}
                            ({[user.blogUrl, user.instagramId, user.youtubeUrl, user.tiktokId].filter(Boolean).length}개)
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">없음</span>
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
                    {/* SNS 상세 정보 펼침 */}
                    {expandedUser === user.id && (
                      <tr key={`${user.id}-sns`} className="bg-blue-50/50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* 블로그 */}
                            <SnsItem
                              label="네이버 블로그"
                              icon="📝"
                              value={user.blogUrl}
                              verified={user.blogVerified}
                            />
                            {/* 인스타그램 */}
                            <SnsItem
                              label="인스타그램"
                              icon="📸"
                              value={user.instagramId ? `@${user.instagramId}` : null}
                              url={user.instagramId ? `https://instagram.com/${user.instagramId}` : undefined}
                              verified={user.instagramVerified}
                            />
                            {/* 유튜브 */}
                            <SnsItem
                              label="유튜브"
                              icon="🎬"
                              value={user.youtubeUrl}
                              verified={user.youtubeVerified}
                            />
                            {/* 틱톡 */}
                            <SnsItem
                              label="틱톡"
                              icon="🎵"
                              value={user.tiktokId ? `@${user.tiktokId}` : null}
                              url={user.tiktokId ? `https://tiktok.com/@${user.tiktokId}` : undefined}
                              verified={user.tiktokVerified}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function SnsItem({
  label,
  icon,
  value,
  url,
  verified,
}: {
  label: string;
  icon: string;
  value: string | null;
  url?: string;
  verified: boolean;
}) {
  if (!value) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 p-3 opacity-40">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
        <p className="text-xs text-gray-300">미등록</p>
      </div>
    );
  }

  const link = url || (value.startsWith("http") ? value : undefined);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium text-gray-700">{label}</span>
        {verified ? (
          <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
            인증됨
          </span>
        ) : (
          <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full font-medium">
            미인증
          </span>
        )}
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-xs text-gray-600 break-all">{value}</p>
      )}
    </div>
  );
}
