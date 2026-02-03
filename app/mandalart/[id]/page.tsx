'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import MandalartEditor from '@/components/MandalartEditor';
import {
  MandalartDraft,
  getMandalartDraft,
  deleteMandalartDraft,
} from '@/lib/mandalartStorage';

export default function MandalartEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [draft, setDraft] = useState<MandalartDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load draft from localStorage (SSR-safe)
  useEffect(() => {
    const loaded = getMandalartDraft(id);
    if (!loaded) {
      // Draft not found - redirect to list
      router.replace('/mandalart');
      return;
    }
    setDraft(loaded);
    setLoading(false);
  }, [id, router]);

  const handleDelete = () => {
    if (draft) {
      deleteMandalartDraft(draft.id);
      router.push('/mandalart');
    }
  };

  const handleUpdate = (updatedDraft: MandalartDraft) => {
    setDraft(updatedDraft);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="만다라트 편집"
        onBack={() => router.push('/mandalart')}
        actions={
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="삭제"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-screen-sm mx-auto">
          <MandalartEditor draft={draft} onUpdate={handleUpdate} />

          {/* Back to List Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/mandalart')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            >
              ← 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              만다라트 삭제
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              이 만다라트를 삭제하시겠습니까? 삭제된 내용은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
