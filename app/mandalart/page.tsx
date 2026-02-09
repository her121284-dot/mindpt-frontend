'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import {
  MandalartDraft,
  getAllMandalartDrafts,
  formatMandalartDate,
  deleteMandalartDraft,
} from '@/lib/mandalartStorage';

export default function MandalartPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<MandalartDraft[]>([]);
  const [loading, setLoading] = useState(true);

  // Load drafts from localStorage (SSR-safe)
  useEffect(() => {
    const loaded = getAllMandalartDrafts();
    setDrafts(loaded);
    setLoading(false);
  }, []);

  const handleCreate = () => {
    router.push('/mandalart/new');
  };

  const handleOpen = (id: string) => {
    router.push(`/mandalart/${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('이 만다라트를 삭제하시겠습니까?')) {
      deleteMandalartDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // Get display title
  const getDisplayTitle = (draft: MandalartDraft) => {
    if (draft.title) return draft.title;
    if (draft.centerGoal) return draft.centerGoal;
    return '새 만다라트';
  };

  // Get preview of filled goals
  const getFilledCount = (draft: MandalartDraft) => {
    let count = draft.centerGoal ? 1 : 0;
    count += draft.outerGoals.filter((g) => g.trim()).length;
    return count;
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="만다라트"
        actions={
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새로 만들기
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && drafts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                아직 만다라트가 없어요
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                목표를 시각적으로 정리하고 실행 계획을 세워보세요.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 만다라트 만들기
              </button>
            </div>
          )}

          {/* Drafts List */}
          {!loading && drafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  내 만다라트 ({drafts.length})
                </h2>
              </div>

              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleOpen(draft.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {getDisplayTitle(draft)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatMandalartDate(draft.updatedAt)}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                          {getFilledCount(draft)}/9칸 채움
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, draft.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mini Preview Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((gridIdx) => {
                      // Grid index 4 is center
                      if (gridIdx === 4) {
                        const filled = !!draft.centerGoal;
                        return (
                          <div
                            key={gridIdx}
                            className={`h-2 rounded-sm ${
                              filled
                                ? 'bg-purple-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        );
                      } else {
                        // Map grid index to outer goals index (0-7)
                        const outerIdx = gridIdx < 4 ? gridIdx : gridIdx - 1;
                        const filled = !!draft.outerGoals[outerIdx]?.trim();
                        return (
                          <div
                            key={gridIdx}
                            className={`h-2 rounded-sm ${
                              filled
                                ? 'bg-purple-300 dark:bg-purple-700'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
