import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Link as LinkIcon, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface CloudUploadModalProps {
    onImageLoad: (file: File) => void;
    onClose: () => void;
}

export function CloudUploadModal({
    onImageLoad,
    onClose,
}: CloudUploadModalProps) {
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
            setError(
                err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh'
            );
        } finally {
            setIsLoading(false);
        }
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
                        <LinkIcon className="w-5 h-5" />
                        Tải ảnh từ URL
                    </DialogTitle>
                    <DialogDescription>
                        Nhập URL công khai của hình ảnh để tải lên trình chỉnh
                        sửa
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="space-y-3">
                        <Label htmlFor="image-url">Nhập URL hình ảnh</Label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    id="image-url"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) =>
                                        setImageUrl(e.target.value)
                                    }
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
                            Nhập URL công khai của hình ảnh (hỗ trợ: JPG, PNG,
                            GIF, WebP, BMP)
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Cách lấy URL từ các dịch vụ:
                        </h4>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p>
                                • <strong>Google Drive:</strong> Nhấn chuột phải
                                → Chia sẻ → Lấy liên kết
                            </p>
                            <p>
                                • <strong>OneDrive:</strong> Nhấn Chia sẻ → Sao
                                chép liên kết
                            </p>
                            <p>
                                • <strong>Dropbox:</strong> Nhấn Chia sẻ → Sao
                                chép liên kết
                            </p>
                            <p>
                                • <strong>Imgur/Flickr:</strong> Nhấn chuột phải
                                vào ảnh → Sao chép địa chỉ hình ảnh
                            </p>
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
                            ⚠️ Lưu ý: URL phải là liên kết trực tiếp đến file
                            hình ảnh và có thể truy cập công khai. Một số dịch
                            vụ có thể yêu cầu xác thực hoặc không cho phép tải
                            từ nguồn bên ngoài (CORS).
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
