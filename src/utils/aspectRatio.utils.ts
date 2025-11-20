/**
 * Aspect Ratio Utilities
 * 
 * Helper functions for aspect ratio calculations, constraints,
 * and preset ratio management.
 */

export interface AspectRatio {
  width: number;
  height: number;
}

export interface AspectRatioPreset {
  id: string;
  label: string;
  ratio: AspectRatio;
  category: 'square' | 'landscape' | 'portrait';
}

/**
 * Common aspect ratio presets
 */
export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  // Square
  { id: '1:1', label: '1:1', ratio: { width: 1, height: 1 }, category: 'square' },
  
  // Landscape
  { id: '16:9', label: '16:9', ratio: { width: 16, height: 9 }, category: 'landscape' },
  { id: '4:3', label: '4:3', ratio: { width: 4, height: 3 }, category: 'landscape' },
  { id: '3:2', label: '3:2', ratio: { width: 3, height: 2 }, category: 'landscape' },
  { id: '21:9', label: '21:9', ratio: { width: 21, height: 9 }, category: 'landscape' },
  
  // Portrait
  { id: '9:16', label: '9:16', ratio: { width: 9, height: 16 }, category: 'portrait' },
  { id: '4:5', label: '4:5', ratio: { width: 4, height: 5 }, category: 'portrait' },
  { id: '2:3', label: '2:3', ratio: { width: 2, height: 3 }, category: 'portrait' },
];

/**
 * Calculate aspect ratio from dimensions
 */
export function getAspectRatioFromDimensions(
  width: number,
  height: number
): AspectRatio {
  return { width, height };
}

/**
 * Simplify aspect ratio to smallest whole numbers
 * e.g., 1920:1080 -> 16:9
 */
export function simplifyRatio(width: number, height: number): AspectRatio {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.abs(width), Math.abs(height));
  return {
    width: width / divisor,
    height: height / divisor,
  };
}

/**
 * Get decimal representation of aspect ratio
 * e.g., 16:9 -> 1.78
 */
export function getRatioDecimal(ratio: AspectRatio): number {
  return ratio.width / ratio.height;
}

/**
 * Format ratio as string
 * e.g., { width: 16, height: 9 } -> "16:9"
 */
export function formatRatio(ratio: AspectRatio): string {
  return `${ratio.width}:${ratio.height}`;
}

/**
 * Check if two ratios are approximately equal within tolerance
 */
export function isApproximatelyRatio(
  currentRatio: AspectRatio,
  targetRatio: AspectRatio,
  tolerance: number = 0.02
): boolean {
  const currentDecimal = getRatioDecimal(currentRatio);
  const targetDecimal = getRatioDecimal(targetRatio);
  return Math.abs(currentDecimal - targetDecimal) <= tolerance;
}

/**
 * Calculate constrained dimensions based on aspect ratio
 * anchor: which corner/edge to keep fixed when applying constraint
 */
export function calculateConstrainedDimensions(
  width: number,
  height: number,
  ratio: AspectRatio,
  anchor: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l' = 'br'
): { width: number; height: number } {
  const targetRatio = getRatioDecimal(ratio);
  const currentRatio = width / height;

  let newWidth = width;
  let newHeight = height;

  // Adjust dimensions to match target ratio
  if (Math.abs(currentRatio - targetRatio) > 0.001) {
    // Determine which dimension to adjust based on anchor
    const isCorner = ['tl', 'tr', 'bl', 'br'].includes(anchor);
    
    if (isCorner) {
      // For corners, maintain the diagonal direction
      if (currentRatio > targetRatio) {
        // Current is too wide, reduce width
        newWidth = height * targetRatio;
      } else {
        // Current is too tall, reduce height
        newHeight = width / targetRatio;
      }
    } else {
      // For edges, adjust the opposite dimension
      if (anchor === 't' || anchor === 'b') {
        // Vertical edge: adjust width
        newWidth = height * targetRatio;
      } else {
        // Horizontal edge: adjust height
        newHeight = width / targetRatio;
      }
    }
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Apply aspect ratio constraint to crop area dimensions
 * Returns constrained dimensions
 */
export function applyAspectRatioConstraint(
  cropWidth: number,
  cropHeight: number,
  ratio: AspectRatio,
  dragHandle: string
): { width: number; height: number } {
  return calculateConstrainedDimensions(
    cropWidth,
    cropHeight,
    ratio,
    dragHandle as any
  );
}

/**
 * Detect which preset ratio matches current dimensions
 * Returns null if no match within tolerance
 */
export function detectPresetRatio(
  width: number,
  height: number,
  tolerance: number = 0.05
): AspectRatioPreset | null {
  const currentRatio = simplifyRatio(width, height);
  
  for (const preset of ASPECT_RATIO_PRESETS) {
    if (isApproximatelyRatio(currentRatio, preset.ratio, tolerance)) {
      return preset;
    }
  }
  
  return null;
}

/**
 * Flip aspect ratio orientation
 * e.g., 16:9 -> 9:16
 */
export function flipRatioOrientation(ratio: AspectRatio): AspectRatio {
  return {
    width: ratio.height,
    height: ratio.width,
  };
}

/**
 * Apply new aspect ratio to existing crop area
 * adjustmentMode: how to apply the new ratio to existing crop
 */
export function applyCropRatio(
  cropArea: { x: number; y: number; width: number; height: number },
  ratio: AspectRatio,
  adjustmentMode: 'center' | 'top-left' | 'maintain-width' | 'maintain-height' = 'center'
): { x: number; y: number; width: number; height: number } {
  const targetRatio = getRatioDecimal(ratio);
  let newWidth = cropArea.width;
  let newHeight = cropArea.height;
  let newX = cropArea.x;
  let newY = cropArea.y;

  switch (adjustmentMode) {
    case 'maintain-width':
      newHeight = newWidth / targetRatio;
      break;
      
    case 'maintain-height':
      newWidth = newHeight * targetRatio;
      break;
      
    case 'center':
      // Maintain the larger dimension
      if (cropArea.width / cropArea.height > targetRatio) {
        // Current is wider, maintain height
        newWidth = newHeight * targetRatio;
        newX = cropArea.x + (cropArea.width - newWidth) / 2;
      } else {
        // Current is taller, maintain width
        newHeight = newWidth / targetRatio;
        newY = cropArea.y + (cropArea.height - newHeight) / 2;
      }
      break;
      
    case 'top-left':
      // Keep top-left corner fixed
      if (cropArea.width / cropArea.height > targetRatio) {
        newWidth = newHeight * targetRatio;
      } else {
        newHeight = newWidth / targetRatio;
      }
      break;
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  };
}

/**
 * Load saved aspect ratio preferences from localStorage
 */
export function loadRatioPreferences(): {
  lastUsedRatio: AspectRatio | null;
  isLocked: boolean;
  customRatios: AspectRatio[];
} {
  try {
    const saved = localStorage.getItem('aspectRatioPreferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load aspect ratio preferences:', error);
  }
  
  return {
    lastUsedRatio: null,
    isLocked: false,
    customRatios: [],
  };
}

/**
 * Save aspect ratio preferences to localStorage
 */
export function saveRatioPreferences(preferences: {
  lastUsedRatio: AspectRatio | null;
  isLocked: boolean;
  customRatios: AspectRatio[];
}): void {
  try {
    localStorage.setItem('aspectRatioPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save aspect ratio preferences:', error);
  }
}
