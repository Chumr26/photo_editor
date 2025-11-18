import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Cloud, Link as LinkIcon, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

// Cloud provider logos (using emojis for simplicity)
const cloudProviders = [
  { id: 'gdrive', name: 'Google Drive', icon: '📁', color: 'bg-blue-500' },
  { id: 'onedrive', name: 'OneDrive', icon: '☁️', color: 'bg-blue-600' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', color: 'bg-blue-400' },
  { id: 'box', name: 'Box', icon: '📂', color: 'bg-blue-700' },
];

interface CloudUploadModalProps {
  onImageLoad: (file: File) => void;
  onClose: () => void;
}

export function CloudUploadModal({ onImageLoad, onClose }: CloudUploadModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      setError('Vui lòng nhập URL hình ảnh');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch the image from URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Không thể tải ảnh từ URL này');
      }

      const blob = await response.blob();
      
      // Check if it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL không phải là hình ảnh hợp lệ');
      }

      // Convert blob to file
      const fileName = imageUrl.split('/').pop() || 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      onImageLoad(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudProviderClick = (providerId: string) => {
    setSelectedProvider(providerId);
    
    // In a real implementation, this would trigger the OAuth flow
    // For now, we'll show instructions
    if (providerId === 'gdrive') {
      openGoogleDrivePicker();
    } else if (providerId === 'onedrive') {
      openOneDrivePicker();
    } else if (providerId === 'dropbox') {
      openDropboxChooser();
    } else {
      setError(`Tích hợp ${cloudProviders.find(p => p.id === providerId)?.name} đang được phát triển`);
    }
  };

  const openGoogleDrivePicker = () => {
    // Demo mode - in production, this would use Google Picker API
    // https://developers.google.com/drive/picker/guides/overview
    setError('Để sử dụng Google Drive, bạn cần thêm API Key vào file .env:\nREACT_APP_GOOGLE_API_KEY=your_api_key\nREACT_APP_GOOGLE_CLIENT_ID=your_client_id');
    
    // Example of how it would work with real API:
    /*
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS_IMAGES)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(developerKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
    */
  };

  const openOneDrivePicker = () => {
    // Demo mode - in production, this would use OneDrive File Picker
    // https://learn.microsoft.com/en-us/onedrive/developer/controls/file-pickers/
    setError('Để sử dụng OneDrive, bạn cần thêm Client ID vào file .env:\nREACT_APP_ONEDRIVE_CLIENT_ID=your_client_id');
    
    // Example of how it would work with real API:
    /*
    OneDrive.open({
      clientId: clientId,
      action: "download",
      multiSelect: false,
      success: function(files) {
        // Handle file download
      },
      cancel: function() {},
      error: function(error) {}
    });
    */
  };

  const openDropboxChooser = () => {
    // Demo mode - in production, this would use Dropbox Chooser
    // https://www.dropbox.com/developers/chooser
    setError('Để sử dụng Dropbox, bạn cần thêm App Key vào file .env:\nREACT_APP_DROPBOX_APP_KEY=your_app_key');
    
    // Example of how it would work with real API:
    /*
    Dropbox.choose({
      success: function(files) {
        // files[0].link - direct link to file
      },
      linkType: "direct",
      multiselect: false,
      extensions: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    });
    */
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUrlSubmit();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Tải ảnh từ đám mây
          </DialogTitle>
          <DialogDescription>
            Chọn nguồn để tải ảnh từ dịch vụ lưu trữ đám mây hoặc từ URL
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Dịch vụ đám mây</TabsTrigger>
            <TabsTrigger value="url">URL trực tiếp</TabsTrigger>
          </TabsList>

          {/* Cloud Providers Tab */}
          <TabsContent value="providers" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {cloudProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
                  onClick={() => handleCloudProviderClick(provider.id)}
                >
                  <div className={`w-12 h-12 rounded-full ${provider.color} flex items-center justify-center text-2xl`}>
                    {provider.icon}
                  </div>
                  <span>{provider.name}</span>
                </Button>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Lưu ý:</strong> Để sử dụng tính năng tải từ đám mây, bạn cần đăng ký API keys 
                từ các nhà cung cấp dịch vụ. Hiện tại, bạn có thể sử dụng tính năng "URL trực tiếp" 
                để tải ảnh từ liên kết công khai.
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Hướng dẫn cấu hình:</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• <strong>Google Drive:</strong> Tạo API key tại Google Cloud Console</p>
                <p>• <strong>OneDrive:</strong> Đăng ký app tại Microsoft Azure Portal</p>
                <p>• <strong>Dropbox:</strong> Tạo app key tại Dropbox App Console</p>
                <p>• <strong>Box:</strong> Tạo developer token tại Box Developer Console</p>
              </div>
            </div>
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label htmlFor="image-url">Nhập URL hình ảnh</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleUrlSubmit}
                  disabled={isLoading || !imageUrl.trim()}
                  className="shrink-0"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Tải ảnh
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Nhập URL công khai của hình ảnh (hỗ trợ: JPG, PNG, GIF, WebP, BMP)
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Cách lấy URL từ các dịch vụ:
              </h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• <strong>Google Drive:</strong> Nhấn chuột phải → Chia sẻ → Lấy liên kết</p>
                <p>• <strong>OneDrive:</strong> Nhấn Chia sẻ → Sao chép liên kết</p>
                <p>• <strong>Dropbox:</strong> Nhấn Chia sẻ → Sao chép liên kết</p>
                <p>• <strong>Imgur/Flickr:</strong> Nhấn chuột phải vào ảnh → Sao chép địa chỉ hình ảnh</p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm whitespace-pre-line">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Lưu ý: URL phải là liên kết trực tiếp đến file hình ảnh và có thể truy cập công khai. 
                Một số dịch vụ có thể yêu cầu xác thực hoặc không cho phép tải từ nguồn bên ngoài (CORS).
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
