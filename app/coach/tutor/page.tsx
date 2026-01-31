'use client';

import { Suspense } from 'react';
import TutorShell from '@/components/tutor/TutorShell';

export default function TutorPage() {
  return (
    <Suspense fallback={<TutorPageLoading />}>
      <TutorShell />
    </Suspense>
  );
}

function TutorPageLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
    </div>
  );
}
