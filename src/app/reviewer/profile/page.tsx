"use client";

import { useEffect, useState } from "react";
import { GRADE_COLORS } from "@/lib/grade";
import type { ReviewerGrade } from "@/generated/prisma/client";

const GRADE_LABELS: Record<string, string> = {
  BEGINNER: "신입",
  STANDARD: "일반",
  PREMIUM: "프리미엄",
  VIP: "VIP",
};

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  grade: ReviewerGrade;
  blogUrl: string | null;
  instagramId: string | null;
  youtubeUrl: string | null;
  tiktokId: string | null;
  bankName: string | null;
  bankAccount: string | null;
  accountHolder: string | null;
  points: number;
  createdAt: string;
  approvedReviews: number;
  acceptedApplications: number;
  _count: { applications: number; reviews: number };
}

export default function ReviewerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    blogUrl: "",
    instagramId: "",
    youtubeUrl: "",
    tiktokId: "",
    bankName: "",
    bankAccount: "",
    accountHolder: "",
  });

  useEffect(() => {
    fetch("/api/reviewer/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          blogUrl: data.blogUrl || "",
          instagramId: data.instagramId || "",
          youtubeUrl: data.youtubeUrl || "",
          tiktokId: data.tiktokId || "",
          bankName: data.bankName || "",
          bankAccount: data.bankAccount || "",
          accountHolder: data.accountHolder || "",
        });
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/reviewer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  const gradeColor = GRADE_COLORS[profile.grade];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 프로필</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {profile.image ? (
            <img
              src={profile.image}
              alt="프로필"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
              ?
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.name || "이름 없음"}
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span
              className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white ${gradeColor.badge}`}
            >
              {GRADE_LABELS[profile.grade]}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile._count.applications}
            </p>
            <p className="text-xs text-gray-500 mt-1">총 신청</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.acceptedApplications}
            </p>
            <p className="text-xs text-gray-500 mt-1">선정</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.approvedReviews}
            </p>
            <p className="text-xs text-gray-500 mt-1">승인된 리뷰</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500 font-semibold">
              {profile.points.toLocaleString()}P
            </p>
            <p className="text-xs text-gray-500 mt-1">보유 포인트</p>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          가입일: {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">정보 수정</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
            >
              수정하기
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-700 pt-2">SNS 계정</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">네이버 블로그</label>
              <input
                type="url"
                value={form.blogUrl}
                onChange={(e) => setForm({ ...form, blogUrl: e.target.value })}
                disabled={!editing}
                placeholder="https://blog.naver.com/..."
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인스타그램</label>
              <input
                type="text"
                value={form.instagramId}
                onChange={(e) => setForm({ ...form, instagramId: e.target.value })}
                disabled={!editing}
                placeholder="@없이 아이디만"
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유튜브</label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                disabled={!editing}
                placeholder="유튜브 채널 URL"
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">틱톡</label>
              <input
                type="text"
                value={form.tiktokId}
                onChange={(e) => setForm({ ...form, tiktokId: e.target.value })}
                disabled={!editing}
                placeholder="틱톡 아이디"
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-700 pt-2">출금 계좌 정보</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">은행</label>
              <select
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">선택</option>
                <option value="국민은행">국민은행</option>
                <option value="신한은행">신한은행</option>
                <option value="우리은행">우리은행</option>
                <option value="하나은행">하나은행</option>
                <option value="농협">농협</option>
                <option value="카카오뱅크">카카오뱅크</option>
                <option value="토스뱅크">토스뱅크</option>
                <option value="기업은행">기업은행</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                disabled={!editing}
                placeholder="계좌번호"
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
              <input
                type="text"
                value={form.accountHolder}
                onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                disabled={!editing}
                placeholder="예금주명"
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
