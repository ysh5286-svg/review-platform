export default function CampaignsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 검색바 스켈레톤 */}
      <div className="h-12 bg-gray-200 rounded-xl mb-5 animate-pulse" />

      {/* 필터 스켈레톤 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
