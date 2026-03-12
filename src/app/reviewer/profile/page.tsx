"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { GRADE_COLORS, GRADE_LABELS, GRADE_ICONS, GRADE_ORDER } from "@/lib/grade";
import type { ReviewerGrade } from "@/generated/prisma/client";

interface Profile {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  grade: ReviewerGrade;
  blogUrl: string | null;
  instagramId: string | null;
  youtubeUrl: string | null;
  tiktokId: string | null;
  blogVerified: boolean;
  instagramVerified: boolean;
  youtubeVerified: boolean;
  tiktokVerified: boolean;
  bankName: string | null;
  bankAccount: string | null;
  accountHolder: string | null;
  points: number;
  createdAt: string;
  approvedReviews: number;
  acceptedApplications: number;
  avgRating: number;
  ratingCount: number;
  _count: { applications: number; reviews: number };
}

export default function ReviewerProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "sns" | "bank">("info");

  // 닉네임 변경 모달
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState("");

  // 정보 수정
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: "", phone: "" });
  const [savingInfo, setSavingInfo] = useState(false);

  // SNS 수정
  const [editingSns, setEditingSns] = useState(false);
  const [snsForm, setSnsForm] = useState({
    blogUrl: "",
    instagramId: "",
    youtubeUrl: "",
    tiktokId: "",
  });
  const [savingSns, setSavingSns] = useState(false);

  // 계좌 수정
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankAccount: "",
    accountHolder: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    fetch("/api/reviewer/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setInfoForm({ name: data.name || "", phone: data.phone || "" });
        setSnsForm({
          blogUrl: data.blogUrl || "",
          instagramId: data.instagramId || "",
          youtubeUrl: data.youtubeUrl || "",
          tiktokId: data.tiktokId || "",
        });
        setBankForm({
          bankName: data.bankName || "",
          bankAccount: data.bankAccount || "",
          accountHolder: data.accountHolder || "",
        });
        setNicknameInput(data.nickname || "");
      });
  }, []);

  async function saveField(data: Record<string, string>) {
    const res = await fetch("/api/reviewer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "저장 실패");
    }
    return res.json();
  }

  async function handleNicknameSave() {
    if (!nicknameInput.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }
    if (nicknameInput.trim().length < 2 || nicknameInput.trim().length > 12) {
      setNicknameError("닉네임은 2~12자로 입력해주세요.");
      return;
    }
    setNicknameSaving(true);
    setNicknameError("");
    try {
      const updated = await saveField({ nickname: nicknameInput.trim() });
      setProfile((p) => (p ? { ...p, nickname: updated.nickname } : p));
      setShowNicknameModal(false);
    } catch (e: unknown) {
      setNicknameError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setNicknameSaving(false);
    }
  }

  async function handleInfoSave() {
    setSavingInfo(true);
    try {
      const updated = await saveField(infoForm);
      setProfile((p) => (p ? { ...p, name: updated.name, phone: updated.phone } : p));
      setEditingInfo(false);
    } catch {
      /* noop */
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSnsSave() {
    setSavingSns(true);
    try {
      const updated = await saveField(snsForm);
      setProfile((p) =>
        p
          ? {
              ...p,
              blogUrl: updated.blogUrl,
              instagramId: updated.instagramId,
              youtubeUrl: updated.youtubeUrl,
              tiktokId: updated.tiktokId,
              blogVerified: updated.blogVerified,
              instagramVerified: updated.instagramVerified,
              youtubeVerified: updated.youtubeVerified,
              tiktokVerified: updated.tiktokVerified,
            }
          : p
      );
      setEditingSns(false);
    } catch {
      /* noop */
    } finally {
      setSavingSns(false);
    }
  }

  async function handleBankSave() {
    setSavingBank(true);
    try {
      const updated = await saveField(bankForm);
      setProfile((p) =>
        p
          ? {
              ...p,
              bankName: updated.bankName,
              bankAccount: updated.bankAccount,
              accountHolder: updated.accountHolder,
            }
          : p
      );
      setEditingBank(false);
    } catch {
      /* noop */
    } finally {
      setSavingBank(false);
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">로딩 중...</div>
      </div>
    );
  }

  const gradeColor = GRADE_COLORS[profile.grade];
  const displayName = profile.nickname || profile.name || "이름 없음";
  const snsCount = [profile.blogUrl, profile.instagramId, profile.youtubeUrl, profile.tiktokId].filter(Boolean).length;
  const verifiedCount = [profile.blogVerified, profile.instagramVerified, profile.youtubeVerified, profile.tiktokVerified].filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* 프로필 헤더 카드 */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white mb-4 shadow-lg relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

        <div className="relative flex items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="relative">
            {profile.image ? (
              <img
                src={profile.image}
                alt="프로필"
                className="w-20 h-20 rounded-full object-cover border-3 border-white/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl border-3 border-white/30">
                👤
              </div>
            )}
            {/* 등급 아이콘 */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm shadow-md">
              {GRADE_ICONS[profile.grade]}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold truncate">{displayName}</h1>
              <button
                onClick={() => {
                  setNicknameInput(profile.nickname || "");
                  setNicknameError("");
                  setShowNicknameModal(true);
                }}
                className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs hover:bg-white/30 transition-colors cursor-pointer"
                title="닉네임 변경"
              >
                ✏️
              </button>
            </div>
            <p className="text-sm text-white/70 truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm`}>
                {GRADE_LABELS[profile.grade]} 등급
              </span>
              {profile.avgRating > 0 && (
                <span className="text-xs text-white/80">
                  ⭐ {profile.avgRating.toFixed(1)} ({profile.ratingCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="relative grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-xl font-bold">{profile._count.applications}</p>
            <p className="text-[10px] text-white/60 mt-0.5">총 신청</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{profile.acceptedApplications}</p>
            <p className="text-[10px] text-white/60 mt-0.5">선정</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{profile.approvedReviews}</p>
            <p className="text-[10px] text-white/60 mt-0.5">리뷰 완료</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{profile.points.toLocaleString()}</p>
            <p className="text-[10px] text-white/60 mt-0.5">포인트</p>
          </div>
        </div>
      </div>

      {/* 등급 진행률 */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">등급 현황</h3>
          <span className="text-xs text-gray-400">
            가입일 {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {GRADE_ORDER.map((g, i) => {
            const isActive = g === profile.grade;
            const isPast = GRADE_ORDER.indexOf(g) <= GRADE_ORDER.indexOf(profile.grade);
            return (
              <div key={g} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-2 rounded-full ${
                    isPast ? "bg-red-500" : "bg-gray-200"
                  } ${i === 0 ? "rounded-l-full" : ""} ${i === GRADE_ORDER.length - 1 ? "rounded-r-full" : ""}`}
                />
                <span
                  className={`text-[9px] font-medium ${
                    isActive ? "text-red-500 font-bold" : isPast ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {GRADE_ICONS[g]} {GRADE_LABELS[g]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {(
          [
            { key: "info", label: "기본 정보", icon: "👤" },
            { key: "sns", label: "SNS 계정", icon: "📱" },
            { key: "bank", label: "출금 계좌", icon: "🏦" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-red-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 기본 정보 탭 */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">기본 정보</h3>
            {!editingInfo ? (
              <button
                onClick={() => setEditingInfo(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingInfo(false);
                    setInfoForm({ name: profile.name || "", phone: profile.phone || "" });
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleInfoSave}
                  disabled={savingInfo}
                  className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                >
                  {savingInfo ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">이름 (실명)</label>
              <input
                type="text"
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                disabled={!editingInfo}
                className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">닉네임</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.nickname || "미설정"}
                  disabled
                  className="flex-1 px-4 py-3 border rounded-xl text-sm bg-gray-50 text-gray-500"
                />
                <button
                  onClick={() => {
                    setNicknameInput(profile.nickname || "");
                    setNicknameError("");
                    setShowNicknameModal(true);
                  }}
                  className="px-4 py-3 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  변경
                </button>
              </div>
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
                value={infoForm.phone}
                onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                disabled={!editingInfo}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* SNS 계정 탭 */}
      {activeTab === "sns" && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-900">SNS 계정</h3>
            {!editingSns ? (
              <button
                onClick={() => setEditingSns(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingSns(false);
                    setSnsForm({
                      blogUrl: profile.blogUrl || "",
                      instagramId: profile.instagramId || "",
                      youtubeUrl: profile.youtubeUrl || "",
                      tiktokId: profile.tiktokId || "",
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleSnsSave}
                  disabled={savingSns}
                  className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                >
                  {savingSns ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-5">
            SNS 계정을 등록하면 캠페인 신청 시 광고주에게 노출됩니다.
            {snsCount > 0 && (
              <span className="ml-1 text-red-500 font-medium">
                ({snsCount}개 등록 · {verifiedCount}개 인증완료)
              </span>
            )}
          </p>

          <div className="space-y-3">
            {/* 네이버 블로그 */}
            <SnsCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#03C75A" d="M16.27 12.97L7.44 3H3v18h4.73V11.03L16.56 21H21V3h-4.73z" />
                </svg>
              }
              label="네이버 블로그"
              value={snsForm.blogUrl}
              placeholder="https://blog.naver.com/아이디"
              verified={profile.blogVerified}
              editing={editingSns}
              onChange={(v) => setSnsForm({ ...snsForm, blogUrl: v })}
              color="bg-green-50 border-green-200"
            />

            {/* 인스타그램 */}
            <SnsCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <linearGradient id="ig" x1="0" y1="24" x2="24" y2="0">
                    <stop offset="0%" stopColor="#FD5" />
                    <stop offset="50%" stopColor="#FF543E" />
                    <stop offset="100%" stopColor="#C837AB" />
                  </linearGradient>
                  <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" stroke="url(#ig)" strokeWidth="2" />
                  <circle cx="18" cy="6" r="1.5" fill="url(#ig)" />
                </svg>
              }
              label="인스타그램"
              value={snsForm.instagramId}
              placeholder="@없이 아이디만"
              verified={profile.instagramVerified}
              editing={editingSns}
              onChange={(v) => setSnsForm({ ...snsForm, instagramId: v })}
              color="bg-pink-50 border-pink-200"
            />

            {/* 유튜브 */}
            <SnsCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#FF0000"
                    d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"
                  />
                </svg>
              }
              label="유튜브"
              value={snsForm.youtubeUrl}
              placeholder="유튜브 채널 URL"
              verified={profile.youtubeVerified}
              editing={editingSns}
              onChange={(v) => setSnsForm({ ...snsForm, youtubeUrl: v })}
              color="bg-red-50 border-red-200"
            />

            {/* 틱톡 */}
            <SnsCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#000000"
                    d="M19.6 5.6c-1.1-.8-1.9-2-2.1-3.4h.1c-.1-.7-.2-1.2-.2-1.2h-3.8v13.9c0 .2 0 .3 0 .5 0 0 0 0 0 .1 0 1.8-1.5 3.2-3.3 3.2-1.8 0-3.3-1.4-3.3-3.2 0-1.8 1.5-3.2 3.3-3.2.3 0 .7.1 1 .2V8.6c-.3 0-.6-.1-1-.1C5.9 8.5 2.5 11.9 2.5 16.1s3.4 7.6 7.7 7.6c4.3 0 7.7-3.4 7.7-7.6V8.5c1.5 1.1 3.4 1.7 5.4 1.7V6.4c-1.4 0-2.6-.3-3.7-.8z"
                  />
                </svg>
              }
              label="틱톡"
              value={snsForm.tiktokId}
              placeholder="틱톡 아이디"
              verified={profile.tiktokVerified}
              editing={editingSns}
              onChange={(v) => setSnsForm({ ...snsForm, tiktokId: v })}
              color="bg-gray-50 border-gray-200"
            />
          </div>

          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
            ※ SNS 인증은 관리자 확인 후 완료됩니다. 계정 변경 시 인증이 초기화됩니다.
          </p>
        </div>
      )}

      {/* 출금 계좌 탭 */}
      {activeTab === "bank" && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">출금 계좌</h3>
            {!editingBank ? (
              <button
                onClick={() => setEditingBank(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBank(false);
                    setBankForm({
                      bankName: profile.bankName || "",
                      bankAccount: profile.bankAccount || "",
                      accountHolder: profile.accountHolder || "",
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleBankSave}
                  disabled={savingBank}
                  className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                >
                  {savingBank ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>

          {!profile.bankName && !editingBank && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-yellow-700">
                💡 출금 계좌를 등록하면 포인트 출금이 가능합니다.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">은행</label>
              <select
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                disabled={!editingBank}
                className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
              >
                <option value="">선택해주세요</option>
                {["국민은행","신한은행","우리은행","하나은행","농협","카카오뱅크","토스뱅크","기업은행","SC제일은행","대구은행","부산은행","경남은행","광주은행","전북은행","제주은행","수협","새마을금고","신협","우체국"].map(
                  (b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">계좌번호</label>
              <input
                type="text"
                value={bankForm.bankAccount}
                onChange={(e) => setBankForm({ ...bankForm, bankAccount: e.target.value })}
                disabled={!editingBank}
                placeholder="- 없이 숫자만 입력"
                className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">예금주</label>
              <input
                type="text"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                disabled={!editingBank}
                placeholder="예금주명"
                className="w-full px-4 py-3 border rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {profile.bankName && !editingBank && (
            <div className="mt-5 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                계좌 등록 완료
              </div>
            </div>
          )}
        </div>
      )}

      {/* 닉네임 변경 모달 */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">닉네임 변경</h3>
            <p className="text-xs text-gray-400 mb-5">2~12자의 닉네임을 입력해주세요</p>

            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => {
                setNicknameInput(e.target.value);
                setNicknameError("");
              }}
              maxLength={12}
              placeholder="새 닉네임 입력"
              className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent mb-2"
              autoFocus
            />
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-gray-400">{nicknameInput.length}/12</p>
              {nicknameError && (
                <p className="text-xs text-red-500">{nicknameError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-3 text-sm font-medium text-gray-500 border rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleNicknameSave}
                disabled={nicknameSaving}
                className="flex-1 py-3 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                {nicknameSaving ? "변경 중..." : "변경하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* SNS 카드 컴포넌트 */
function SnsCard({
  icon,
  label,
  value,
  placeholder,
  verified,
  editing,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  verified: boolean;
  editing: boolean;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {value && (
          <span
            className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${
              verified
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {verified ? "✅ 인증완료" : "⏳ 인증대기"}
          </span>
        )}
        {!value && !editing && (
          <span className="ml-auto text-[10px] text-gray-400">미등록</span>
        )}
      </div>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      ) : value ? (
        <p className="text-xs text-gray-600 truncate pl-7">{value}</p>
      ) : null}
    </div>
  );
}
