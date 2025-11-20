import { CommandIntent } from './AIProvider';

// Parse natural language commands into structured intents
export class CommandParser {
  // Vietnamese → English keyword mapping
  private static readonly KEYWORD_MAP = {
    // Background removal
    'xóa nền': 'remove-background',
    'loại bỏ nền': 'remove-background',
    'xoá phông': 'remove-background',
    'bỏ nền': 'remove-background',
    'nền trong suốt': 'remove-background',
    'làm nền trong suốt': 'remove-background',
    'remove background': 'remove-background',
    'transparent background': 'remove-background',
    'cut out': 'remove-background',

    // Enhancement
    'cải thiện': 'enhance',
    'làm đẹp': 'enhance',
    'tối ưu': 'enhance',
    'làm sáng': 'enhance',
    'enhance': 'enhance',
    'improve': 'enhance',
    'beautify': 'enhance',
    'make better': 'enhance',
    'optimize': 'enhance',

    // Color adjustments
    'sáng hơn': 'brightness-up',
    'tối hơn': 'brightness-down',
    'brighter': 'brightness-up',
    'darker': 'brightness-down',
    'tăng độ sáng': 'brightness-up',
    'giảm độ sáng': 'brightness-down',
    
    'tương phản': 'contrast',
    'contrast': 'contrast',
    'tăng tương phản': 'contrast-up',
    'more contrast': 'contrast-up',

    'màu sắc': 'saturation',
    'độ bão hòa': 'saturation',
    'saturation': 'saturation',
    'vibrant': 'saturation-up',
    'colorful': 'saturation-up',
    'rực rỡ': 'saturation-up',

    // Filters
    'vintage': 'filter-vintage',
    'cổ điển': 'filter-vintage',
    'retro': 'filter-vintage',
    'hiệu ứng vintage': 'filter-vintage',
    'thêm hiệu ứng vintage': 'filter-vintage',
    'bw': 'filter-bw',
    'black and white': 'filter-bw',
    'trắng đen': 'filter-bw',
    'sepia': 'filter-sepia',
    'nâu': 'filter-sepia',

    // Crop
    'cắt': 'crop',
    'crop': 'crop',
    'trim': 'crop',
    'vuông': 'crop-square',
    'square': 'crop-square',
    'portrait': 'crop-portrait',
    'chân dung': 'crop-portrait',
    '16:9': 'crop-16-9',
    'cắt ảnh theo tỷ lệ 16:9': 'crop-16-9',

    // Blur/Sharpen
    'làm mờ': 'blur',
    'blur': 'blur',
    'nét hơn': 'sharpen',
    'sắc nét': 'sharpen',
    'sharpen': 'sharpen',
    'sharp': 'sharpen',
  };

  /**
   * Parse a natural language command into a structured intent
   */
  static parse(command: string): CommandIntent {
    const normalized = command.toLowerCase().trim();

    // Check for background removal
    if (this.matchesKeywords(normalized, ['xóa nền', 'loại bỏ nền', 'xoá phông', 'bỏ nền', 'nền trong suốt', 'làm nền trong suốt', 'remove background', 'transparent', 'cut out'])) {
      return {
        action: 'remove-background',
        confidence: 0.95,
      };
    }

    // Check for enhancement (including brightness + contrast combo)
    if (this.matchesKeywords(normalized, ['cải thiện', 'làm đẹp', 'tối ưu', 'enhance', 'improve', 'beautify', 'make better', 'optimize']) ||
        (this.matchesKeywords(normalized, ['làm sáng', 'sáng']) && this.matchesKeywords(normalized, ['tương phản', 'contrast']))) {
      return {
        action: 'enhance',
        confidence: 0.9,
      };
    }

    // Check for color adjustments
    const colorAdjustment = this.parseColorAdjustment(normalized);
    if (colorAdjustment) {
      return colorAdjustment;
    }

    // Check for filters
    const filter = this.parseFilter(normalized);
    if (filter) {
      return filter;
    }

    // Check for crop
    if (this.matchesKeywords(normalized, ['cắt', 'crop', 'trim'])) {
      return {
        action: 'crop',
        parameters: this.parseCropParameters(normalized),
        confidence: 0.85,
      };
    }

    // Unknown command
    return {
      action: 'unknown',
      confidence: 0,
    };
  }

  private static matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private static parseColorAdjustment(text: string): CommandIntent | null {
    // Brightness
    if (this.matchesKeywords(text, ['sáng hơn', 'brighter', 'tăng độ sáng', 'lighten'])) {
      return {
        action: 'adjust-color',
        parameters: { amount: this.extractAmount(text, 20) },
        confidence: 0.9,
      };
    }
    if (this.matchesKeywords(text, ['tối hơn', 'darker', 'giảm độ sáng', 'darken'])) {
      return {
        action: 'adjust-color',
        parameters: { amount: this.extractAmount(text, -20) },
        confidence: 0.9,
      };
    }

    // Contrast
    if (this.matchesKeywords(text, ['tương phản', 'contrast', 'tăng tương phản', 'more contrast'])) {
      return {
        action: 'adjust-color',
        parameters: { amount: this.extractAmount(text, 15) },
        confidence: 0.85,
      };
    }

    // Saturation
    if (this.matchesKeywords(text, ['màu sắc', 'độ bão hòa', 'saturation', 'vibrant', 'colorful', 'rực rỡ'])) {
      return {
        action: 'adjust-color',
        parameters: { amount: this.extractAmount(text, 15) },
        confidence: 0.85,
      };
    }

    return null;
  }

  private static parseFilter(text: string): CommandIntent | null {
    if (this.matchesKeywords(text, ['vintage', 'cổ điển', 'retro', 'hiệu ứng vintage', 'thêm hiệu ứng vintage'])) {
      return {
        action: 'filter',
        parameters: { style: 'vintage' },
        confidence: 0.9,
      };
    }
    if (this.matchesKeywords(text, ['bw', 'black and white', 'trắng đen', '흑백'])) {
      return {
        action: 'filter',
        parameters: { style: 'bw' },
        confidence: 0.9,
      };
    }
    if (this.matchesKeywords(text, ['sepia', 'nâu'])) {
      return {
        action: 'filter',
        parameters: { style: 'sepia' },
        confidence: 0.9,
      };
    }
    return null;
  }

  private static parseCropParameters(text: string): any {
    const params: any = {};
    
    if (this.matchesKeywords(text, ['vuông', 'square'])) {
      params.aspectRatio = '1:1';
    } else if (this.matchesKeywords(text, ['portrait', 'chân dung'])) {
      params.aspectRatio = '3:4';
    } else if (this.matchesKeywords(text, ['landscape', 'phong cảnh', '16:9', 'cắt ảnh theo tỷ lệ 16:9'])) {
      params.aspectRatio = '16:9';
    }

    return params;
  }

  private static extractAmount(text: string, defaultAmount: number): number {
    // Try to extract numeric amount from text
    const match = text.match(/(\d+)%?/);
    if (match) {
      const value = parseInt(match[1], 10);
      // If percentage-like, scale it appropriately
      return value > 100 ? value / 10 : value;
    }
    return defaultAmount;
  }

  /**
   * Get a human-readable description of the intent
   */
  static describeIntent(intent: CommandIntent): string {
    switch (intent.action) {
      case 'remove-background':
        return 'Xóa nền ảnh';
      case 'enhance':
        return 'Cải thiện ảnh tự động';
      case 'adjust-color':
        return 'Điều chỉnh màu sắc';
      case 'crop':
        return 'Cắt ảnh';
      case 'filter':
        return `Áp dụng bộ lọc ${intent.parameters?.style || ''}`;
      case 'remove-object':
        return 'Xóa đối tượng';
      case 'style-transfer':
        return 'Chuyển đổi phong cách';
      default:
        return 'Không nhận diện được lệnh';
    }
  }
}
