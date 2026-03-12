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
  naverPlaceUrl: string | null;
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
    naverPlaceUrl: "",
  });
  const [placeInput, setPlaceInput] = useState("");
  const [placeSaving, setPlaceSaving] = useState(false);
  const [placeSuccess, setPlaceSuccess] = useState(false);

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
          naverPlaceUrl: data.naverPlaceUrl || "",
        });
        setPlaceInput(data.naverPlaceUrl || "");
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

      {/* 내 플레이스 연결 */}
      <div id="place" className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📍</span>
          <h3 className="text-lg font-bold text-gray-900">내 플레이스</h3>
          {profile.naverPlaceUrl && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600">연결됨</span>
          )}
        </div>

        {profile.naverPlaceUrl ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800 font-medium mb-1">네이버 플레이스가 연결되어 있습니다</p>
            <a href={profile.naverPlaceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">
              {profile.naverPlaceUrl}
            </a>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium">아직 네이버 플레이스가 연결되지 않았습니다</p>
            <p className="text-xs text-amber-600 mt-1">플레이스를 연결하면 캠페인 등록 시 자동으로 매장 정보가 연동됩니다.</p>
          </div>
        )}

        {/* 등록 방법 안내 */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Q. 플레이스 URL은 어떻게 등록하나요?</p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="text-sm text-gray-700 font-medium">네이버 플레이스에서 내 매장을 검색해주세요</p>
                <p className="text-xs text-gray-500 mt-0.5">네이버 지도 또는 네이버 검색에서 매장명을 검색합니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="text-sm text-gray-700 font-medium">공유 버튼에서 링크를 복사하여 아래 칸에 붙여넣기(Ctrl+V) 해주세요</p>
                <p className="text-xs text-gray-500 mt-0.5">예: https://naver.me/xxxxx 또는 https://map.naver.com/... 형태의 URL</p>
              </div>
            </div>
          </div>
        </div>

        {/* URL 입력 */}
        <div className="flex gap-2">
          <input
            type="url"
            value={placeInput}
            onChange={(e) => { setPlaceInput(e.target.value); setPlaceSuccess(false); }}
            placeholder="네이버 플레이스 URL을 붙여넣기 하세요"
            className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={async () => {
              if (!placeInput.trim()) return;
              if (!placeInput.includes("naver") && !placeInput.includes("map.naver")) {
                alert("네이버 플레이스 URL을 입력해주세요.\n예: https://naver.me/xxxxx");
                return;
              }
              setPlaceSaving(true);
              try {
                const res = await fetch("/api/advertiser/profile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...form, naverPlaceUrl: placeInput.trim() }),
                });
                if (res.ok) {
                  const updated = await res.json();
                  setProfile((prev) => prev ? { ...prev, naverPlaceUrl: placeInput.trim() } : prev);
                  setForm((prev) => ({ ...prev, naverPlaceUrl: placeInput.trim() }));
                  setPlaceSuccess(true);
                }
              } finally {
                setPlaceSaving(false);
              }
            }}
            disabled={placeSaving || !placeInput.trim()}
            className="px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {placeSaving ? "저장 중..." : profile.naverPlaceUrl ? "변경" : "등록"}
          </button>
        </div>
        {placeSuccess && (
          <p className="text-xs text-green-600 mt-2 font-medium">✅ 네이버 플레이스가 성공적으로 저장되었습니다!</p>
        )}
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
