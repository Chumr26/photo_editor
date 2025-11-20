/**
 * Crop Utilities
 * 
 * Helper functions for crop area calculations, handle detection,
 * and crop overlay rendering.
 * 
 * COORDINATE SYSTEMS:
 * - Canvas Pixel: Actual pixel position on the HTML canvas element (0 to canvas.width/height)
 * - Canvas Percentage: Percentage position on canvas (0-100%)
 * - Image Pixel: Actual pixel position in the source image (0 to image.width/height)
 * - Display Bounds: The actual bounds where the image is displayed on canvas (accounting for scaling and centering)
 */

import { CropArea, DragHandle } from '../types/editor.types';

/**
 * Calculate the display bounds of an image on canvas
 * Returns the actual pixel bounds where the image is drawn on the canvas
 */
export function calculateImageDisplayBounds(
  canvas: HTMLCanvasElement,
  imageWidth: number,
  imageHeight: number,
  imageTransform?: { x: number; y: number; scale: number }
): { x: number; y: number; width: number; height: number } {
  const transform = imageTransform || { x: 0, y: 0, scale: 1 };
  
  // Calculate base display size (fit to canvas with margin)
  const aspectRatio = imageWidth / imageHeight;
  let baseWidth = canvas.width * 0.8;
  let baseHeight = canvas.height * 0.8;
  
  if (baseWidth / baseHeight > aspectRatio) {
    baseWidth = baseHeight * aspectRatio;
  } else {
    baseHeight = baseWidth / aspectRatio;
  }

  // Apply user scale
  const finalWidth = baseWidth * transform.scale;
  const finalHeight = baseHeight * transform.scale;
  
  // Calculate position (center + offset)
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const x = centerX + (transform.x * canvas.width / 100) - finalWidth / 2;
  const y = centerY + (transform.y * canvas.height / 100) - finalHeight / 2;

  return { x, y, width: finalWidth, height: finalHeight };
}

/**
 * Convert crop area from canvas percentage to image pixel coordinates
 */
export function cropPercentToImagePixels(
  cropPercent: CropArea,
  canvas: HTMLCanvasElement,
  imageWidth: number,
  imageHeight: number,
  imageTransform?: { x: number; y: number; scale: number }
): { x: number; y: number; width: number; height: number } {
  const displayBounds = calculateImageDisplayBounds(canvas, imageWidth, imageHeight, imageTransform);
  
  // Convert canvas percentage to canvas pixels
  const cropCanvasX = (cropPercent.x / 100) * canvas.width;
  const cropCanvasY = (cropPercent.y / 100) * canvas.height;
  const cropCanvasW = (cropPercent.width / 100) * canvas.width;
  const cropCanvasH = (cropPercent.height / 100) * canvas.height;
  
  // Convert canvas pixels to image pixels
  // Calculate relative position within the displayed image
  const relativeX = cropCanvasX - displayBounds.x;
  const relativeY = cropCanvasY - displayBounds.y;
  
  // Scale to original image dimensions
  const scaleX = imageWidth / displayBounds.width;
  const scaleY = imageHeight / displayBounds.height;
  
  const imageX = Math.max(0, Math.round(relativeX * scaleX));
  const imageY = Math.max(0, Math.round(relativeY * scaleY));
  const imageW = Math.min(imageWidth - imageX, Math.round(cropCanvasW * scaleX));
  const imageH = Math.min(imageHeight - imageY, Math.round(cropCanvasH * scaleY));
  
  return {
    x: imageX,
    y: imageY,
    width: imageW,
    height: imageH
  };
}

/**
 * Convert crop area from image pixel coordinates to canvas percentage
 */
export function cropImagePixelsToPercent(
  cropPixels: { x: number; y: number; width: number; height: number },
  canvas: HTMLCanvasElement,
  imageWidth: number,
  imageHeight: number,
  imageTransform?: { x: number; y: number; scale: number }
): CropArea {
  const displayBounds = calculateImageDisplayBounds(canvas, imageWidth, imageHeight, imageTransform);
  
  // Calculate scale from image to display
  const scaleX = displayBounds.width / imageWidth;
  const scaleY = displayBounds.height / imageHeight;
  
  // Convert image pixels to canvas pixels
  const canvasX = displayBounds.x + (cropPixels.x * scaleX);
  const canvasY = displayBounds.y + (cropPixels.y * scaleY);
  const canvasW = cropPixels.width * scaleX;
  const canvasH = cropPixels.height * scaleY;
  
  // Convert canvas pixels to percentage
  return {
    x: (canvasX / canvas.width) * 100,
    y: (canvasY / canvas.height) * 100,
    width: (canvasW / canvas.width) * 100,
    height: (canvasH / canvas.height) * 100
  };
}

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
