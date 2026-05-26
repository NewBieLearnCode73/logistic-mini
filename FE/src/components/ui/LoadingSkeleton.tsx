interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function LoadingSkeleton({ rows = 5, columns = 4 }: LoadingSkeletonProps) {
  return (
    <div className="w-full animate-pulse">
      {/* Table header skeleton */}
      <div className="flex border-b border-gray-200 py-3 dark:border-gray-800">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="flex-1 px-3">
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      
      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex border-b border-gray-100 py-3 last:border-0 dark:border-gray-800"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1 px-3">
              <div className="h-4.5 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-800 mb-2" />
        <div className="h-8.5 w-full rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div>
        <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800 mb-2" />
        <div className="h-8.5 w-full rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div>
        <div className="h-3 w-1/5 rounded bg-gray-200 dark:bg-gray-800 mb-2" />
        <div className="h-20 w-full rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <div className="h-8.5 w-20 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-8.5 w-24 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
