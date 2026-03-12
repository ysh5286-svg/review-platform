"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  businessName: string | null;
  businessCategory: string | null;
  points: number;
  createdAt: string;
  campaignCount: number;
  totalApplications: number;
  totalReviews: number;
}

export default function AdvertiserProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    businessName: "",
    businessCategory: "",
  });

  useEffect(() => {
    fetch("/api/advertiser/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          businessName: data.businessName || "",
          businessCategory: data.businessCategory || "",
        });
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/advertiser/profile", {
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
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">로딩중...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 프로필</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {profile.image ? (
            <img src={profile.image} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-2xl text-blue-600">
              {profile.name?.[0] || "?"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name || "이름 없음"}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
              광고주
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.campaignCount}</p>
            <p className="text-xs text-gray-500 mt-1">등록 캠페인</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.totalApplications}</p>
            <p className="text-xs text-gray-500 mt-1">총 신청자</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.totalReviews}</p>
            <p className="text-xs text-gray-500 mt-1">완료된 리뷰</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{profile.points.toLocaleString()}P</p>
            <p className="text-xs text-gray-500 mt-1">보유 포인트</p>
          </div>
        </div>

        <p className="text-xs text-gray-400">가입일: {new Date(profile.createdAt).toLocaleDateString("ko-KR")}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">정보 수정</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
              수정하기
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">취소</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer">
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사업체명</label>
              <input type="text" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">업종</label>
              <select value={form.businessCategory} onChange={(e) => setForm({ ...form, businessCategory: e.target.value })} disabled={!editing}
                className="w-full px-4 py-2.5 border rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">선택</option>
                {["맛집", "카페", "뷰티", "여행", "생활", "패션", "육아", "IT/테크", "건강/의료", "반려동물", "교육", "기타"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
