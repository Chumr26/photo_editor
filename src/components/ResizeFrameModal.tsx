import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Check, X, Maximize2, Lock, Unlock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { EditValues } from '../App';

interface ResizeFrameModalProps {
  imageUrl: string;
  currentEdits: EditValues;
  onResizeApply: (frameData: {
    width: number;
    height: number;
    backgroundColor: string;
    maintainAspectRatio: boolean;
  }) => void;
  onClose: () => void;
}

export function ResizeFrameModal({
  imageUrl,
  currentEdits,
  onResizeApply,
  onClose,
}: ResizeFrameModalProps) {
  // Get original dimensions from the image
  const [originalWidth, setOriginalWidth] = useState(1000);
  const [originalHeight, setOriginalHeight] = useState(1000);
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(
    currentEdits.frame?.backgroundColor || '#ffffff'
  );
  const [presetSize, setPresetSize] = useState('custom');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Common social media sizes
  const presets = [
    { id: 'original', label: 'Kích thước gốc', width: originalWidth, height: originalHeight },
    { id: 'instagram-square', label: 'Instagram (1:1)', width: 1080, height: 1080 },
    { id: 'instagram-portrait', label: 'Instagram Story', width: 1080, height: 1920 },
    { id: 'facebook-post', label: 'Facebook Post', width: 1200, height: 630 },
    { id: 'twitter-post', label: 'Twitter Post', width: 1200, height: 675 },
    { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', width: 1280, height: 720 },
    { id: 'custom', label: 'Tùy chỉnh', width: width, height: height },
  ];

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      setOriginalWidth(imgWidth);
      setOriginalHeight(imgHeight);
      setAspectRatio(imgWidth / imgHeight);
      
      // Initialize with current frame or original dimensions
      if (currentEdits.frame) {
        setWidth(currentEdits.frame.width);
        setHeight(currentEdits.frame.height);
      } else {
        setWidth(imgWidth);
        setHeight(imgHeight);
      }
      
      setIsLoaded(true);
      drawPreview();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    drawPreview();
  }, [width, height, backgroundColor]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set preview canvas size (scaled down for display)
    const maxPreviewSize = 400;
    const previewScale = Math.min(maxPreviewSize / width, maxPreviewSize / height, 1);
    canvas.width = width * previewScale;
    canvas.height = height * previewScale;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate image position to center it
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    // Draw image centered
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
    setPresetSize('custom');
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
    setPresetSize('custom');
  };

  const handlePresetChange = (presetId: string) => {
    setPresetSize(presetId);
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setWidth(preset.width);
      setHeight(preset.height);
    }
  };

  const handleApply = () => {
    onResizeApply({
      width,
      height,
      backgroundColor,
      maintainAspectRatio,
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5" />
            Thay đổi kích thước khung
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center bg-slate-100 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="rounded shadow-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Preset Sizes */}
          <div className="space-y-3">
            <Label>Kích thước mẫu</Label>
            <RadioGroup value={presetSize} onValueChange={handlePresetChange}>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <RadioGroupItem value={preset.id} id={preset.id} />
                    <Label htmlFor={preset.id} className="flex-1 cursor-pointer text-sm">
                      <div>{preset.label}</div>
                      {preset.id !== 'custom' && (
                        <div className="text-xs text-slate-500">
                          {preset.width} × {preset.height}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Custom Dimensions */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <Label>Kích thước tùy chỉnh</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                className="h-8"
              >
                {maintainAspectRatio ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Unlock className="w-4 h-4 mr-2" />
                )}
                {maintainAspectRatio ? 'Giữ tỷ lệ' : 'Tự do'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Chiều rộng (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                  min={100}
                  max={4000}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Chiều cao (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                  min={100}
                  max={4000}
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center">
              Tỷ lệ gốc: {originalWidth} × {originalHeight} (
              {(originalWidth / originalHeight).toFixed(2)})
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label htmlFor="bg-color">Màu nền</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <div className="flex-1 flex gap-2 flex-wrap">
                {['#ffffff', '#000000', '#f3f4f6', '#e5e7eb', '#3b82f6', '#ef4444'].map(
                  (color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor: backgroundColor === color ? '#3b82f6' : '#d1d5db',
                      }}
                      onClick={() => setBackgroundColor(color)}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
            💡 Ảnh gốc sẽ được căn giữa trong khung mới. Nếu khung nhỏ hơn ảnh, ảnh sẽ được
            thu nhỏ để vừa khung.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleApply}>
            <Check className="w-4 h-4 mr-2" />
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}