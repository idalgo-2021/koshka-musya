import AnimatedCard from "./AnimatedCard";

export default function AssignmentSkeleton() {
  return (
    <AnimatedCard delay={0.2} direction="up">
      <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden animate-pulse">
      <div className="relative">
        {/* Hotel Image Skeleton */}
        <div className="h-32 bg-gray-200"></div>

        {/* Hotel Header Skeleton */}
        <div className="px-5 pt-4 pb-2">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        </div>

        {/* Hotel Description Skeleton */}
        <div className="px-5 pb-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-5"></div>

        {/* Information Panel Skeleton */}
        <div className="px-5 py-4">
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex space-x-3">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
    </AnimatedCard>
  );
}
