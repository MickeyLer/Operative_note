'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DraftData {
  savedAt: string;
  selectedOpKey: string;
  formData: any;
  checklist: any[];
  activeTab: string;
}

export function useOperativeDraft(noteId?: string) {
  const draftKey = noteId ? `op_note_draft_${noteId}` : 'op_note_draft_new';
  const [existingDraft, setExistingDraft] = useState<DraftData | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Check for existing draft on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed: DraftData = JSON.parse(saved);
        if (parsed && (parsed.formData || (parsed.checklist && parsed.checklist.length > 0))) {
          setExistingDraft(parsed);
          setLastSavedTime(parsed.savedAt);
        }
      }
    } catch (err) {
      console.error('Failed to load draft from localStorage:', err);
    }
  }, [draftKey]);

  // Save draft to localStorage
  const saveDraft = useCallback((data: { selectedOpKey: string; formData: any; checklist: any[]; activeTab: string }) => {
    if (typeof window === 'undefined') return;
    try {
      const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const draftObj: DraftData = {
        ...data,
        savedAt: now
      };
      localStorage.setItem(draftKey, JSON.stringify(draftObj));
      setLastSavedTime(now);
    } catch (err) {
      console.error('Failed to save draft to localStorage:', err);
    }
  }, [draftKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(draftKey);
      setExistingDraft(null);
      setLastSavedTime(null);
    } catch (err) {
      console.error('Failed to clear draft from localStorage:', err);
    }
  }, [draftKey]);

  return {
    draftKey,
    existingDraft,
    setExistingDraft,
    lastSavedTime,
    saveDraft,
    clearDraft
  };
}
