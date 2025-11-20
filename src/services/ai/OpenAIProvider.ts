import { AIProvider, AISettings, AIResponse } from './AIProvider';
import { CommandParser } from './CommandParser';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private readonly BASE_URL = 'https://api.openai.com/v1';

  async processCommand(command: string, imageData: string, settings: AISettings): Promise<AIResponse> {
    const startTime = Date.now();
    const intent = CommandParser.parse(command);

    try {
      // Use GPT-4 Vision to analyze and suggest edits
      if (intent.action === 'enhance' || intent.action === 'adjust-color' || intent.action === 'filter') {
        return await this.analyzeAndSuggestEdits(command, imageData, settings, intent);
      }

      return {
        success: false,
        type: 'error',
        error: 'OpenAI hiện chỉ hỗ trợ phân tích và đề xuất chỉnh sửa.',
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

  async analyzeAndSuggestEdits(command: string, imageData: string, settings: AISettings, intent?: any): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a professional photo editor. Analyze images and suggest specific numeric adjustments for brightness, contrast, saturation, etc. Respond in JSON format with numeric values only.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `User request: "${command}"\n\nAnalyze this image and suggest specific numeric adjustments. Respond in this exact JSON format:\n{\n  "brightness": <number from -100 to 100>,\n  "contrast": <number from -100 to 100>,\n  "saturation": <number from -100 to 100>,\n  "explanation": "<brief explanation in Vietnamese>"\n}\n\nOnly suggest adjustments that are needed. Use 0 for no change.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key OpenAI không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.');
        }
        if (response.status === 429) {
          throw new Error('Đã vượt quá giới hạn yêu cầu OpenAI. Vui lòng thử lại sau.');
        }
        if (response.status === 400) {
          throw new Error('Yêu cầu không hợp lệ. Vui lòng thử lại với ảnh khác.');
        }
        
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Lỗi API: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không thể phân tích phản hồi từ AI');
      }

      const suggestions = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        type: 'edits',
        edits: {
          brightness: suggestions.brightness || 0,
          contrast: suggestions.contrast || 0,
          saturation: suggestions.saturation || 0,
        },
        message: suggestions.explanation || 'Đã phân tích và đề xuất chỉnh sửa',
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        type: 'error',
        error: error instanceof Error ? error.message : 'Lỗi phân tích ảnh',
        processingTime: Date.now() - startTime,
      };
    }
  }

  async testConnection(settings: AISettings): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
