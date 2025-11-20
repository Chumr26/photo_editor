/**
 * useEditHistory Hook
 * 
 * Custom hook for managing edit history with undo/redo functionality.
 * Provides methods to update edits and navigate through history.
 */

import { useState, useCallback } from 'react';
import { EditValues } from '../App';

export interface UseEditHistoryReturn {
  history: EditValues[];
  currentIndex: number;
  currentEdits: EditValues;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (edits: EditValues) => void;
  updateCurrent: <K extends keyof EditValues>(key: K, value: EditValues[K]) => void;
  undo: () => void;
  redo: () => void;
  reset: (initialEdits: EditValues) => void;
  jumpToIndex: (index: number) => void;
}

export function useEditHistory(initialEdits: EditValues): UseEditHistoryReturn {
  const [history, setHistory] = useState<EditValues[]>([initialEdits]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentEdits = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback((edits: EditValues) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(edits);
      return newHistory;
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const updateCurrent = useCallback(<K extends keyof EditValues>(key: K, value: EditValues[K]) => {
    const newEdits = { ...currentEdits, [key]: value };
    addToHistory(newEdits);
  }, [currentEdits, addToHistory]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canRedo]);

  const reset = useCallback((initialEdits: EditValues) => {
    setHistory([initialEdits]);
    setCurrentIndex(0);
  }, []);

  const jumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
    }
  }, [history.length]);

  return {
    history,
    currentIndex,
    currentEdits,
    canUndo,
    canRedo,
    addToHistory,
    updateCurrent,
    undo,
    redo,
    reset,
    jumpToIndex,
  };
}
