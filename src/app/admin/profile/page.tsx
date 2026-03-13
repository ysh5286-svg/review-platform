"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface AdminProfile {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  createdAt: string;
}

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", nickname: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/reviewer/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          nickname: data.nickname || "",
          phone: data.phone || "",
        });
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/reviewer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "저장 실패");
        return;
      }
      const updated = await res.json();
      setProfile((p) =>
        p ? { ...p, name: updated.name, nickname: updated.nickname, phone: updated.phone } : p
      );
      setEditing(false);
      setMessage("저장되었습니다.");
      // 세션 이름 업데이트
      if (updated.name) {
        await updateSession({ name: updated.name });
      }
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">내 프로필</h1>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          {profile.image ? (
            <img src={profile.image} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
              {(profile.name || "A")[0]}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile.nickname || profile.name || "관리자"}</h2>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <span className="inline-block text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded mt-1">
              관리자
            </span>
          </div>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            message.includes("실패") || message.includes("오류") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}>
            {message}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">기본 정보</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              수정
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: profile.name || "",
                    nickname: profile.nickname || "",
                    phone: profile.phone || "",
                  });
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">닉네임</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              disabled={!editing}
              placeholder="닉네임 입력"
              className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">이메일</label>
            <input
              type="email"
              value={profile.email || ""}
              disabled
              className="w-full px-4 py-3 border rounded-xl text-sm bg-gray-50 text-gray-400"
            />
            <p className="text-[10px] text-gray-400 mt-1">소셜 로그인 이메일은 변경할 수 없습니다</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">연락처</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* 계정 정보 */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">계정 정보</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">가입일</span>
            <span className="text-gray-700">{new Date(profile.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">역할</span>
            <span className="text-red-600 font-medium">관리자 (ADMIN)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
