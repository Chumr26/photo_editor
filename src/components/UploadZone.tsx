import { useCallback, useState } from 'react';
import { Upload, Image } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div
        className={`
          border-2 border-dashed rounded-xl p-16 
          flex flex-col items-center justify-center gap-6
          transition-all duration-200
          ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
          {isDragging ? (
            <Upload className="w-10 h-10 text-blue-400" />
          ) : (
            <Image className="w-10 h-10 text-gray-400" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-gray-200 mb-2">
            {t('upload.dragDrop')}
          </h2>
          <p className="text-gray-400 text-sm">
            {t('upload.or')}
          </p>
        </div>

        <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
          <span>{t('upload.browse')}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        <div className="text-center text-xs text-gray-500">
          <p>{t('upload.supported')}: JPG, PNG, WebP, SVG</p>
          <p>{t('upload.maxSize')}: 20MB</p>
        </div>
      </div>
    </div>
  );
}
