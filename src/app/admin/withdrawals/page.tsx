"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Withdrawal {
  id: string;
  amount: number;
  tax: number;
  netAmount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
  user: { name: string | null; email: string | null };
}

const WD_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "거절", className: "bg-red-100 text-red-700" },
};

const FEE = 500;
const TAX_RATE = 0.033;
const DEPOSIT_LABEL = "다즐피플"; // 입금통장표시

export default function AdminWithdrawalsPage() {
  const { data: session } = useSession();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("ALL");
  const [settlementDay1, setSettlementDay1] = useState("5");
  const [settlementDay2, setSettlementDay2] = useState("20");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetch("/api/admin/withdrawals")
      .then((r) => r.json())
      .then((data) => setWithdrawals(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, status: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: status === "REJECTED" ? rejectNote[id] || "" : undefined,
        }),
      });
      if (res.ok) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status, adminNote: rejectNote[id] || w.adminNote, processedAt: new Date().toISOString() } : w))
        );
      }
    } catch {}
  }

  const filtered = filter === "ALL" ? withdrawals : withdrawals.filter((w) => w.status === filter);

  // 일괄 처리
  const pendingFiltered = filtered.filter((w) => w.status === "PENDING");
  const allPendingSelected = pendingFiltered.length > 0 && pendingFiltered.every((w) => selectedIds.has(w.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingFiltered.map((w) => w.id)));
    }
  }

  async function handleBulkAction(status: "APPROVED" | "REJECTED") {
    if (selectedIds.size === 0) return;
    const label = status === "APPROVED" ? "승인" : "거절";
    if (!confirm(`선택한 ${selectedIds.size}건을 일괄 ${label} 하시겠습니까?`)) return;
    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/withdrawals/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      setWithdrawals((prev) =>
        prev.map((w) =>
          selectedIds.has(w.id) ? { ...w, status, processedAt: new Date().toISOString() } : w
        )
      );
      setSelectedIds(new Set());
    } catch {
      alert("일괄 처리 중 오류가 발생했습니다.");
    } finally {
      setBulkProcessing(false);
    }
  }

  // 엑셀(CSV) 다운로드 - 입금은행/계좌번호/입금액/예금주/입금통장표시
  function downloadExcel() {
    const pendingOrApproved = filtered.filter((w) => w.status === "PENDING" || w.status === "APPROVED");
    if (pendingOrApproved.length === 0) {
      alert("다운로드할 출금 데이터가 없습니다.");
      return;
    }

    const BOM = "\uFEFF";
    const header = "입금은행,계좌번호,입금액,예금주,입금통장표시\n";
    const rows = pendingOrApproved.map((w) => {
      const net = w.netAmount || w.amount - Math.floor(w.amount * TAX_RATE) - FEE;
      return `${w.bankName},${w.bankAccount},${net},${w.accountHolder},${DEPOSIT_LABEL}`;
    }).join("\n");

    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    a.download = `출금정산_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 통계
  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "PENDING").length,
    approved: withdrawals.filter((w) => w.status === "APPROVED").length,
    rejected: withdrawals.filter((w) => w.status === "REJECTED").length,
    pendingAmount: withdrawals.filter((w) => w.status === "PENDING").reduce((s, w) => s + (w.netAmount || w.amount - Math.floor(w.amount * TAX_RATE) - FEE), 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">출금 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            ⚙️ 정산 설정
          </button>
          <button
            onClick={downloadExcel}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
          >
            📥 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 정산 일정 설정 */}
      {showSettings && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">정산 일정 설정</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1차 정산일 (1~15일 신청분)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">매월</span>
                <input
                  type="number"
                  value={settlementDay1}
                  onChange={(e) => setSettlementDay1(e.target.value)}
                  min={1}
                  max={28}
                  className="w-20 px-3 py-2 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-500">일</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2차 정산일 (16~말일 신청분)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">익월</span>
                <input
                  type="number"
                  value={settlementDay2}
                  onChange={(e) => setSettlementDay2(e.target.value)}
                  min={1}
                  max={28}
                  className="w-20 px-3 py-2 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-500">일</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-sky-50 rounded-lg">
            <p className="text-sm text-sky-700">
              현재 정산 일정: 1~15일 신청 → 당월 <strong>{settlementDay1}일</strong> 정산 / 16~말일 신청 → 익월 <strong>{settlementDay2}일</strong> 정산
            </p>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">전체</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600">대기중</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-xs text-yellow-500 mt-1">{stats.pendingAmount.toLocaleString()}원</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">승인</p>
          <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-600">거절</p>
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[
          { key: "ALL", label: "전체" },
          { key: "PENDING", label: "대기중" },
          { key: "APPROVED", label: "승인" },
          { key: "REJECTED", label: "거절" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filter === tab.key ? "bg-red-500 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 일괄 처리 바 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-sky-800">{selectedIds.size}건 선택됨</span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkAction("APPROVED")}
              disabled={bulkProcessing}
              className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {bulkProcessing ? "처리중..." : "일괄 승인"}
            </button>
            <button
              onClick={() => handleBulkAction("REJECTED")}
              disabled={bulkProcessing}
              className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {bulkProcessing ? "처리중..." : "일괄 거절"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-1.5 bg-white text-gray-600 text-sm rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩중...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">출금 요청이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        onChange={toggleSelectAll}
                        disabled={pendingFiltered.length === 0}
                        className="w-4 h-4 accent-red-500 cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">신청자</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">입금은행</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">계좌번호</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">예금주</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">신청액</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">수수료</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">소득세</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">입금액</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((wd) => {
                    const tax = wd.tax || Math.floor(wd.amount * TAX_RATE);
                    const net = wd.netAmount || wd.amount - tax - FEE;
                    return (
                      <tr key={wd.id} className={`hover:bg-gray-50 ${selectedIds.has(wd.id) ? "bg-sky-50" : ""}`}>
                        <td className="px-3 py-3">
                          {wd.status === "PENDING" ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(wd.id)}
                              onChange={() => toggleSelect(wd.id)}
                              className="w-4 h-4 accent-red-500 cursor-pointer"
                            />
                          ) : (
                            <span className="block w-4" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(wd.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{wd.user.name || "-"}</p>
                          <p className="text-xs text-gray-400">{wd.user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{wd.bankName}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-xs">{wd.bankAccount}</td>
                        <td className="px-4 py-3 text-gray-700">{wd.accountHolder}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{wd.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-500 text-xs">-{FEE.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-500 text-xs">-{tax.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">{net.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${WD_STATUS[wd.status]?.className || "bg-gray-100"}`}>
                            {WD_STATUS[wd.status]?.label || wd.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {wd.status === "PENDING" ? (
                            <div className="space-y-2">
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  onClick={() => handleAction(wd.id, "APPROVED")}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 cursor-pointer"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleAction(wd.id, "REJECTED")}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 cursor-pointer"
                                >
                                  거절
                                </button>
                              </div>
                              <input
                                type="text"
                                value={rejectNote[wd.id] || ""}
                                onChange={(e) => setRejectNote({ ...rejectNote, [wd.id]: e.target.value })}
                                placeholder="거절 사유"
                                className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                          ) : (
                            <div className="text-center">
                              {wd.processedAt && (
                                <p className="text-xs text-gray-400">{new Date(wd.processedAt).toLocaleDateString("ko-KR")}</p>
                              )}
                              {wd.adminNote && <p className="text-xs text-gray-400">{wd.adminNote}</p>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
