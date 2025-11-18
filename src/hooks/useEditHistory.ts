/**
 * useEditHistory Hook
 * 
 * Custom hook for managing edit history with undo/redo functionality.
 * Provides methods to update edits and navigate through history.
 */

import { useState, useCallback } from 'react';
import { EditValues } from '../types/editor.types';

export function useEditHistory(initialEdit: EditValues) {
  const [editHistory, setEditHistory] = useState<EditValues[]>([initialEdit]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentEdits, setCurrentEdits] = useState<EditValues>(initialEdit);

  const updateEdit = useCallback(
    (key: keyof EditValues, value: any) => {
      const newEdits = { ...currentEdits, [key]: value };
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(newEdits);

      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentEdits(newEdits);
    },
    [currentEdits, editHistory, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentEdits(editHistory[newIndex]);
    }
  }, [historyIndex, editHistory]);

  const redo = useCallback(() => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentEdits(editHistory[newIndex]);
    }
  }, [historyIndex, editHistory]);

  const resetHistory = useCallback((newEdit: EditValues) => {
    setEditHistory([newEdit]);
    setHistoryIndex(0);
    setCurrentEdits(newEdit);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < editHistory.length - 1;

  return {
    currentEdits,
    setCurrentEdits,
    editHistory,
    historyIndex,
    updateEdit,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
  };
}
