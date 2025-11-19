/**
 * Canvas Utilities
 * 
 * Helper functions for canvas operations including drawing,
 * transformations, and filter applications.
 */

import { EditValues } from '../types/editor.types';

/**
 * Apply filters to a canvas
 */
export function applyFilters(
  canvas: HTMLCanvasElement,
  edits: EditValues
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const filters: string[] = [];

  if (edits.blur > 0) filters.push(`blur(${edits.blur}px)`);
  if (edits.grayscale) filters.push('grayscale(100%)');
  if (edits.brightness !== 100) filters.push(`brightness(${edits.brightness}%)`);
  if (edits.contrast !== 100) filters.push(`contrast(${edits.contrast}%)`);

  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.filter = filters.join(' ');
      tempCtx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }
}

/**
 * Calculate dimensions for canvas based on container
 */
export function calculateCanvasDimensions(
  container: HTMLElement,
  outputWidth: number,
  outputHeight: number,
  rotation: number
): { width: number; height: number; scale: number } {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const padding = 40;

  const availableWidth = containerWidth - padding;
  const availableHeight = containerHeight - padding;

  let displayWidth = outputWidth;
  let displayHeight = outputHeight;

  if (rotation % 180 !== 0) {
    [displayWidth, displayHeight] = [displayHeight, displayWidth];
  }

  const scale = Math.min(
    availableWidth / displayWidth,
    availableHeight / displayHeight,
    1
  );

  return {
    width: Math.round(displayWidth * scale),
    height: Math.round(displayHeight * scale),
    scale,
  };
}

/**
 * Apply rotation transformation to canvas context
 */
export function applyRotation(
  ctx: CanvasRenderingContext2D,
  rotation: number,
  centerX: number,
  centerY: number
): void {
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation * Math.PI) / 180);
}

/**
 * Apply flip transformation to canvas context
 */
export function applyFlip(
  ctx: CanvasRenderingContext2D,
  flipHorizontal: boolean,
  flipVertical: boolean
): void {
  const scaleX = flipHorizontal ? -1 : 1;
  const scaleY = flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);
}
