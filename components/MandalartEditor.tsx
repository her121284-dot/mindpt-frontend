'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { MandalartDraft, saveMandalartDraft, createEmptyActions } from '@/lib/mandalartStorage';

interface MandalartEditorProps {
  draft: MandalartDraft;
  onUpdate?: (draft: MandalartDraft) => void;
}

type ViewMode = '9' | '81';

// Cell type for overlay modal editing
interface ActiveCell {
  type: 'center' | 'outer' | 'action';
  outerIndex?: number;     // For outer goals (0-7)
  actionIndex?: number;    // For actions within outer goal (0-7)
  label: string;
}

// Index mapping for 8 directions (clockwise from top-left)
// Position in 3x3: (0,0)=0, (0,1)=1, (0,2)=2, (1,0)=3, (1,2)=4, (2,0)=5, (2,1)=6, (2,2)=7
const LOCAL_TO_INDEX: Record<string, number> = {
  '0,0': 0, '0,1': 1, '0,2': 2,
  '1,0': 3,           '1,2': 4,
  '2,0': 5, '2,1': 6, '2,2': 7,
};

// Block position to outerGoal index (same mapping)
const BLOCK_TO_INDEX: Record<string, number> = {
  '0,0': 0, '0,1': 1, '0,2': 2,
  '1,0': 3,           '1,2': 4,
  '2,0': 5, '2,1': 6, '2,2': 7,
};

export default function MandalartEditor({ draft, onUpdate }: MandalartEditorProps) {
  const [title, setTitle] = useState(draft.title);
  const [centerGoal, setCenterGoal] = useState(draft.centerGoal);
  const [outerGoals, setOuterGoals] = useState<string[]>(draft.outerGoals);
  const [actions, setActions] = useState<string[][]>(draft.actions || createEmptyActions());
  const [viewMode, setViewMode] = useState<ViewMode>('9');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'downloaded' | 'error' | 'copyFailed'>('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Set default view mode based on screen width
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth >= 768) {
        setViewMode('81');
      } else {
        setViewMode('9');
      }
    };
    checkWidth();
    // Don't add resize listener - let user control after initial load
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    (updatedDraft: MandalartDraft) => {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveMandalartDraft(updatedDraft);
        setSaveStatus('saved');
        onUpdate?.(updatedDraft);
        setTimeout(() => setSaveStatus('idle'), 1500);
      }, 300);
    },
    [onUpdate]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ESC key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCell) {
          setActiveCell(null);
        } else if (showShareModal) {
          setShowShareModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showShareModal, activeCell]);

  // Create updated draft helper
  const createUpdatedDraft = (updates: Partial<MandalartDraft>): MandalartDraft => ({
    ...draft,
    title,
    centerGoal,
    outerGoals,
    actions,
    ...updates,
  });

  // Force save function
  const handleForceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const updatedDraft = createUpdatedDraft({});
    saveMandalartDraft(updatedDraft);
    setSaveStatus('saved');
    onUpdate?.(updatedDraft);
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  // Generate PNG from grid
  const generatePng = async (): Promise<string | null> => {
    if (!gridRef.current) return null;
    try {
      return await toPng(gridRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
    } catch (error) {
      console.error('PNG generation failed:', error);
      return null;
    }
  };

  // Copy image to clipboard
  const handleCopyToClipboard = async () => {
    setShareStatus('copying');
    const dataUrl = await generatePng();
    if (!dataUrl) {
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 2000);
      return;
    }
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setShareStatus('copied');
        setTimeout(() => {
          setShareStatus('idle');
          setShowShareModal(false);
        }, 1500);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      setShareStatus('copyFailed');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  // Download PNG file
  const handleDownloadPng = async () => {
    setShareStatus('copying');
    const dataUrl = await generatePng();
    if (!dataUrl) {
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 2000);
      return;
    }
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const link = document.createElement('a');
    link.download = `mandalart_${draft.id.slice(0, 8)}_${timestamp}.png`;
    link.href = dataUrl;
    link.click();
    setShareStatus('downloaded');
    setTimeout(() => {
      setShareStatus('idle');
      setShowShareModal(false);
    }, 1500);
  };

  // Change handlers
  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedSave(createUpdatedDraft({ title: value }));
  };

  const handleCenterChange = (value: string) => {
    setCenterGoal(value);
    debouncedSave(createUpdatedDraft({ centerGoal: value }));
  };

  const handleOuterChange = (index: number, value: string) => {
    const newOuter = [...outerGoals];
    newOuter[index] = value;
    setOuterGoals(newOuter);
    debouncedSave(createUpdatedDraft({ outerGoals: newOuter }));
  };

  const handleActionChange = (goalIndex: number, actionIndex: number, value: string) => {
    const newActions = actions.map((arr, i) =>
      i === goalIndex ? arr.map((v, j) => j === actionIndex ? value : v) : [...arr]
    );
    setActions(newActions);
    debouncedSave(createUpdatedDraft({ actions: newActions }));
  };

  // ===== 9-cell Grid (original) =====
  const render9CellGrid = () => {
    const cells: { type: 'center' | 'outer'; index?: number }[] = [];
    let outerIdx = 0;
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        cells.push({ type: 'center' });
      } else {
        cells.push({ type: 'outer', index: outerIdx });
        outerIdx++;
      }
    }

    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 pt-2">
        {cells.map((cell, idx) => {
          if (cell.type === 'center') {
            return (
              <div key={idx} className="aspect-square relative">
                <div className="absolute left-2 top-1.5 sm:left-3 sm:top-2 z-10">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                    핵심 목표
                  </span>
                </div>
                <textarea
                  value={centerGoal}
                  onChange={(e) => handleCenterChange(e.target.value)}
                  placeholder="한 문장으로"
                  className="w-full h-full pt-5 sm:pt-6 px-2 pb-2 sm:px-3 sm:pb-3 text-sm sm:text-base font-bold text-center rounded-xl border-2 border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100 placeholder-violet-300 dark:placeholder-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
            );
          } else {
            const outerIndex = cell.index!;
            return (
              <div key={idx} className="aspect-square relative">
                <div className="absolute left-2 top-1.5 sm:left-3 sm:top-2 z-10">
                  <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {outerIndex + 1}
                  </span>
                </div>
                <textarea
                  value={outerGoals[outerIndex]}
                  onChange={(e) => handleOuterChange(outerIndex, e.target.value)}
                  placeholder="세부 목표"
                  className="w-full h-full pt-5 sm:pt-6 px-2 pb-2 sm:px-3 sm:pb-3 text-xs sm:text-sm text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            );
          }
        })}
      </div>
    );
  };

  // ===== Render single cell for 81-cell grid =====
  const renderCell = (blockR: number, blockC: number, localR: number, localC: number) => {
    const isCenter = blockR === 1 && blockC === 1;
    const isLocalCenter = localR === 1 && localC === 1;
    const blockKey = `${blockR},${blockC}`;
    const localKey = `${localR},${localC}`;

    if (isCenter) {
      // Center block (3x3): centerGoal + outerGoals
      if (isLocalCenter) {
        // Center of center block: centerGoal (DARKEST - violet-100)
        return (
          <div
            key={`${localR}-${localC}`}
            className="relative cursor-pointer group"
            onClick={() => setActiveCell({ type: 'center', label: '핵심 목표' })}
          >
            <div className="absolute left-1 top-0.5 z-20">
              <span className="text-[8px] font-semibold text-violet-700 dark:text-violet-300">핵심</span>
            </div>
            <div className="w-full h-full min-h-[60px] pt-4 px-1 pb-1 text-[10px] sm:text-xs font-bold text-center rounded-lg border-2 border-violet-500 dark:border-violet-400 bg-violet-100 dark:bg-violet-800/50 text-violet-900 dark:text-violet-100 flex items-center justify-center group-hover:ring-2 group-hover:ring-violet-500 transition-all">
              <span className="line-clamp-3 break-words">{centerGoal || '클릭하여 입력'}</span>
            </div>
          </div>
        );
      } else {
        // Surrounding cells of center block: outerGoals (MEDIUM - violet-50)
        const outerIndex = LOCAL_TO_INDEX[localKey];
        return (
          <div
            key={`${localR}-${localC}`}
            className="relative cursor-pointer group"
            onClick={() => setActiveCell({ type: 'outer', outerIndex, label: `세부 목표 ${outerIndex + 1}` })}
          >
            <div className="absolute left-1 top-0.5 z-20">
              <span className="text-[8px] font-medium text-violet-600 dark:text-violet-400">{outerIndex + 1}</span>
            </div>
            <div className="w-full h-full min-h-[60px] pt-4 px-1 pb-1 text-[10px] sm:text-xs font-medium text-center rounded-lg border border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 flex items-center justify-center group-hover:ring-2 group-hover:ring-violet-400 transition-all">
              <span className="line-clamp-3 break-words">{outerGoals[outerIndex] || '클릭하여 입력'}</span>
            </div>
          </div>
        );
      }
    } else {
      // Outer blocks: outerGoal (center, readonly display) + actions (editable)
      const blockIndex = BLOCK_TO_INDEX[blockKey];

      if (isLocalCenter) {
        // Center of outer block: display outerGoal (MEDIUM - same as center block outer goals)
        return (
          <div
            key={`${localR}-${localC}`}
            className="relative cursor-pointer group"
            onClick={() => setActiveCell({ type: 'outer', outerIndex: blockIndex, label: `세부 목표 ${blockIndex + 1}` })}
          >
            <div className="absolute left-1 top-0.5 z-20">
              <span className="text-[8px] font-semibold text-violet-600 dark:text-violet-400">{blockIndex + 1}</span>
            </div>
            <div className="w-full h-full min-h-[60px] pt-4 px-1 pb-1 text-[10px] sm:text-xs font-semibold text-center rounded-lg border-2 border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 flex items-center justify-center group-hover:ring-2 group-hover:ring-violet-400 transition-all">
              <span className="line-clamp-3 break-words">{outerGoals[blockIndex] || `목표 ${blockIndex + 1}`}</span>
            </div>
          </div>
        );
      } else {
        // Surrounding cells of outer block: actions (LIGHTEST - neutral tone)
        const actionIndex = LOCAL_TO_INDEX[localKey];
        return (
          <div
            key={`${localR}-${localC}`}
            className="relative cursor-pointer group"
            onClick={() => setActiveCell({ type: 'action', outerIndex: blockIndex, actionIndex, label: `${outerGoals[blockIndex] || `목표${blockIndex + 1}`} → 실행 ${actionIndex + 1}` })}
          >
            <div className="w-full h-full min-h-[60px] px-1 py-1 text-[9px] sm:text-[10px] text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center group-hover:ring-2 group-hover:ring-purple-400 group-hover:border-purple-300 transition-all">
              <span className="line-clamp-3 break-words">{actions[blockIndex]?.[actionIndex] || ''}</span>
            </div>
          </div>
        );
      }
    }
  };

  // ===== Render a 3x3 block =====
  const renderBlock = (blockR: number, blockC: number) => {
    const isCenter = blockR === 1 && blockC === 1;
    const cells = [];
    for (let localR = 0; localR < 3; localR++) {
      for (let localC = 0; localC < 3; localC++) {
        cells.push(renderCell(blockR, blockC, localR, localC));
      }
    }

    // Center block gets the arrow overlay
    if (isCenter) {
      return (
        <div key={`block-${blockR}-${blockC}`} className="relative border-2 border-violet-300 dark:border-violet-600 rounded-lg overflow-hidden">
          {/* Ribbon Arrow Overlay - inside center 3x3 block only */}
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrowHeadCenter3x3"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(139, 92, 246, 0.3)" />
              </marker>
            </defs>

            {/* Ribbon-style: thick semi-transparent curves */}
            <g
              fill="none"
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowHeadCenter3x3)"
            >
              <path d="M 50 50 Q 40 40 18 18" />
              <path d="M 50 50 Q 50 35 50 18" />
              <path d="M 50 50 Q 60 40 82 18" />
              <path d="M 50 50 Q 35 50 18 50" />
              <path d="M 50 50 Q 65 50 82 50" />
              <path d="M 50 50 Q 40 60 18 82" />
              <path d="M 50 50 Q 50 65 50 82" />
              <path d="M 50 50 Q 60 60 82 82" />
            </g>
          </svg>
          <div className="grid grid-cols-3 gap-0.5 p-0.5 relative z-10">
            {cells}
          </div>
        </div>
      );
    }

    // Outer blocks - no arrow overlay
    return (
      <div key={`block-${blockR}-${blockC}`} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {cells}
        </div>
      </div>
    );
  };

  // ===== 81-cell Grid (9 blocks of 3x3) =====
  const render81CellGrid = () => {
    const blocks = [];
    for (let blockR = 0; blockR < 3; blockR++) {
      for (let blockC = 0; blockC < 3; blockC++) {
        blocks.push(renderBlock(blockR, blockC));
      }
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-3">
        {blocks}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header: Title + View Toggle + Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목 (선택)"
          className="flex-1 min-w-0 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setViewMode('9')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              viewMode === '9'
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            9칸
          </button>
          <button
            onClick={() => setViewMode('81')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              viewMode === '81'
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            81칸
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleForceSave}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          title="저장"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span className="hidden sm:inline">저장</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
          title="이미지로 공유"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden sm:inline">공유</span>
        </button>
      </div>

      {/* Save Status Indicator */}
      <div className="flex items-center justify-end h-5">
        {saveStatus === 'saving' && (
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            저장 중...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-500 dark:text-green-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            저장됨
          </span>
        )}
      </div>

      {/* Export Container (includes header + grid) */}
      <div ref={gridRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Export Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {title || centerGoal || '나의 만다라트'}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Grid */}
        {viewMode === '9' ? render9CellGrid() : render81CellGrid()}
      </div>

      {/* Guide Text */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {viewMode === '9'
            ? '중앙에 핵심 목표를 적고, 주변에 세부 목표 8개를 채워보세요'
            : '81칸 전체를 채워 구체적인 실행 계획을 세워보세요'}
        </p>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              만다라트 공유
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {viewMode === '9' ? '9칸' : '81칸'} 만다라트를 이미지로 저장하거나 복사하세요.
            </p>

            <div className="space-y-3 mb-5">
              <button
                onClick={handleCopyToClipboard}
                disabled={shareStatus === 'copying'}
                className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-colors ${
                  shareStatus === 'copyFailed'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white'
                }`}
              >
                {shareStatus === 'copying' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : shareStatus === 'copied' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    복사됨! Ctrl+V로 붙여넣기
                  </>
                ) : shareStatus === 'copyFailed' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    복사 제한됨 - 다운로드 이용
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    이미지 복사 (PC 권장)
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={shareStatus === 'copying'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
              >
                {shareStatus === 'downloaded' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    다운로드됨!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PNG 다운로드
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <p><strong>PC:</strong> 복사 후 카페 글쓰기에서 Ctrl+V로 붙여넣기</p>
              <p><strong>모바일:</strong> 복사 제한될 수 있음 → PNG 다운로드 후 업로드</p>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {shareStatus === 'error' && (
              <p className="mt-3 text-sm text-red-500 text-center">
                이미지 생성에 실패했습니다. 다시 시도해주세요.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cell Edit Overlay Modal */}
      {activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActiveCell(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 max-w-md w-full shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeCell.label}
              </h3>
              <button
                onClick={() => setActiveCell(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              autoFocus
              value={
                activeCell.type === 'center'
                  ? centerGoal
                  : activeCell.type === 'outer'
                  ? outerGoals[activeCell.outerIndex!]
                  : actions[activeCell.outerIndex!]?.[activeCell.actionIndex!] || ''
              }
              onChange={(e) => {
                if (activeCell.type === 'center') {
                  handleCenterChange(e.target.value);
                } else if (activeCell.type === 'outer') {
                  handleOuterChange(activeCell.outerIndex!, e.target.value);
                } else {
                  handleActionChange(activeCell.outerIndex!, activeCell.actionIndex!, e.target.value);
                }
              }}
              placeholder={
                activeCell.type === 'center'
                  ? '핵심 목표를 입력하세요'
                  : activeCell.type === 'outer'
                  ? '세부 목표를 입력하세요'
                  : '실행 항목을 입력하세요'
              }
              className={`w-full h-32 p-4 text-base rounded-xl border-2 resize-none focus:outline-none focus:ring-2 transition-all ${
                activeCell.type === 'center'
                  ? 'border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100 placeholder-violet-400 focus:ring-violet-500'
                  : activeCell.type === 'outer'
                  ? 'border-violet-300 dark:border-violet-600 bg-violet-50/50 dark:bg-violet-900/20 text-violet-800 dark:text-violet-200 placeholder-violet-400 focus:ring-violet-400'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-purple-500'
              }`}
            />

            {/* Tips */}
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {activeCell.type === 'center'
                ? '💡 핵심 목표는 한 문장으로 명확하게 적어보세요'
                : activeCell.type === 'outer'
                ? '💡 핵심 목표를 이루기 위한 세부 영역을 정해보세요'
                : '💡 구체적이고 실행 가능한 행동을 적어보세요'}
            </p>

            {/* Footer */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveCell(null)}
                className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
