'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  showSettings?: boolean;
  settingsHref?: string;
  onBack?: () => void;
}

export default function PageHeader({
  title,
  showSettings = false,
  settingsHref,
  onBack,
}: PageHeaderProps) {
  const router = useRouter();

  const handleSettingsClick = () => {
    if (settingsHref) {
      router.push(settingsHref);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ letterSpacing: '0.5px' }}>
          {title}
        </h1>
      </div>

      {showSettings && settingsHref && (
        <button
          onClick={handleSettingsClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="설정"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      )}
    </header>
  );
}
