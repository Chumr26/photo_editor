import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Settings, 
  Wand2,
  Lightbulb,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'progress';
  content: string;
  timestamp: Date;
  isComplete?: boolean; // For progress messages
}

interface AIChatPanelProps {
  onAICommand: (command: string) => Promise<void>;
  onOpenSettings: () => void;
  isConfigured: boolean;
}

// Suggested prompts for users
const suggestedPrompts = [
  { icon: '✨', text: 'Làm nền trong suốt', category: 'background' },
  { icon: '🎨', text: 'Thay đổi màu nền thành xanh dương', category: 'background' },
  { icon: '🌟', text: 'Làm sáng và tăng độ tương phản', category: 'enhance' },
  { icon: '🖼️', text: 'Loại bỏ vật thể không mong muốn', category: 'object' },
  { icon: '👤', text: 'Xóa nền chỉ giữ người', category: 'background' },
  { icon: '🎭', text: 'Thêm hiệu ứng vintage', category: 'style' },
  { icon: '📐', text: 'Tự động cắt và căn giữa đối tượng chính', category: 'crop' },
  { icon: '✂️', text: 'Cắt ảnh theo tỷ lệ 16:9', category: 'crop' },
];

export function AIChatPanel({ onAICommand, onOpenSettings, isConfigured }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Xin chào! 👋 Tôi là trợ lý AI. Hãy mô tả những gì bạn muốn chỉnh sửa trên ảnh, tôi sẽ giúp bạn!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (type: 'user' | 'ai' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    if (!isConfigured) {
      addMessage('system', '⚠️ AI chưa được cấu hình. Vui lòng nhấn nút cài đặt để cấu hình API key.');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsProcessing(true);

    // Add progress message
    const progressId = Date.now().toString();
    const progressMessage: Message = {
      id: progressId,
      type: 'progress',
      content: '🔄 Đang phân tích lệnh...',
      timestamp: new Date(),
      isComplete: false,
    };
    setMessages(prev => [...prev, progressMessage]);

    try {
      // Update progress: Analyzing
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === progressId 
            ? { ...m, content: '🖼️ Đang chuẩn bị ảnh...' }
            : m
        ));
      }, 500);

      // Update progress: Processing
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === progressId 
            ? { ...m, content: '⚙️ Đang xử lý với AI...' }
            : m
        ));
      }, 1000);

      // Call the AI command handler
      await onAICommand(userMessage);

      // Mark progress as complete and add success message
      setMessages(prev => prev.filter(m => m.id !== progressId));
      addMessage('ai', '✅ Hoàn thành! Đã áp dụng chỉnh sửa vào ảnh của bạn.');
    } catch (error) {
      // Remove progress message and show error
      setMessages(prev => prev.filter(m => m.id !== progressId));
      addMessage('system', `❌ Lỗi: ${error instanceof Error ? error.message : 'Không thể xử lý yêu cầu'}`);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'system',
        content: 'Đã xóa lịch sử chat. Bắt đầu cuộc trò chuyện mới!',
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="flex items-center gap-2">
                Trợ lý AI
                {isConfigured && (
                  <Badge variant="default" className="text-xs">
                    Hoạt động
                  </Badge>
                )}
                {!isConfigured && (
                  <Badge variant="secondary" className="text-xs">
                    Chưa cấu hình
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-slate-600">
                Mô tả những gì bạn muốn chỉnh sửa
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="h-8 w-8"
              title="Cài đặt AI"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isConfigured && (
          <Alert className="mt-2 bg-yellow-50 border-yellow-200">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs">
              Cần cấu hình API key để sử dụng AI. Nhấn <Settings className="w-3 h-3 inline" /> để thiết lập.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'ai'
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-slate-900'
                    : message.type === 'progress'
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="w-3 h-3" />
                    <span className="text-xs font-medium">AI Assistant</span>
                  </div>
                )}
                {message.type === 'progress' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs font-medium">Đang xử lý</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3 border-t border-slate-100">
          <Label className="text-xs text-slate-600 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Gợi ý nhanh:
          </Label>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.slice(0, 6).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedPrompt(prompt.text)}
                className="text-xs h-auto py-1.5 px-3"
                disabled={isProcessing}
              >
                <span className="mr-1">{prompt.icon}</span>
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mô tả chỉnh sửa bạn muốn (VD: Làm nền trong suốt)..."
            className="flex-1"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          💡 Mẹo: Mô tả càng chi tiết, kết quả càng chính xác
        </p>
      </div>
    </div>
  );
}
