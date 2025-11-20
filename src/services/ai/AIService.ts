import { AIProvider, AISettings, AIResponse, CommandIntent } from './AIProvider';
import { CommandParser } from './CommandParser';
import { ReplicateProvider } from './ReplicateProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class AIService {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    // Register available providers
    this.providers.set('replicate', new ReplicateProvider());
    this.providers.set('openai', new OpenAIProvider());
    // Add more providers here as implemented
  }

  /**
   * Process a natural language command using the configured AI provider
   */
  async processCommand(
    command: string,
    imageData: string,
    settings: AISettings
  ): Promise<AIResponse> {
    // Parse the command first
    const intent = CommandParser.parse(command);

    if (intent.confidence < 0.5) {
      return {
        success: false,
        type: 'error',
        error: `Không hiểu lệnh: "${command}". Vui lòng thử lại với lệnh rõ ràng hơn.`,
      };
    }

    // Validate settings
    if (!settings.apiKey) {
      return {
        success: false,
        type: 'error',
        error: 'Vui lòng cấu hình API key trong phần Cài đặt',
      };
    }

    // Get the appropriate provider
    const provider = this.getProviderForIntent(intent, settings);

    if (!provider) {
      return {
        success: false,
        type: 'error',
        error: `Provider ${settings.provider} không hỗ trợ hành động: ${intent.action}`,
      };
    }

    // Optimize image before sending to API
    const optimizedImage = await this.optimizeImage(imageData);

    // Process with provider
    return await provider.processCommand(command, optimizedImage, settings);
  }

  /**
   * Select the best provider for a given intent
   */
  private getProviderForIntent(intent: CommandIntent, settings: AISettings): AIProvider | null {
    // User has selected a specific provider
    if (settings.provider !== 'custom') {
      const provider = this.providers.get(settings.provider);
      return provider || null;
    }

    // Auto-select best provider based on intent
    switch (intent.action) {
      case 'remove-background':
        return this.providers.get('replicate') || null;
      case 'enhance':
      case 'adjust-color':
        return this.providers.get('openai') || null;
      default:
        return null;
    }
  }

  /**
   * Optimize image before sending to AI API
   * Reduces size and quality to save bandwidth and costs
   */
  private async optimizeImage(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Max dimension 2048px
        const maxSize = 2048;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 85% quality JPEG
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      img.onerror = () => {
        // If optimization fails, return original
        resolve(imageData);
      };

      img.src = imageData;
    });
  }

  /**
   * Test connection to AI provider
   */
  async testConnection(settings: AISettings): Promise<boolean> {
    const provider = this.providers.get(settings.provider);
    if (!provider) {
      return false;
    }
    return await provider.testConnection(settings);
  }

  /**
   * Parse a command and return the intent
   */
  parseCommand(command: string): CommandIntent {
    return CommandParser.parse(command);
  }

  /**
   * Get a human-readable description of what a command will do
   */
  describeCommand(command: string): string {
    const intent = CommandParser.parse(command);
    return CommandParser.describeIntent(intent);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
export const aiService = new AIService();
