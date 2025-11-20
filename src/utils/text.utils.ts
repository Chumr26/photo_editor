import { TextOverlay } from '../App';

export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate the bounding box of a text overlay
 * @param text - The text overlay object
 * @param ctx - Canvas rendering context for text measurement
 * @param scale - Scale factor for overlay rendering (from canvas to image pixels)
 * @returns Bounding box in canvas pixels
 */
export function calculateTextBounds(
  text: TextOverlay,
  ctx: CanvasRenderingContext2D,
  scale: number
): TextBounds {
  // Set font properties for measurement
  const fontSize = text.fontSize * scale;
  ctx.font = `${text.fontStyle} ${text.fontWeight} ${fontSize}px ${text.fontFamily}`;
  
  // Measure text
  const metrics = ctx.measureText(text.text);
  const width = metrics.width;
  
  // Approximate height based on font size
  // More accurate would be: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const height = fontSize * 1.2; // 1.2 line height multiplier
  
  // Calculate position based on text alignment
  let x = text.x * scale;
  const y = text.y * scale;
  
  // Adjust x position based on text alignment
  if (text.textAlign === 'center') {
    x -= width / 2;
  } else if (text.textAlign === 'right') {
    x -= width;
  }
  
  return {
    x,
    y,
    width,
    height,
  };
}

/**
 * Calculate the bounding box corners of a rotated text
 * @param bounds - The text bounding box
 * @param rotation - Rotation angle in degrees
 * @returns Array of 4 corner points [topLeft, topRight, bottomRight, bottomLeft]
 */
export function getRotatedBoundingBoxCorners(
  bounds: TextBounds,
  rotation: number
): Point[] {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  
  // Convert rotation to radians
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  // Define corners relative to center
  const corners = [
    { x: -bounds.width / 2, y: -bounds.height / 2 }, // Top-left
    { x: bounds.width / 2, y: -bounds.height / 2 },  // Top-right
    { x: bounds.width / 2, y: bounds.height / 2 },   // Bottom-right
    { x: -bounds.width / 2, y: bounds.height / 2 },  // Bottom-left
  ];
  
  // Rotate corners and translate back to world coordinates
  return corners.map(corner => ({
    x: centerX + corner.x * cos - corner.y * sin,
    y: centerY + corner.x * sin + corner.y * cos,
  }));
}

/**
 * Check if a point is inside a rotated rectangle
 * @param point - The point to test (in canvas pixels)
 * @param bounds - The rectangle bounding box
 * @param rotation - Rotation angle in degrees
 * @returns True if point is inside the rotated rectangle
 */
export function isPointInRotatedRect(
  point: Point,
  bounds: TextBounds,
  rotation: number
): boolean {
  // If no rotation, simple AABB test
  if (rotation === 0) {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }
  
  // For rotated rectangle, transform the point to the rectangle's local space
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  
  // Translate point to rectangle's center
  const translatedX = point.x - centerX;
  const translatedY = point.y - centerY;
  
  // Rotate point back (inverse rotation)
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  const localX = translatedX * cos - translatedY * sin;
  const localY = translatedX * sin + translatedY * cos;
  
  // Check if point is inside the unrotated rectangle
  return (
    Math.abs(localX) <= bounds.width / 2 &&
    Math.abs(localY) <= bounds.height / 2
  );
}

/**
 * Find which text overlay (if any) is at the given point
 * @param point - The point to test (in canvas pixels)
 * @param texts - Array of text overlays
 * @param ctx - Canvas rendering context for text measurement
 * @param scale - Scale factor for overlay rendering
 * @returns The ID of the text at the point, or null if none
 */
export function getTextAtPoint(
  point: Point,
  texts: TextOverlay[],
  ctx: CanvasRenderingContext2D,
  scale: number
): string | null {
  // Iterate in reverse order to prioritize top-most (last drawn) texts
  for (let i = texts.length - 1; i >= 0; i--) {
    const text = texts[i];
    const bounds = calculateTextBounds(text, ctx, scale);
    
    if (isPointInRotatedRect(point, bounds, text.rotation)) {
      return text.id;
    }
  }
  
  return null;
}

/**
 * Calculate the outer bounding box that contains a rotated rectangle
 * @param bounds - The text bounding box
 * @param rotation - Rotation angle in degrees
 * @returns Axis-aligned bounding box that contains the rotated rectangle
 */
export function getRotatedBoundingBoxAABB(
  bounds: TextBounds,
  rotation: number
): TextBounds {
  if (rotation === 0) {
    return bounds;
  }
  
  const corners = getRotatedBoundingBoxCorners(bounds, rotation);
  
  const xs = corners.map(c => c.x);
  const ys = corners.map(c => c.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Transform a point from canvas coordinates to local text coordinates
 * @param point - Point in canvas coordinates
 * @param text - Text overlay object
 * @param bounds - Text bounding box in canvas coordinates
 * @returns Point in local text coordinates
 */
export function canvasToLocalCoords(
  point: Point,
  text: TextOverlay,
  bounds: TextBounds
): Point {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  
  // Translate to center
  const translatedX = point.x - centerX;
  const translatedY = point.y - centerY;
  
  // Rotate back
  const rad = (-text.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  return {
    x: translatedX * cos - translatedY * sin,
    y: translatedX * sin + translatedY * cos,
  };
}

/**
 * Transform a point from local text coordinates to canvas coordinates
 * @param point - Point in local text coordinates
 * @param text - Text overlay object
 * @param bounds - Text bounding box in canvas coordinates
 * @returns Point in canvas coordinates
 */
export function localToCanvasCoords(
  point: Point,
  text: TextOverlay,
  bounds: TextBounds
): Point {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  
  // Rotate
  const rad = (text.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  const rotatedX = point.x * cos - point.y * sin;
  const rotatedY = point.x * sin + point.y * cos;
  
  // Translate back
  return {
    x: rotatedX + centerX,
    y: rotatedY + centerY,
  };
}
