export default function ApplicationsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="flex gap-2 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
