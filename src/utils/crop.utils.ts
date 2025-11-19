/**
 * Crop Utilities
 * 
 * Helper functions for crop area calculations, handle detection,
 * and crop overlay rendering.
 */

import { CropArea, DragHandle } from '../types/editor.types';

/**
 * Detect which handle the mouse is over
 */
export function getHandleAt(
  canvas: HTMLCanvasElement,
  xPercent: number,
  yPercent: number,
  cropArea: CropArea
): DragHandle {
  const handleSize = 10;
  const handleMargin = 5;
  const effectiveHandleSize = handleSize + handleMargin;
  const edgeMargin = 8;

  const cropX = (cropArea.x / 100) * canvas.width;
  const cropY = (cropArea.y / 100) * canvas.height;
  const cropW = (cropArea.width / 100) * canvas.width;
  const cropH = (cropArea.height / 100) * canvas.height;

  const x = (xPercent / 100) * canvas.width;
  const y = (yPercent / 100) * canvas.height;

  // Check corners first (higher priority than edges)
  if (
    x >= cropX - effectiveHandleSize / 2 &&
    x <= cropX + effectiveHandleSize / 2 &&
    y >= cropY - effectiveHandleSize / 2 &&
    y <= cropY + effectiveHandleSize / 2
  ) return 'tl';

  if (
    x >= cropX + cropW - effectiveHandleSize / 2 &&
    x <= cropX + cropW + effectiveHandleSize / 2 &&
    y >= cropY - effectiveHandleSize / 2 &&
    y <= cropY + effectiveHandleSize / 2
  ) return 'tr';

  if (
    x >= cropX - effectiveHandleSize / 2 &&
    x <= cropX + effectiveHandleSize / 2 &&
    y >= cropY + cropH - effectiveHandleSize / 2 &&
    y <= cropY + cropH + effectiveHandleSize / 2
  ) return 'bl';

  if (
    x >= cropX + cropW - effectiveHandleSize / 2 &&
    x <= cropX + cropW + effectiveHandleSize / 2 &&
    y >= cropY + cropH - effectiveHandleSize / 2 &&
    y <= cropY + cropH + effectiveHandleSize / 2
  ) return 'br';

  // Check edges
  if (Math.abs(y - cropY) <= edgeMargin && x >= cropX && x <= cropX + cropW) return 't';
  if (Math.abs(x - (cropX + cropW)) <= edgeMargin && y >= cropY && y <= cropY + cropH) return 'r';
  if (Math.abs(y - (cropY + cropH)) <= edgeMargin && x >= cropX && x <= cropX + cropW) return 'b';
  if (Math.abs(x - cropX) <= edgeMargin && y >= cropY && y <= cropY + cropH) return 'l';

  // Check if inside box
  if (x > cropX && x < cropX + cropW && y > cropY && y < cropY + cropH) {
    return 'box';
  }

  return null;
}

/**
 * Get cursor style based on handle type
 */
export function getCursorForHandle(handle: DragHandle): string {
  if (handle === 'tl' || handle === 'br') return 'nwse-resize';
  if (handle === 'tr' || handle === 'bl') return 'nesw-resize';
  if (handle === 't' || handle === 'b') return 'ns-resize';
  if (handle === 'l' || handle === 'r') return 'ew-resize';
  if (handle === 'box') return 'move';
  return 'crosshair';
}

/**
 * Draw crop overlay on canvas
 */
export function drawCropOverlay(
  canvas: HTMLCanvasElement,
  cropArea: CropArea
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate crop rectangle position
  const cropX = (cropArea.x / 100) * canvas.width;
  const cropY = (cropArea.y / 100) * canvas.height;
  const cropW = (cropArea.width / 100) * canvas.width;
  const cropH = (cropArea.height / 100) * canvas.height;

  // Clear crop area
  ctx.clearRect(cropX, cropY, cropW, cropH);

  // Draw border
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.strokeRect(cropX, cropY, cropW, cropH);

  // Draw handles
  const handleSize = 10;
  ctx.fillStyle = '#3b82f6';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  const corners = [
    [cropX, cropY],
    [cropX + cropW, cropY],
    [cropX, cropY + cropH],
    [cropX + cropW, cropY + cropH],
  ];

  corners.forEach(([x, y]) => {
    ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
  });
}

/**
 * Update crop area based on drag operation
 */
export function updateCropArea(
  currentArea: CropArea,
  draggedPart: DragHandle,
  newX: number,
  newY: number,
  startX: number,
  startY: number,
  dragStartOffset: { x: number; y: number }
): CropArea {
  let { x: prevX, y: prevY, width: prevW, height: prevH } = currentArea;

  switch (draggedPart) {
    case 'tl':
      prevW += prevX - newX;
      prevH += prevY - newY;
      prevX = newX;
      prevY = newY;
      break;
    case 'tr':
      prevW = newX - prevX;
      prevH += prevY - newY;
      prevY = newY;
      break;
    case 'bl':
      prevW += prevX - newX;
      prevH = newY - prevY;
      prevX = newX;
      break;
    case 'br':
      prevW = newX - prevX;
      prevH = newY - prevY;
      break;
    case 't':
      prevH += prevY - newY;
      prevY = newY;
      break;
    case 'r':
      prevW = newX - prevX;
      break;
    case 'b':
      prevH = newY - prevY;
      break;
    case 'l':
      prevW += prevX - newX;
      prevX = newX;
      break;
    case 'box':
      prevX = newX - dragStartOffset.x;
      prevY = newY - dragStartOffset.y;
      break;
    default:
      return {
        x: Math.min(startX, newX),
        y: Math.min(startY, newY),
        width: Math.abs(newX - startX),
        height: Math.abs(newY - startY),
      };
  }

  // Handle negative dimensions
  if (prevW < 0) {
    prevX += prevW;
    prevW = Math.abs(prevW);
  }
  if (prevH < 0) {
    prevY += prevH;
    prevH = Math.abs(prevH);
  }

  // Clamp to canvas bounds
  prevX = Math.max(0, Math.min(100 - prevW, prevX));
  prevY = Math.max(0, Math.min(100 - prevH, prevY));

  return { x: prevX, y: prevY, width: prevW, height: prevH };
}
