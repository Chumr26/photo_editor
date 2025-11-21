import { toast } from 'sonner@2.0.3';

export interface ExportOptions {
  format: 'jpg' | 'png' | 'webp' | 'svg';
  quality: number; // 0-100
  scale: number; // 0.5, 1, 1.5, 2, etc.
  transparent?: boolean;
  filename?: string;
}

export interface ImageData {
  src: string;
  width: number;
  height: number;
  filename: string;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  grayscale: boolean;
  sepia: boolean;
  sharpen: number;
}

export async function exportImage(
  image: ImageData,
  adjustments: Adjustments,
  options: ExportOptions
): Promise<void> {
  try {
    // Create a temporary canvas to render the final image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Set canvas size with scale
    canvas.width = image.width * options.scale;
    canvas.height = image.height * options.scale;

    // Load and draw image with filters
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = image.src;
    });

    ctx.save();

    // Apply filters
    const filters: string[] = [];
    if (adjustments.brightness !== 0) {
      filters.push(`brightness(${1 + adjustments.brightness / 100})`);
    }
    if (adjustments.contrast !== 0) {
      filters.push(`contrast(${1 + adjustments.contrast / 100})`);
    }
    if (adjustments.saturation !== 0) {
      filters.push(`saturate(${1 + adjustments.saturation / 100})`);
    }
    if (adjustments.blur > 0) {
      filters.push(`blur(${adjustments.blur * options.scale}px)`);
    }
    if (adjustments.hue !== 0) {
      filters.push(`hue-rotate(${adjustments.hue}deg)`);
    }
    if (adjustments.grayscale) {
      filters.push('grayscale(100%)');
    }
    if (adjustments.sepia) {
      filters.push('sepia(100%)');
    }

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    // Draw scaled image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Convert to blob and download
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const finalFilename = options.filename || image.filename.replace(/\.[^/.]+$/, '');
          link.download = `${finalFilename}.${options.format}`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);

          resolve();
        },
        options.format === 'jpg' ? 'image/jpeg' : `image/${options.format}`,
        options.format === 'jpg' || options.format === 'webp' ? options.quality / 100 : undefined
      );
    });
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

export async function quickExport(
  image: ImageData,
  adjustments: Adjustments,
  defaultFormat: 'jpg' | 'png' | 'webp' | 'svg' = 'png',
  defaultQuality: number = 90
): Promise<void> {
  try {
    await exportImage(image, adjustments, {
      format: defaultFormat,
      quality: defaultQuality,
      scale: 1,
      transparent: false,
    });
    
    toast.success('Xuất ảnh thành công! / Export successful!');
  } catch (error) {
    toast.error('Xuất ảnh thất bại / Export failed');
    throw error;
  }
}
