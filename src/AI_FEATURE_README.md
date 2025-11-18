# AI-Powered Editing Feature - Integration Guide

## Overview

The image editor now includes an AI Assistant that allows users to describe edits in natural language. The AI will interpret commands and apply intelligent image transformations.

## Features Implemented

### 1. **AI Chat Panel** (`/components/AIChatPanel.tsx`)
- Beautiful chat interface with message history
- User and AI message bubbles with timestamps
- Suggested quick prompts for common tasks
- Real-time typing indicator
- Chat history management (clear function)
- Settings access button
- Configuration status badge
- Vietnamese interface

**Suggested Prompts Include:**
- ✨ Làm nền trong suốt (Make background transparent)
- 🎨 Thay đổi màu nền thành xanh dương (Change background to blue)
- 🌟 Làm sáng và tăng độ tương phản (Brighten and increase contrast)
- 🖼️ Loại bỏ vật thể không mong muốn (Remove unwanted objects)
- 👤 Xóa nền chỉ giữ người (Remove background, keep person only)
- 🎭 Thêm hiệu ứng vintage (Add vintage effect)
- 📐 Tự động cắt và căn giữa đối tượng chính (Auto crop and center main subject)
- ✂️ Cắt ảnh theo tỷ lệ 16:9 (Crop to 16:9 aspect ratio)

### 2. **AI Settings Modal** (`/components/AISettingsModal.tsx`)
Comprehensive configuration interface with:

**Supported AI Providers:**
- 🟢 **OpenAI** - GPT-4 Vision & DALL-E
- 🟠 **Anthropic Claude** - Claude 3 Vision
- 🟣 **Replicate** - Open-source models (SDXL, ControlNet, RemBG)
- 🔵 **Stability AI** - Stable Diffusion
- ⚙️ **Custom API** - Your own endpoint

**Features:**
- Provider selection with descriptions
- API key management (password-protected input)
- Model selection dropdown
- Custom endpoint configuration
- Connection test button
- Comprehensive setup guides for each provider
- Code examples and documentation links

### 3. **Tabbed Interface Integration**
- Seamlessly integrated into editor sidebar
- Two tabs: "Công cụ" (Manual Tools) and "AI Assistant"
- Sparkles icon for AI tab
- Easy switching between manual and AI editing

### 4. **Persistent Settings**
- AI settings saved to browser localStorage
- Settings persist across sessions
- Secure client-side storage

## How to Use (For End Users)

### Getting Started:
1. Upload an image to the editor
2. Click on the "AI Assistant" tab in the right sidebar
3. If not configured, click the settings icon ⚙️
4. Choose an AI provider and enter your API key
5. Save settings
6. Start chatting with the AI!

### Example Commands:
```
"Làm nền trong suốt"
"Remove the person from the background"
"Make the image brighter"
"Add a blur effect"
"Resize to 1920x1080"
"Apply vintage filter"
```

## Integration Instructions (For Developers)

### TODO: Implement AI API Integration

The AI command handler is located in `/components/EditorScreen.tsx` in the `handleAICommand` function. You need to implement the actual AI API calls here.

```typescript
const handleAICommand = async (command: string) => {
  console.log('AI Command:', command);
  console.log('AI Settings:', aiSettings);
  
  // TODO: Replace this with actual AI API integration
  // Example implementations below:
  
  // For OpenAI:
  if (aiSettings.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiSettings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiSettings.model,
        messages: [
          {
            role: 'system',
            content: 'You are an image editing assistant. Convert user commands into image editing parameters.'
          },
          {
            role: 'user',
            content: command
          }
        ],
      }),
    });
    const result = await response.json();
    // Parse AI response and apply edits
  }
  
  // For Replicate (e.g., background removal):
  if (aiSettings.provider === 'replicate' && command.includes('nền')) {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${aiSettings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003', // rembg model
        input: {
          image: imageState.original,
        },
      }),
    });
    const prediction = await response.json();
    // Poll for result and apply
  }
};
```

### Recommended AI Providers for Image Editing:

#### 1. **Replicate** (Recommended for beginners)
- Best for: Background removal, style transfer, image generation
- Models: RemBG, SDXL, ControlNet
- Free tier: Limited credits
- Setup: https://replicate.com

```bash
# Install SDK
npm install replicate

# Example usage
import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const output = await replicate.run(
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
  { input: { image: imageDataURL } }
);
```

#### 2. **OpenAI GPT-4 Vision**
- Best for: Understanding user intent, complex editing instructions
- Use Case: Parse natural language commands into editing parameters
- API: https://platform.openai.com/docs/guides/vision

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What edits should I apply to this image based on: ' + userCommand },
          { type: 'image_url', image_url: { url: imageDataURL } }
        ]
      }
    ],
    max_tokens: 300,
  }),
});
```

#### 3. **Stability AI**
- Best for: Image generation, inpainting, style transfer
- Models: Stable Diffusion XL
- API: https://platform.stability.ai/docs

```javascript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'multipart/form-data',
  },
  body: formData, // Contains image + prompt
});
```

#### 4. **Anthropic Claude**
- Best for: Advanced image analysis and editing suggestions
- Model: Claude 3 Opus/Sonnet with vision
- API: https://docs.anthropic.com/claude/docs

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: userCommand
          }
        ],
      },
    ],
  }),
});
```

### Implementing Specific Features:

#### Background Removal:
```javascript
// Using Replicate RemBG
if (command.toLowerCase().includes('nền') || command.toLowerCase().includes('background')) {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${aiSettings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
      input: { image: imageState.original },
    }),
  });
  
  const prediction = await response.json();
  // Poll for completion and update image
}
```

#### Object Removal/Inpainting:
```javascript
// Using Stability AI Inpainting
const formData = new FormData();
formData.append('init_image', imageBlob);
formData.append('mask_image', maskBlob); // Generated from AI or user selection
formData.append('prompt', 'fill the masked area naturally');

const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image/masking', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiSettings.apiKey}` },
  body: formData,
});
```

#### Style Transfer:
```javascript
// Using Replicate or Stability AI
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${aiSettings.apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: 'stability-ai/sdxl:...',
    input: {
      image: imageState.original,
      prompt: extractedStyle, // e.g., "vintage", "anime", "oil painting"
      strength: 0.7,
    },
  }),
});
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Choose one or more providers:

# OpenAI
REACT_APP_OPENAI_API_KEY=sk-...

# Anthropic
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...

# Replicate
REACT_APP_REPLICATE_API_TOKEN=r8_...

# Stability AI
REACT_APP_STABILITY_API_KEY=sk-...

# Custom API
REACT_APP_CUSTOM_AI_ENDPOINT=https://your-api.com/v1/process
```

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Never expose API keys in client-side code**
   - The current implementation stores keys in localStorage for demo purposes
   - In production, API calls should go through your backend

2. **Recommended Production Architecture:**
   ```
   Frontend → Your Backend API → AI Provider API
   ```

3. **Backend Proxy Example (Node.js/Express):**
   ```javascript
   app.post('/api/ai/process', async (req, res) => {
     const { command, image } = req.body;
     
     // Call AI provider with server-side API key
     const result = await callAIProvider(command, image, process.env.AI_API_KEY);
     
     res.json(result);
   });
   ```

4. **Rate Limiting:**
   - Implement rate limiting to prevent abuse
   - Monitor API usage and costs
   - Set spending limits on AI provider dashboards

## Testing

### Manual Testing:
1. Configure AI settings with a test API key
2. Try suggested prompts
3. Test custom commands
4. Verify error handling when API key is missing
5. Check chat history and clear functionality

### Test Commands:
- "Remove background"
- "Make it brighter"
- "Apply sepia filter"
- "Crop to square"
- "Reduce file size"

## Troubleshooting

### Common Issues:

**"AI chưa được cấu hình" (AI not configured):**
- Solution: Click settings icon and enter API key

**"Không thể xử lý yêu cầu" (Cannot process request):**
- Check API key is valid
- Verify internet connection
- Check browser console for errors
- Ensure AI provider service is available

**CORS Errors:**
- AI API calls should go through backend proxy
- Cannot call external APIs directly from browser in production

**Rate Limit Errors:**
- Check AI provider dashboard for usage limits
- Implement queue system for multiple requests
- Add user-facing rate limit warnings

## Future Enhancements

Potential improvements:
- [ ] Voice commands integration
- [ ] Batch processing multiple images
- [ ] AI-powered auto-enhance
- [ ] Custom model training
- [ ] Collaborative editing with AI suggestions
- [ ] AI-generated editing presets
- [ ] Integration with more AI providers
- [ ] Offline AI using WebGL/WASM models

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Replicate Documentation](https://replicate.com/docs)
- [Stability AI API](https://platform.stability.ai/docs)
- [RemBG Model (Background Removal)](https://github.com/danielgatis/rembg)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AI provider documentation
3. Check browser console for detailed error messages
4. Verify API keys and permissions

## License

This AI feature integration is part of the image editor application and follows the same license.
