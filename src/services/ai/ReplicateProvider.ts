import { AIProvider, AISettings, AIResponse } from './AIProvider';
import { CommandParser } from './CommandParser';

export class ReplicateProvider implements AIProvider {
  name = 'Replicate';
  private readonly BASE_URL = 'https://api.replicate.com/v1';

  async processCommand(command: string, imageData: string, settings: AISettings): Promise<AIResponse> {
    const startTime = Date.now();
    const intent = CommandParser.parse(command);

    try {
      // Only handle background removal for now
      if (intent.action === 'remove-background') {
        return await this.removeBackground(imageData, settings);
      }

      return {
        success: false,
        type: 'error',
        error: 'Replicate chỉ hỗ trợ xóa nền. Vui lòng thử lệnh khác.',
      };
    } catch (error) {
      return {
        success: false,
        type: 'error',
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
        processingTime: Date.now() - startTime,
      };
    }
  }

  async removeBackground(imageData: string, settings: AISettings): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Create prediction
      const prediction = await this.createPrediction(imageData, settings.apiKey);
      
      // Step 2: Poll for result
      const result = await this.pollPrediction(prediction.id, settings.apiKey);

      if (result.status === 'succeeded' && result.output) {
        return {
          success: true,
          type: 'image',
          imageUrl: result.output,
          message: 'Đã xóa nền thành công!',
          processingTime: Date.now() - startTime,
        };
      }

      return {
        success: false,
        type: 'error',
        error: result.error || 'Không thể xóa nền',
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        type: 'error',
        error: error instanceof Error ? error.message : 'Lỗi xóa nền',
        processingTime: Date.now() - startTime,
      };
    }
  }

  private async createPrediction(imageData: string, apiKey: string): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003', // RemBG model
        input: {
          image: imageData, // Base64 or URL
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.');
      }
      if (response.status === 429) {
        throw new Error('Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.');
      }
      
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Lỗi API: ${response.status}`);
    }

    return await response.json();
  }

  private async pollPrediction(predictionId: string, apiKey: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${this.BASE_URL}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Polling error: ${response.status}`);
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Timeout: Quá trình xử lý mất quá nhiều thời gian');
  }

  async testConnection(settings: AISettings): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        headers: {
          'Authorization': `Token ${settings.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
