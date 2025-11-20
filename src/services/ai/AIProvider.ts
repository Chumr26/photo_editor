// Base interface for all AI providers
export interface AIProvider {
  name: string;
  processCommand(command: string, imageData: string, settings: AISettings): Promise<AIResponse>;
  testConnection(settings: AISettings): Promise<boolean>;
}

export interface AISettings {
  provider: 'openai' | 'anthropic' | 'replicate' | 'stability' | 'custom';
  apiKey: string;
  model?: string;
  customEndpoint?: string;
}

export interface AIResponse {
  success: boolean;
  type: 'image' | 'edits' | 'error';
  // For image responses (background removal, style transfer)
  imageData?: string;
  imageUrl?: string;
  // For edit suggestions (adjustments, filters)
  edits?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    exposure?: number;
    temperature?: number;
    tint?: number;
    highlightTint?: number;
    shadowTint?: number;
    highlightTintSaturation?: number;
    shadowTintSaturation?: number;
    blur?: number;
    sharpen?: number;
    vignette?: number;
    grain?: number;
    // Crop suggestions
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
    cropAspectRatio?: string;
  };
  // Response metadata
  message?: string;
  error?: string;
  processingTime?: number;
  cost?: number;
}

export interface CommandIntent {
  action: 'remove-background' | 'enhance' | 'adjust-color' | 'crop' | 'filter' | 'remove-object' | 'style-transfer' | 'unknown';
  target?: string; // e.g., "background", "person", "car"
  parameters?: {
    style?: string;
    intensity?: number;
    color?: string;
    amount?: number;
  };
  confidence: number; // 0-1 confidence score
}
