"use client";

import { useState } from "react";

interface RankCheck {
  id: string;
  keyword: string;
  rank: number | null;
  isTop: boolean;
  checkedAt: string;
}

export default function RankCheckButton({ reviewId }: { reviewId: string }) {
  const [keyword, setKeyword] = useState("");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<RankCheck[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function loadHistory() {
    if (loaded) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/rank-check`);
      if (res.ok) {
        setResults(await res.json());
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setChecking(true);
    setError("");

    try {
      const res = await fetch(`/api/reviews/${reviewId}/rank-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "체크 실패");
      }

      const result = await res.json();
      setResults((prev) => [result, ...prev]);
      setKeyword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => {
          setShowForm(!showForm);
          loadHistory();
        }}
        className="text-xs text-red-500 hover:text-red-600 font-medium"
      >
        {showForm ? "상위노출 체크 닫기" : "🔍 상위노출 체크"}
      </button>

      {showForm && (
        <div className="mt-3 bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleCheck} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색 키워드 입력 (예: 대구 맛집)"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={checking || !keyword.trim()}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap"
            >
              {checking ? "확인중..." : "체크"}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          {results.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-gray-500">체크 이력</p>
              {results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${r.isTop ? "bg-green-500" : r.rank ? "bg-yellow-500" : "bg-gray-400"}`}
                    ></span>
                    <span className="text-sm text-gray-700">{r.keyword}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        r.isTop ? "text-green-600" : r.rank ? "text-yellow-600" : "text-gray-400"
                      }`}
                    >
                      {r.isTop
                        ? `🏆 ${r.rank}위`
                        : r.rank
                          ? `${r.rank}위`
                          : "미노출"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.checkedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
