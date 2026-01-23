'use client';

import PageHeader from '@/components/PageHeader';
import SettingsPage from '@/components/SettingsPage';

export default function SettingsPageWrapper() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="설정" />
      <div className="flex-1 overflow-y-auto">
        <SettingsPage title="설정" backHref="/" />
      </div>
    </div>
  );
}
