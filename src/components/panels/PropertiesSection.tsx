import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { toast } from 'sonner@2.0.3';

export function PropertiesSection() {
  const { image, resizeImage } = useEditorStore();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Initialize dimensions when image loads
  useEffect(() => {
    if (image) {
      setWidth(image.width);
      setHeight(image.height);
      setAspectRatio(image.width / image.height);
    }
  }, [image]);

  if (!image) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (keepAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (keepAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePresetChange = (preset: string) => {
    let newWidth = width;
    let newHeight = height;
    
    switch (preset) {
      case 'instagram-square':
        newWidth = 1080;
        newHeight = 1080;
        break;
      case 'instagram-story':
        newWidth = 1080;
        newHeight = 1920;
        break;
      case 'youtube-thumb':
        newWidth = 1280;
        newHeight = 720;
        break;
      case 'facebook-post':
        newWidth = 1200;
        newHeight = 630;
        break;
      case 'twitter-post':
        newWidth = 1200;
        newHeight = 675;
        break;
      case 'hd-1080':
        newWidth = 1920;
        newHeight = 1080;
        break;
      case 'hd-720':
        newWidth = 1280;
        newHeight = 720;
        break;
      case '4k':
        newWidth = 3840;
        newHeight = 2160;
        break;
      default:
        return;
    }
    
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleApplyResize = () => {
    if (width <= 0 || height <= 0) {
      toast.error('Kích thước không hợp lệ / Invalid dimensions');
      return;
    }
    
    if (width === image.width && height === image.height) {
      toast.info('Kích thước không thay đổi / No size change');
      return;
    }
    
    resizeImage(width, height);
  };

  return (
    <div className="space-y-4">
      {/* Image info */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tên tệp:</span>
          <span className="text-gray-200 truncate ml-2" title={image.filename}>
            {image.filename}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Kích thước:</span>
          <span className="text-gray-200">
            {image.width} × {image.height} px
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Dung lượng:</span>
          <span className="text-gray-200">{formatFileSize(image.fileSize)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tỷ lệ:</span>
          <span className="text-gray-200">{aspectRatio.toFixed(2)}:1</span>
        </div>
      </div>

      <div className="h-px bg-gray-700" />

      {/* Resize controls */}
      <div className="space-y-3">
        <h4 className="text-sm text-gray-300">Thay đổi kích thước (Resize)</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Chiều rộng (Width)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Chiều cao (Height)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={keepAspectRatio}
            onChange={(e) => setKeepAspectRatio(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 cursor-pointer"
          />
          <span>🔒 Giữ tỷ lệ (Keep aspect ratio)</span>
        </label>

        <div>
          <label className="text-xs text-gray-400 block mb-2">Kích thước mẫu (Presets)</label>
          <select 
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="">Tùy chỉnh (Custom)</option>
            <optgroup label="Social Media">
              <option value="instagram-square">Instagram (1:1) - 1080×1080</option>
              <option value="instagram-story">Instagram Story (9:16) - 1080×1920</option>
              <option value="facebook-post">Facebook Post (16:9) - 1200×630</option>
              <option value="twitter-post">Twitter Post (16:9) - 1200×675</option>
            </optgroup>
            <optgroup label="Video">
              <option value="youtube-thumb">YouTube Thumbnail - 1280×720</option>
              <option value="hd-720">HD 720p - 1280×720</option>
              <option value="hd-1080">HD 1080p - 1920×1080</option>
              <option value="4k">4K - 3840×2160</option>
            </optgroup>
          </select>
        </div>

        {(width !== image.width || height !== image.height) && (
          <div className="text-xs text-blue-400 bg-blue-950/30 p-2 rounded border border-blue-800">
            📊 Thay đổi: {image.width}×{image.height} → {width}×{height}
          </div>
        )}

        <button 
          onClick={handleApplyResize}
          disabled={width === image.width && height === image.height}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          ✅ Áp dụng (Apply Resize)
        </button>

        <button 
          onClick={() => {
            setWidth(image.width);
            setHeight(image.height);
            setAspectRatio(image.width / image.height);
          }}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors"
        >
          🔄 Đặt lại (Reset)
        </button>
      </div>
    </div>
  );
}