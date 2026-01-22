'use client';

interface AdSlotProps {
  className?: string;
}

export default function AdSlot({ className = '' }: AdSlotProps) {
  return (
    <div
      className={`w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-center h-16 text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider font-medium">광고 영역</p>
          <p className="text-xs mt-1">AD SLOT</p>
        </div>
      </div>
    </div>
  );
}
