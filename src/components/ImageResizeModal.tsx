import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Check, X, Lock, Unlock, Percent, Maximize2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EditValues } from '../App';

interface ImageResizeModalProps {
  imageUrl: string;
  currentEdits: EditValues;
  onResizeApply: (resizeData: {
    width: number;
    height: number;
    mode: 'pixels' | 'percentage';
  }) => void;
  onClose: () => void;
}

export function ImageResizeModal({
  imageUrl,
  currentEdits,
  onResizeApply,
  onClose,
}: ImageResizeModalProps) {
  const [originalWidth, setOriginalWidth] = useState(1000);
  const [originalHeight, setOriginalHeight] = useState(1000);
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [percentage, setPercentage] = useState(100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [mode, setMode] = useState<'pixels' | 'percentage'>('pixels');
  const [presetSize, setPresetSize] = useState('custom');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const aspectRatio = useRef(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Common preset sizes
  const presets = [
    { id: 'original', label: 'Kích thước gốc', width: originalWidth, height: originalHeight },
    { id: 'hd', label: 'HD (1280×720)', width: 1280, height: 720 },
    { id: 'full-hd', label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
    { id: '4k', label: '4K (3840×2160)', width: 3840, height: 2160 },
    { id: 'small', label: 'Nhỏ (800×600)', width: 800, height: 600 },
    { id: 'medium', label: 'Trung bình (1024×768)', width: 1024, height: 768 },
    { id: 'custom', label: 'Tùy chỉnh', width: width, height: height },
  ];

  const percentagePresets = [
    { id: '25', label: '25%', value: 25 },
    { id: '50', label: '50%', value: 50 },
    { id: '75', label: '75%', value: 75 },
    { id: '150', label: '150%', value: 150 },
    { id: '200', label: '200%', value: 200 },
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
      aspectRatio.current = imgWidth / imgHeight;
      
      setWidth(imgWidth);
      setHeight(imgHeight);
      
      setIsLoaded(true);
      drawPreview();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (isLoaded) {
      drawPreview();
    }
  }, [width, height, isLoaded]);

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

    // Clear and draw resized image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const handleWidthChange = (newWidth: number) => {
    if (newWidth < 1) newWidth = 1;
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio.current));
    }
    // Update percentage
    const pct = Math.round((newWidth / originalWidth) * 100);
    setPercentage(pct);
    setPresetSize('custom');
  };

  const handleHeightChange = (newHeight: number) => {
    if (newHeight < 1) newHeight = 1;
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio.current));
    }
    // Update percentage
    const pct = Math.round((newHeight / originalHeight) * 100);
    setPercentage(pct);
    setPresetSize('custom');
  };

  const handlePercentageChange = (newPercentage: number) => {
    if (newPercentage < 1) newPercentage = 1;
    if (newPercentage > 500) newPercentage = 500;
    setPercentage(newPercentage);
    const newWidth = Math.round((originalWidth * newPercentage) / 100);
    const newHeight = Math.round((originalHeight * newPercentage) / 100);
    setWidth(newWidth);
    setHeight(newHeight);
    setPresetSize('custom');
  };

  const handlePresetChange = (presetId: string) => {
    setPresetSize(presetId);
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      let newWidth = preset.width;
      let newHeight = preset.height;
      
      // If maintaining aspect ratio and not original, scale appropriately
      if (maintainAspectRatio && presetId !== 'original') {
        const targetRatio = newWidth / newHeight;
        if (Math.abs(targetRatio - aspectRatio.current) > 0.01) {
          // Preset doesn't match aspect ratio, scale to fit
          const scale = Math.min(newWidth / originalWidth, newHeight / originalHeight);
          newWidth = Math.round(originalWidth * scale);
          newHeight = Math.round(originalHeight * scale);
        }
      }
      
      setWidth(newWidth);
      setHeight(newHeight);
      
      // Update percentage
      const pct = Math.round((newWidth / originalWidth) * 100);
      setPercentage(pct);
    }
  };

  const handlePercentagePresetChange = (value: number) => {
    handlePercentageChange(value);
  };

  const handleApply = () => {
    onResizeApply({
      width,
      height,
      mode,
    });
    onClose();
  };

  const fileSizeEstimate = () => {
    // Rough estimate: width * height * 3 bytes (RGB) / compression factor
    const pixels = width * height;
    const bytes = pixels * 3 * 0.3; // Assuming ~30% of raw size after compression
    const kb = bytes / 1024;
    if (kb > 1024) {
      return `~${(kb / 1024).toFixed(1)} MB`;
    }
    return `~${kb.toFixed(0)} KB`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5" />
            Thay đổi kích thước ảnh
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center bg-slate-100 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="rounded shadow-lg mb-2"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <div className="text-xs text-slate-600">
              {width} × {height} px • {fileSizeEstimate()}
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'pixels' | 'percentage')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pixels">Pixels</TabsTrigger>
              <TabsTrigger value="percentage">Phần trăm</TabsTrigger>
            </TabsList>

            {/* Pixels Mode */}
            <TabsContent value="pixels" className="space-y-4 mt-4">
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
                    <Label htmlFor="width-px">Chiều rộng (px)</Label>
                    <Input
                      id="width-px"
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                      min={1}
                      max={10000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height-px">Chiều cao (px)</Label>
                    <Input
                      id="height-px"
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                      min={1}
                      max={10000}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 text-center">
                  Kích thước gốc: {originalWidth} × {originalHeight} px
                </div>
              </div>
            </TabsContent>

            {/* Percentage Mode */}
            <TabsContent value="percentage" className="space-y-4 mt-4">
              {/* Percentage Presets */}
              <div className="space-y-3">
                <Label>Tỷ lệ phần trăm</Label>
                <div className="grid grid-cols-3 gap-2">
                  {percentagePresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={percentage === preset.value ? 'default' : 'outline'}
                      onClick={() => handlePercentagePresetChange(preset.value)}
                      className="w-full"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Percentage */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="percentage">Tỷ lệ tùy chỉnh</Label>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
                <Input
                  id="percentage"
                  type="number"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(parseInt(e.target.value) || 1)}
                  min={1}
                  max={500}
                  step={1}
                />
                <div className="text-xs text-slate-500">
                  Kết quả: {width} × {height} px
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center bg-white p-3 rounded-lg border">
                Kích thước gốc: {originalWidth} × {originalHeight} px (100%)
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
            💡 Thay đổi kích thước ảnh sẽ ảnh hưởng đến chất lượng. Tăng kích thước có thể làm
            ảnh bị mờ, giảm kích thước sẽ làm giảm dung lượng file.
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