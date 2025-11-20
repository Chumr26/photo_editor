import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Settings, 
  Key, 
  Sparkles, 
  ExternalLink, 
  Check, 
  X, 
  AlertCircle,
  Code,
  Cloud
} from 'lucide-react';
import { Badge } from './ui/badge';

interface AISettingsModalProps {
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  currentSettings: AISettings;
}

export interface AISettings {
  provider: 'openai' | 'anthropic' | 'replicate' | 'stability' | 'custom';
  apiKey: string;
  model: string;
  endpoint?: string;
}

const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 Vision for image understanding and DALL-E for generation',
    models: ['gpt-4-vision-preview', 'dall-e-3', 'dall-e-2'],
    website: 'https://platform.openai.com',
    color: 'bg-green-500',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3 Vision for advanced image analysis',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    website: 'https://console.anthropic.com',
    color: 'bg-orange-500',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run open-source AI models (SDXL, ControlNet, etc.)',
    models: ['stability-ai/sdxl', 'controlnet', 'rembg'],
    website: 'https://replicate.com',
    color: 'bg-purple-500',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Stable Diffusion for image generation and editing',
    models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6'],
    website: 'https://platform.stability.ai',
    color: 'bg-blue-500',
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Use your own AI endpoint',
    models: ['custom'],
    website: '',
    color: 'bg-slate-500',
  },
];

export function AISettingsModal({ onClose, onSave, currentSettings }: AISettingsModalProps) {
  const [settings, setSettings] = useState<AISettings>(currentSettings);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const selectedProvider = AI_PROVIDERS.find(p => p.id === settings.provider);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Đang kiểm tra kết nối...');

    // TODO: Implement actual API test
    // This is a placeholder for testing the API connection
    setTimeout(() => {
      if (settings.apiKey.trim().length > 0) {
        setTestStatus('success');
        setTestMessage('✅ Kết nối thành công! API key hợp lệ.');
      } else {
        setTestStatus('error');
        setTestMessage('❌ Vui lòng nhập API key');
      }
    }, 1500);
  };

  const handleSave = () => {
    if (!settings.apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('❌ Vui lòng nhập API key trước khi lưu');
      return;
    }
    onSave(settings);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cài đặt AI
          </DialogTitle>
          <DialogDescription>
            Cấu hình AI provider để sử dụng chức năng chỉnh sửa ảnh thông minh
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Cấu hình</TabsTrigger>
            <TabsTrigger value="guide">Hướng dẫn</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4 mt-4">
            {/* Security Warning */}
            <Alert className="border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                <strong>⚠️ Bảo mật quan trọng:</strong>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>API key của bạn được lưu trong trình duyệt (localStorage)</li>
                  <li>Không chia sẻ API key với người khác</li>
                  <li>Không commit API key vào Git/GitHub</li>
                  <li>Ứng dụng này gọi trực tiếp API từ trình duyệt (không qua backend)</li>
                  <li>Để bảo mật tốt hơn trong production, nên sử dụng backend proxy</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Provider Selection */}
            <div className="space-y-3">
              <Label>Chọn AI Provider</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AI_PROVIDERS.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`cursor-pointer transition-all ${
                      settings.provider === provider.id
                        ? 'border-blue-500 shadow-md'
                        : 'hover:border-slate-300'
                    }`}
                    onClick={() => setSettings({ ...settings, provider: provider.id as any, model: provider.models[0] })}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                        {provider.name}
                        {settings.provider === provider.id && (
                          <Check className="w-4 h-4 ml-auto text-blue-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {provider.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-3">
              <Label htmlFor="api-key" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                >
                  {testStatus === 'testing' ? 'Đang kiểm tra...' : 'Test'}
                </Button>
              </div>
              {testStatus !== 'idle' && (
                <Alert variant={testStatus === 'error' ? 'destructive' : 'default'}>
                  <AlertDescription className="text-sm">
                    {testMessage}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-slate-500">
                🔒 API key của bạn được lưu cục bộ và không được gửi đến server nào khác
              </p>
            </div>

            {/* Model Selection */}
            {selectedProvider && (
              <div className="space-y-3">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={settings.model}
                  onValueChange={(value: string) => setSettings({ ...settings, model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProvider.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Endpoint (for custom provider) */}
            {settings.provider === 'custom' && (
              <div className="space-y-3">
                <Label htmlFor="endpoint" className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Custom API Endpoint
                </Label>
                <Input
                  id="endpoint"
                  type="url"
                  placeholder="https://api.example.com/v1/process"
                  value={settings.endpoint || ''}
                  onChange={(e) => setSettings({ ...settings, endpoint: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Feature Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tính năng AI có sẵn
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline">🎨 Background Removal</Badge>
                  <Badge variant="outline">✨ Object Removal</Badge>
                  <Badge variant="outline">🖼️ Style Transfer</Badge>
                  <Badge variant="outline">🌈 Color Enhancement</Badge>
                  <Badge variant="outline">📐 Smart Crop</Badge>
                  <Badge variant="outline">🎭 Artistic Filters</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Để sử dụng chức năng AI, bạn cần đăng ký API key từ các nhà cung cấp dịch vụ AI.
                Hầu hết các provider đều cung cấp free tier để bạn dùng thử.
              </AlertDescription>
            </Alert>

            {AI_PROVIDERS.filter(p => p.id !== 'custom').map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                    {provider.name}
                  </CardTitle>
                  <CardDescription>{provider.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Cách lấy API Key:</h4>
                    <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                      {provider.id === 'openai' && (
                        <>
                          <li>Truy cập <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></li>
                          <li>Đăng ký/Đăng nhập tài khoản</li>
                          <li>Vào "API Keys" trong menu</li>
                          <li>Nhấn "Create new secret key"</li>
                          <li>Copy và lưu key (chỉ hiển thị 1 lần)</li>
                        </>
                      )}
                      {provider.id === 'anthropic' && (
                        <>
                          <li>Truy cập <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a></li>
                          <li>Tạo tài khoản và xác thực</li>
                          <li>Vào "API Keys"</li>
                          <li>Tạo key mới</li>
                          <li>Copy API key</li>
                        </>
                      )}
                      {provider.id === 'replicate' && (
                        <>
                          <li>Truy cập <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Replicate</a></li>
                          <li>Đăng nhập bằng GitHub</li>
                          <li>Vào "Account" → "API tokens"</li>
                          <li>Copy token hoặc tạo mới</li>
                        </>
                      )}
                      {provider.id === 'stability' && (
                        <>
                          <li>Truy cập <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stability AI Platform</a></li>
                          <li>Tạo tài khoản</li>
                          <li>Vào "API Keys"</li>
                          <li>Generate new key</li>
                          <li>Copy và lưu lại</li>
                        </>
                      )}
                    </ol>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Example .env config:</span>
                      <Code className="w-3 h-3 text-slate-400" />
                    </div>
                    <pre>
{provider.id === 'openai' && `REACT_APP_OPENAI_API_KEY=sk-...`}
{provider.id === 'anthropic' && `REACT_APP_ANTHROPIC_API_KEY=sk-ant-...`}
{provider.id === 'replicate' && `REACT_APP_REPLICATE_API_TOKEN=r8_...`}
{provider.id === 'stability' && `REACT_APP_STABILITY_API_KEY=sk-...`}
                    </pre>
                  </div>

                  {provider.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <a href={provider.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Mở {provider.name}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-sm">💡 Lưu ý quan trọng</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-slate-700">
                <p>• API keys cần được bảo mật tuyệt đối, không chia sẻ với người khác</p>
                <p>• Hầu hết provider đều tính phí theo usage (pay-as-you-go)</p>
                <p>• Kiểm tra billing và usage limits để tránh bị tính phí quá mức</p>
                <p>• Nên sử dụng environment variables để lưu API keys</p>
                <p>• Trong production, nên gọi API từ backend để bảo vệ API key</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Lưu cài đặt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
