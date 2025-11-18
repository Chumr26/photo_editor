import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ExternalLink, Code, Key } from 'lucide-react';

export function CloudIntegrationGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Hướng dẫn tích hợp Cloud Storage</h1>
        <p className="text-slate-600">
          Cấu hình API keys để tải ảnh từ các dịch vụ lưu trữ đám mây
        </p>
      </div>

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          Để bảo mật, các API keys nên được lưu trong file <code className="bg-slate-100 px-1 rounded">.env</code> 
          và không được commit lên GitHub. Thêm <code className="bg-slate-100 px-1 rounded">.env</code> vào 
          file <code className="bg-slate-100 px-1 rounded">.gitignore</code>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="gdrive" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gdrive">Google Drive</TabsTrigger>
          <TabsTrigger value="onedrive">OneDrive</TabsTrigger>
          <TabsTrigger value="dropbox">Dropbox</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="gdrive">
          <Card>
            <CardHeader>
              <CardTitle>Google Drive Picker API</CardTitle>
              <CardDescription>
                Cho phép người dùng chọn file từ Google Drive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Tạo Project trên Google Cloud Console</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                  <li>Truy cập <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Tạo project mới hoặc chọn project có sẵn</li>
                  <li>Bật Google Picker API trong Library</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Tạo API Key và OAuth Client ID</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                  <li>Vào "APIs & Services" → "Credentials"</li>
                  <li>Tạo API key mới</li>
                  <li>Tạo OAuth 2.0 Client ID (Web application)</li>
                  <li>Thêm authorized JavaScript origins: <code className="bg-slate-100 px-1 rounded">http://localhost:3000</code></li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Cấu hình trong dự án</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`# .env
REACT_APP_GOOGLE_API_KEY=your_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Cài đặt thư viện</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`npm install gapi-script`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">5. Code mẫu</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                  <pre>
{`// Load Google API
import { gapi } from 'gapi-script';

const initGooglePicker = () => {
  gapi.load('picker', () => {
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS_IMAGES)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY)
      .setCallback((data) => {
        if (data.action === 'picked') {
          const fileId = data.docs[0].id;
          // Download file using Drive API
        }
      })
      .build();
    picker.setVisible(true);
  });
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onedrive">
          <Card>
            <CardHeader>
              <CardTitle>OneDrive File Picker</CardTitle>
              <CardDescription>
                Tích hợp OneDrive file picker vào ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Đăng ký ứng dụng trên Azure Portal</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                  <li>Truy cập <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Azure Portal <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Vào "Azure Active Directory" → "App registrations"</li>
                  <li>Tạo "New registration"</li>
                  <li>Thêm platform: Single-page application</li>
                  <li>Redirect URI: <code className="bg-slate-100 px-1 rounded">http://localhost:3000</code></li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Cấu hình permissions</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                  <li>Vào "API permissions"</li>
                  <li>Thêm permission: Files.Read.All</li>
                  <li>Grant admin consent</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Cấu hình trong dự án</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`# .env
REACT_APP_ONEDRIVE_CLIENT_ID=your_client_id_here`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Code mẫu</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                  <pre>
{`// OneDrive File Picker
const launchOneDrivePicker = () => {
  const odOptions = {
    clientId: process.env.REACT_APP_ONEDRIVE_CLIENT_ID,
    action: "download",
    multiSelect: false,
    advanced: {
      filter: ".jpg,.png,.gif"
    },
    success: (files) => {
      const file = files.value[0];
      // Download file from file['@microsoft.graph.downloadUrl']
    }
  };
  OneDrive.open(odOptions);
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dropbox">
          <Card>
            <CardHeader>
              <CardTitle>Dropbox Chooser</CardTitle>
              <CardDescription>
                Sử dụng Dropbox Chooser để chọn file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Tạo Dropbox App</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                  <li>Truy cập <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Dropbox App Console <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Tạo app mới</li>
                  <li>Chọn "Scoped access"</li>
                  <li>Chọn "Full Dropbox" access</li>
                  <li>Copy App key</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Thêm Chooser SDK</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`<!-- Thêm vào public/index.html -->
<script src="https://www.dropbox.com/static/api/2/dropins.js" 
        id="dropboxjs" 
        data-app-key="YOUR_APP_KEY">
</script>`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Cấu hình trong dự án</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`# .env
REACT_APP_DROPBOX_APP_KEY=your_app_key_here`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Code mẫu</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                  <pre>
{`// Dropbox Chooser
const openDropboxChooser = () => {
  Dropbox.choose({
    success: (files) => {
      const fileUrl = files[0].link;
      // Fetch file from fileUrl
      fetch(fileUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], files[0].name);
          onImageLoad(file);
        });
    },
    linkType: "direct",
    multiselect: false,
    extensions: ['.jpg', '.png', '.gif', '.webp'],
  });
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>Tải ảnh từ URL</CardTitle>
              <CardDescription>
                Phương pháp đơn giản nhất - không cần API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Phương pháp này đã được tích hợp sẵn trong ứng dụng và hoạt động ngay lập tức!
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-medium mb-2">Cách lấy URL từ các dịch vụ</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">Google Drive:</p>
                    <ol className="list-decimal list-inside text-slate-600 space-y-1">
                      <li>Nhấn chuột phải vào file → "Chia sẻ"</li>
                      <li>Chọn "Bất kỳ ai có liên kết"</li>
                      <li>Copy link và chuyển đổi:
                        <div className="mt-1 bg-white p-2 rounded text-xs overflow-x-auto">
                          Từ: <code>https://drive.google.com/file/d/FILE_ID/view</code><br/>
                          Sang: <code>https://drive.google.com/uc?export=view&id=FILE_ID</code>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">OneDrive:</p>
                    <ol className="list-decimal list-inside text-slate-600">
                      <li>Nhấn "Chia sẻ" → "Sao chép liên kết"</li>
                      <li>Thay <code>?e=view</code> bằng <code>?download=1</code></li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">Imgur / Flickr:</p>
                    <ol className="list-decimal list-inside text-slate-600">
                      <li>Nhấn chuột phải vào ảnh</li>
                      <li>Chọn "Sao chép địa chỉ hình ảnh"</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">Unsplash / Pexels:</p>
                    <ol className="list-decimal list-inside text-slate-600">
                      <li>Nhấn chuột phải vào ảnh</li>
                      <li>Chọn "Copy image address"</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Lưu ý về CORS</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>
                    Một số website không cho phép tải ảnh từ nguồn khác (CORS policy). 
                    Trong trường hợp này, bạn có thể:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sử dụng các dịch vụ hỗ trợ CORS như Imgur, Unsplash</li>
                    <li>Tải ảnh về máy và upload từ máy tính</li>
                    <li>Sử dụng CORS proxy (chỉ cho mục đích test)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Tài liệu tham khảo</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://developers.google.com/drive/picker" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Google Picker API Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a href="https://learn.microsoft.com/en-us/onedrive/developer/controls/file-pickers/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                OneDrive File Picker Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a href="https://www.dropbox.com/developers/chooser" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Dropbox Chooser Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
