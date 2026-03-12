"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  campaignNumber: number;
  title: string;
  description: string;
  platform: string;
  contentType: string;
  category: string;
  status: string;
  businessName: string;
  businessAddress: string | null;
  offerDetails: string;
  requirements: string | null;
  imageUrl: string | null;
  maxReviewers: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  advertiser: { id: string; name: string | null; email: string | null; businessName: string | null };
  _count: { applications: number };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  RECRUITING: { label: "모집중", className: "bg-red-100 text-red-600" },
  IN_PROGRESS: { label: "진행중", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-gray-100 text-gray-500" },
  CLOSED: { label: "마감", className: "bg-gray-100 text-gray-500" },
};

const PLATFORM_MAP: Record<string, string> = {
  NAVER_BLOG: "네이버블로그",
  INSTAGRAM: "인스타그램",
  SHORT_FORM: "숏폼영상",
};

const CONTENT_MAP: Record<string, string> = {
  BLOG_REVIEW: "블로그리뷰",
  INSTAGRAM_POST: "인스타포스트",
  INSTAGRAM_REEL: "릴스",
  YOUTUBE_SHORTS: "유튜브쇼츠",
  TIKTOK: "틱톡",
};

export default function AdminCampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Campaign>>({});
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  function fetchCampaigns() {
    fetch("/api/admin/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleDelete(campaignId: string, title: string) {
    if (!confirm(`"${title}" 캠페인을 정말 삭제하시겠습니까?\n\n관련된 신청 및 리뷰 데이터도 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        alert("캠페인이 삭제되었습니다.");
      } else {
        const err = await res.json();
        alert(err.error || "삭제에 실패했습니다.");
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  function startEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setEditData({
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      platform: campaign.platform,
      contentType: campaign.contentType,
      businessName: campaign.businessName,
      businessAddress: campaign.businessAddress,
      offerDetails: campaign.offerDetails,
      requirements: campaign.requirements,
      pointReward: campaign.pointReward,
      maxReviewers: campaign.maxReviewers,
      startDate: campaign.startDate.split("T")[0],
      endDate: campaign.endDate.split("T")[0],
      status: campaign.status,
    });
  }

  async function handleSave() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setEditingId(null);
        setEditData({});
        fetchCampaigns();
        alert("캠페인이 수정되었습니다.");
      } else {
        const err = await res.json();
        alert(err.error || "수정에 실패했습니다.");
      }
    } catch {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(campaignId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c))
        );
      }
    } catch {
      alert("상태 변경에 실패했습니다.");
    }
  }

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().replace(/^#/, "");
      const numTerm = parseInt(term);
      if (!isNaN(numTerm) && term === String(numTerm) && c.campaignNumber === numTerm) return true;
      return (
        c.title.toLowerCase().includes(term) ||
        c.businessName.toLowerCase().includes(term) ||
        c.advertiser.name?.toLowerCase().includes(term) ||
        c.advertiser.email?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">캠페인 관리</h1>

      {/* 필터/검색 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="#번호, 캠페인명, 업체명, 광고주 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
        >
          <option value="">전체 상태</option>
          <option value="RECRUITING">모집중</option>
          <option value="IN_PROGRESS">진행중</option>
          <option value="COMPLETED">완료</option>
          <option value="CLOSED">마감</option>
        </select>
        <p className="text-sm text-gray-500 ml-auto">
          총 <span className="font-bold text-gray-900">{filteredCampaigns.length}</span>개
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <>
          {/* 수정 모달 */}
          {editingId && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold text-gray-900">캠페인 수정</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">캠페인명</label>
                    <input
                      type="text"
                      value={editData.title || ""}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <textarea
                      value={editData.description || ""}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">업체명</label>
                      <input
                        type="text"
                        value={editData.businessName || ""}
                        onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                      <input
                        type="text"
                        value={editData.businessAddress || ""}
                        onChange={(e) => setEditData({ ...editData, businessAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제공 내용</label>
                    <textarea
                      value={editData.offerDetails || ""}
                      onChange={(e) => setEditData({ ...editData, offerDetails: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                      <select
                        value={editData.category || ""}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                      >
                        {["맛집","식품","뷰티","여행","생활","패션","디지털","반려동물","육아","IT/테크","기타"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                      <select
                        value={editData.status || ""}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                      >
                        <option value="RECRUITING">모집중</option>
                        <option value="IN_PROGRESS">진행중</option>
                        <option value="COMPLETED">완료</option>
                        <option value="CLOSED">마감</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
                      <select
                        value={editData.platform || ""}
                        onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                      >
                        <option value="NAVER_BLOG">네이버블로그</option>
                        <option value="INSTAGRAM">인스타그램</option>
                        <option value="SHORT_FORM">숏폼영상</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">콘텐츠유형</label>
                      <select
                        value={editData.contentType || ""}
                        onChange={(e) => setEditData({ ...editData, contentType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                      >
                        <option value="BLOG_REVIEW">블로그리뷰</option>
                        <option value="INSTAGRAM_POST">인스타포스트</option>
                        <option value="INSTAGRAM_REEL">릴스</option>
                        <option value="YOUTUBE_SHORTS">유튜브쇼츠</option>
                        <option value="TIKTOK">틱톡</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">모집인원</label>
                      <input
                        type="number"
                        value={editData.maxReviewers || 0}
                        onChange={(e) => setEditData({ ...editData, maxReviewers: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">포인트</label>
                      <input
                        type="number"
                        value={editData.pointReward || 0}
                        onChange={(e) => setEditData({ ...editData, pointReward: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                      <input
                        type="date"
                        value={editData.startDate || ""}
                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                      <input
                        type="date"
                        value={editData.endDate || ""}
                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">리뷰 조건</label>
                    <textarea
                      value={editData.requirements || ""}
                      onChange={(e) => setEditData({ ...editData, requirements: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
                <div className="p-6 border-t flex items-center justify-end gap-3">
                  <button
                    onClick={() => { setEditingId(null); setEditData({}); }}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-400">캠페인이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-center px-3 py-3 font-medium text-gray-500 w-16">번호</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">캠페인명</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">광고주</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">플랫폼</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">신청자</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">포인트</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">기간</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-bold text-gray-500">#{c.campaignNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/campaigns/${c.id}`}
                            className="text-red-500 font-medium hover:underline"
                          >
                            {c.title}
                          </Link>
                          <p className="text-xs text-gray-400">{c.category} · {CONTENT_MAP[c.contentType] || c.contentType}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900">{c.advertiser.name || "이름 없음"}</p>
                          <p className="text-xs text-gray-400">{c.advertiser.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {PLATFORM_MAP[c.platform] || c.platform}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 ${
                              STATUS_MAP[c.status]?.className || "bg-gray-100"
                            }`}
                          >
                            <option value="RECRUITING">모집중</option>
                            <option value="IN_PROGRESS">진행중</option>
                            <option value="COMPLETED">완료</option>
                            <option value="CLOSED">마감</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {c._count.applications}/{c.maxReviewers}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {c.pointReward.toLocaleString()}P
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(c.startDate).toLocaleDateString("ko-KR")} ~{" "}
                          {new Date(c.endDate).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(c)}
                              className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 cursor-pointer"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.title)}
                              className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
