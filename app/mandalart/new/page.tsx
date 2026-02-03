'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createMandalartDraft } from '@/lib/mandalartStorage';

export default function NewMandalartPage() {
  const router = useRouter();

  useEffect(() => {
    // Create a new draft and redirect to edit page
    const draft = createMandalartDraft();
    router.replace(`/mandalart/${draft.id}`);
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">새 만다라트를 만들고 있어요...</p>
      </div>
    </div>
  );
}
