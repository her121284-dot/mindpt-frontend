/**
 * Tutor Types - Shared type definitions for tutor feature
 */

/**
 * Understanding level for lesson completion
 * Used to personalize homework based on self-assessed comprehension
 *
 * - understood: Can recall without explanation
 * - partial: Would understand if reviewed again
 * - not_yet: Needs more practice
 */
export type Understanding = 'understood' | 'partial' | 'not_yet';

/**
 * Block type for cumulative rendering in tutor page
 * Each block represents a rendered piece of content that stacks in the UI
 */
export type TutorBlockType = 'render_block' | 'explain';

/**
 * A single block of content in the tutor lesson flow
 * Blocks are accumulated as the user progresses through the lesson
 */
export interface TutorBlock {
  /** Unique identifier for the block (e.g., "render_block:0", "explain:1") */
  id: string;
  /** Type of block determines styling and behavior */
  type: TutorBlockType;
  /** 0-based index of the paragraph this block is associated with */
  blockIndex: number;
  /** The rendered text content */
  text: string;
  /** Whether this block is currently loading */
  isLoading?: boolean;
}
