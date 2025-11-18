/**
 * useCropInteraction Hook
 * 
 * Custom hook for managing crop area interactions including
 * drag operations, handle detection, and crop state management.
 */

import { useState, useRef, useCallback } from 'react';
import { CropArea, DragHandle } from '../types/editor.types';
import { getHandleAt, getCursorForHandle, updateCropArea } from '../utils/crop.utils';

interface UseCropInteractionProps {
  initialCropArea?: CropArea;
  onCropChange?: (crop: { x: number; y: number; width: number; height: number }) => void;
  imageWidth: number;
  imageHeight: number;
}

export function useCropInteraction({
  initialCropArea = { x: 10, y: 10, width: 80, height: 80 },
  onCropChange,
  imageWidth,
  imageHeight,
}: UseCropInteractionProps) {
  const [cropArea, setCropArea] = useState<CropArea>(initialCropArea);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPart, setDraggedPart] = useState<DragHandle>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  // Use refs for immediate access during drag operations
  const draggedPartRef = useRef<DragHandle>(null);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });

  // Update crop callback when area changes
  const updateCropCallback = useCallback(() => {
    if (onCropChange && imageWidth > 0 && imageHeight > 0) {
      const actualCrop = {
        x: Math.round((cropArea.x / 100) * imageWidth),
        y: Math.round((cropArea.y / 100) * imageHeight),
        width: Math.round((cropArea.width / 100) * imageWidth),
        height: Math.round((cropArea.height / 100) * imageHeight),
      };

      if (actualCrop.width > 10 && actualCrop.height > 10) {
        onCropChange(actualCrop);
      }
    }
  }, [cropArea, onCropChange, imageWidth, imageHeight]);

  const handleMouseDown = useCallback(
    (
      canvas: HTMLCanvasElement,
      rect: DOMRect,
      e: React.MouseEvent<HTMLCanvasElement>
    ) => {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const handle = getHandleAt(canvas, x, y, cropArea);
      setDraggedPart(handle);
      setIsDragging(true);

      // Store in ref for immediate access
      draggedPartRef.current = handle;

      if (handle === 'box') {
        const offset = { x: x - cropArea.x, y: y - cropArea.y };
        setDragStartOffset(offset);
        dragStartOffsetRef.current = offset;
      } else if (!handle) {
        setCropArea({ x, y, width: 0, height: 0 });
      }

      return { handle, x, y };
    },
    [cropArea]
  );

  const handleMouseMove = useCallback(
    (rect: DOMRect, event: MouseEvent, startX: number, startY: number) => {
      const newX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

      setCropArea((prev) =>
        updateCropArea(
          prev,
          draggedPartRef.current,
          newX,
          newY,
          startX,
          startY,
          dragStartOffsetRef.current
        )
      );
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedPart(null);
    draggedPartRef.current = null;
  }, []);

  const getCursor = useCallback(
    (canvas: HTMLCanvasElement, x: number, y: number): string => {
      const handle = getHandleAt(canvas, x, y, cropArea);
      return getCursorForHandle(handle);
    },
    [cropArea]
  );

  return {
    cropArea,
    setCropArea,
    isDragging,
    draggedPart,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getCursor,
    updateCropCallback,
  };
}
