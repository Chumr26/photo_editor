import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, LinkIcon } from 'lucide-react';
import { Button } from './ui/button';
import { CloudUploadModal } from './CloudUploadModal';

interface UploadScreenProps {
    onImageUpload: (file: File) => void;
}

export function UploadScreen({ onImageUpload }: UploadScreenProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [showCloudModal, setShowCloudModal] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                onImageUpload(file);
            }
        },
        [onImageUpload]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                        <ImageIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="mb-2">Trình chỉnh sửa ảnh</h1>
                    <p className="text-slate-600">
                        Tải ảnh lên và bắt đầu chỉnh sửa với các công cụ đơn
                        giản
                    </p>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center
            transition-all duration-200
            ${
                isDragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                    : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
            }
          `}
                >
                    <Upload
                        className={`w-12 h-12 mx-auto mb-4 ${
                            isDragging ? 'text-blue-500' : 'text-slate-400'
                        }`}
                    />

                    <div className="mb-4">
                        <p className="mb-1">Kéo thả ảnh vào đây</p>
                        <p className="text-sm text-slate-500">hoặc</p>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <label htmlFor="file-upload">
                            <Button
                                asChild
                                size="lg"
                                className="cursor-pointer"
                            >
                                <span>Chọn ảnh từ máy tính</span>
                            </Button>
                        </label>

                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => setShowCloudModal(true)}
                            className="gap-2"
                        >
                            <LinkIcon className="w-4 h-4" />
                            Tải từ URL
                        </Button>
                    </div>

                    <p className="text-xs text-slate-500 mt-6">
                        Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB)
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl mb-1">✨</div>
                        <p className="text-sm text-slate-600">
                            Chỉnh sửa nhanh
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl mb-1">🎨</div>
                        <p className="text-sm text-slate-600">Nhiều bộ lọc</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl mb-1">✂️</div>
                        <p className="text-sm text-slate-600">Cắt & xoay</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl mb-1">💾</div>
                        <p className="text-sm text-slate-600">Tải về dễ dàng</p>
                    </div>
                </div>
            </div>

            {showCloudModal && (
                <CloudUploadModal
                    onImageLoad={onImageUpload}
                    onClose={() => setShowCloudModal(false)}
                />
            )}
        </div>
    );
}
