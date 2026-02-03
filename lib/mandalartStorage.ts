// Mandalart Storage Utility (localStorage-based)

export interface MandalartDraft {
  id: string;
  title: string;
  centerGoal: string;
  outerGoals: string[]; // 8 outer goals (sub-goals)
  actions: string[][]; // 8 x 8 action items (each sub-goal has 8 actions)
  updatedAt: number;
  createdAt: number;
}

// Create empty actions array (8 sub-goals × 8 actions each)
export function createEmptyActions(): string[][] {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ''));
}

// Migrate old draft to include actions
function migrateDraft(draft: Partial<MandalartDraft>): MandalartDraft {
  return {
    id: draft.id || generateMandalartId(),
    title: draft.title || '',
    centerGoal: draft.centerGoal || '',
    outerGoals: draft.outerGoals || ['', '', '', '', '', '', '', ''],
    actions: draft.actions || createEmptyActions(),
    updatedAt: draft.updatedAt || Date.now(),
    createdAt: draft.createdAt || Date.now(),
  };
}

const INDEX_KEY = 'mandalart:index';
const DRAFT_KEY_PREFIX = 'mandalart:';

// Generate unique ID
export function generateMandalartId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Get all mandalart IDs
export function getMandalartIds(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(INDEX_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save mandalart IDs index
function saveMandalartIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

// Get a single mandalart draft (with migration support)
export function getMandalartDraft(id: string): MandalartDraft | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    // Migrate old drafts that don't have actions
    return migrateDraft(parsed);
  } catch {
    return null;
  }
}

// Get all mandalart drafts
export function getAllMandalartDrafts(): MandalartDraft[] {
  const ids = getMandalartIds();
  const drafts: MandalartDraft[] = [];
  for (const id of ids) {
    const draft = getMandalartDraft(id);
    if (draft) {
      drafts.push(draft);
    }
  }
  // Sort by updatedAt (most recent first)
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
}

// Create a new mandalart draft
export function createMandalartDraft(title?: string): MandalartDraft {
  const now = Date.now();
  const draft: MandalartDraft = {
    id: generateMandalartId(),
    title: title || '',
    centerGoal: '',
    outerGoals: ['', '', '', '', '', '', '', ''],
    actions: createEmptyActions(),
    updatedAt: now,
    createdAt: now,
  };

  // Save to localStorage
  saveMandalartDraft(draft);

  // Add to index
  const ids = getMandalartIds();
  ids.unshift(draft.id);
  saveMandalartIds(ids);

  return draft;
}

// Save/update a mandalart draft
export function saveMandalartDraft(draft: MandalartDraft): void {
  if (typeof window === 'undefined') return;
  draft.updatedAt = Date.now();
  localStorage.setItem(`${DRAFT_KEY_PREFIX}${draft.id}`, JSON.stringify(draft));
}

// Delete a mandalart draft
export function deleteMandalartDraft(id: string): void {
  if (typeof window === 'undefined') return;

  // Remove from storage
  localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`);

  // Remove from index
  const ids = getMandalartIds();
  const newIds = ids.filter((i) => i !== id);
  saveMandalartIds(newIds);
}

// Format date for display
export function formatMandalartDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
