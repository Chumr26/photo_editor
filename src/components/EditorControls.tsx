import { EditValues } from '../App';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Droplet, Palette, Sun, Contrast, FlipHorizontal2, FlipVertical2, Crop, Maximize2, Frame, Expand, RotateCw, RotateCcw, Check, X, Lock, Unlock, ArrowLeftRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ASPECT_RATIO_PRESETS, formatRatio, flipRatioOrientation, AspectRatio } from '../utils/aspectRatio.utils';

interface EditorControlsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
  onEditCommit: (key: keyof EditValues, value: any) => void;
  editMode: 'none' | 'crop' | 'rotate' | 'resize';
  onEditModeChange: (mode: 'none' | 'crop' | 'rotate' | 'resize') => void;
  onCropConfirm?: (crop: { x: number; y: number; width: number; height: number } | null) => void;
  onCropCancel?: () => void;
}

export function EditorControls({ edits, onEditChange, onEditCommit, editMode, onEditModeChange, onCropConfirm, onCropCancel }: EditorControlsProps) {
  const [rotationInput, setRotationInput] = useState(edits.rotation);
  const [resizeWidth, setResizeWidth] = useState(1000);
  const [resizeHeight, setResizeHeight] = useState(1000);
  const [customRatioWidth, setCustomRatioWidth] = useState('16');
  const [customRatioHeight, setCustomRatioHeight] = useState('9');

  // Load aspect ratio preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aspectRatioPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.lastUsedRatio && editMode === 'crop' && !edits.cropAspectRatio) {
          // Optionally restore last used ratio
          // onEditCommit('cropAspectRatio', prefs.lastUsedRatio);
          // onEditCommit('cropAspectRatioLocked', prefs.isLocked);
        }
      }
    } catch (error) {
      console.error('Failed to load aspect ratio preferences:', error);
    }
  }, []);

  // Save aspect ratio preferences when they change
  useEffect(() => {
    if (editMode === 'crop' && edits.cropAspectRatio) {
      try {
        const prefs = {
          lastUsedRatio: edits.cropAspectRatio,
          isLocked: edits.cropAspectRatioLocked,
          customRatios: [], // Can be extended later
        };
        localStorage.setItem('aspectRatioPreferences', JSON.stringify(prefs));
      } catch (error) {
        console.error('Failed to save aspect ratio preferences:', error);
      }
    }
  }, [editMode, edits.cropAspectRatio, edits.cropAspectRatioLocked]);

  // Keyboard shortcuts for crop mode
  useEffect(() => {
    if (editMode !== 'crop') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          // Toggle lock/unlock
          e.preventDefault();
          const newLocked = !edits.cropAspectRatioLocked;
          onEditChange('cropAspectRatioLocked', newLocked);
          if (!newLocked) {
            onEditChange('cropAspectRatio', null);
          }
          onEditCommit('cropAspectRatioLocked', newLocked);
          break;
        
        case 'f':
          // Free crop (unlock)
          e.preventDefault();
          onEditChange('cropAspectRatioLocked', false);
          onEditChange('cropAspectRatio', null);
          onEditCommit('cropAspectRatioLocked', false);
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          // Apply preset ratios (1-8)
          e.preventDefault();
          const presetIndex = parseInt(e.key) - 1;
          if (presetIndex < ASPECT_RATIO_PRESETS.length) {
            const preset = ASPECT_RATIO_PRESETS[presetIndex];
            onEditChange('cropAspectRatio', preset.ratio);
            onEditChange('cropAspectRatioLocked', true);
            onEditCommit('cropAspectRatio', preset.ratio);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, edits.cropAspectRatioLocked, onEditCommit]);
  return (
    <div className="p-6 space-y-6">
      {editMode === 'none' && (
        <>
          <div>
            <h3 className="mb-4">Công cụ chỉnh sửa</h3>

            {/* Blur */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-slate-600" />
                  Làm mờ
                </Label>
                <span className="text-sm text-slate-600">{edits.blur}px</span>
              </div>
              <Slider
                value={[edits.blur]}
                onValueChange={([value]: number[]) => onEditChange('blur', value)}
                onValueCommit={([value]: number[]) => onEditCommit('blur', value)}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Grayscale */}
            <div className="flex items-center justify-between mb-6">
              <Label htmlFor="grayscale" className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-600" />
                Đen trắng
              </Label>
              <Switch
                id="grayscale"
                checked={edits.grayscale}
                onCheckedChange={(checked: boolean) => onEditCommit('grayscale', checked)}
              />
            </div>

            <Separator className="my-6" />

            {/* Brightness */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-slate-600" />
                  Độ sáng
                </Label>
                <span className="text-sm text-slate-600">{edits.brightness}%</span>
              </div>
              <Slider
                value={[edits.brightness]}
                onValueChange={([value]: number[]) => onEditChange('brightness', value)}
                onValueCommit={([value]: number[]) => onEditCommit('brightness', value)}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Contrast className="w-4 h-4 text-slate-600" />
                  Độ tương phản
                </Label>
                <span className="text-sm text-slate-600">{edits.contrast}%</span>
              </div>
              <Slider
                value={[edits.contrast]}
                onValueChange={([value]: number[]) => onEditChange('contrast', value)}
                onValueCommit={([value]: number[]) => onEditCommit('contrast', value)}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <Separator className="my-6" />

            {/* Flip Controls */}
            <div className="space-y-3 mb-6">
              <Label>Lật ảnh</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={edits.flipH ? 'default' : 'outline'}
                  onClick={() => onEditCommit('flipH', !edits.flipH)}
                  className="w-full"
                >
                  <FlipHorizontal2 className="w-4 h-4 mr-2" />
                  Ngang
                </Button>
                <Button
                  variant={edits.flipV ? 'default' : 'outline'}
                  onClick={() => onEditCommit('flipV', !edits.flipV)}
                  className="w-full"
                >
                  <FlipVertical2 className="w-4 h-4 mr-2" />
                  Dọc
                </Button>
              </div>
            </div>

            {/* Transform Tools */}
            <div className="space-y-3">
              <Label>Biến đổi</Label>
              <Button
                variant="outline"
                onClick={() => onEditModeChange('crop')}
                className="w-full"
              >
                <Crop className="w-4 h-4 mr-2" />
                Cắt ảnh
              </Button>
              <Button
                variant="outline"
                onClick={() => onEditModeChange('rotate')}
                className="w-full"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Xoay ảnh
              </Button>
              <Button
                variant="outline"
                onClick={() => onEditModeChange('resize')}
                className="w-full"
              >
                <Expand className="w-4 h-4 mr-2" />
                Thay đổi kích thước
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Crop Mode */}
      {editMode === 'crop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Cắt ảnh</h3>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditModeChange('none')}
            >
              <X className="w-4 h-4" />
            </Button> */}
          </div>
          
          {/* <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700">
            💡 Kéo trên ảnh để chọn vùng cắt. Kéo ra ngoài ảnh để mở rộng canvas.
          </div> */}

          {/* Crop Dimensions Info Display */}
          {edits.crop && (
            <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kích thước:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {edits.crop.width} × {edits.crop.height}
                </span>
              </div>
              {edits.cropAspectRatio && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tỉ lệ:</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {edits.cropAspectRatio.width}:{edits.cropAspectRatio.height}
                    <span className="text-slate-500 ml-2">
                      ({(edits.cropAspectRatio.width / edits.cropAspectRatio.height).toFixed(2)}:1)
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          <Separator className="my-4" />

          {/* Crop Background Color */}
          <div className="space-y-3">
            <Label htmlFor="crop-bg-color" className="text-sm font-medium">
              Màu nền mở rộng
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="crop-bg-color"
                type="color"
                value={edits.cropBackgroundColor}
                onChange={(e) => onEditChange('cropBackgroundColor', e.target.value)}
                onBlur={(e) => onEditCommit('cropBackgroundColor', e.target.value)}
                className="w-16 h-10 cursor-pointer"
                title="Chọn màu nền cho vùng mở rộng"
              />
              <div className="flex-1">
                <Input
                  type="text"
                  value={edits.cropBackgroundColor}
                  onChange={(e) => onEditChange('cropBackgroundColor', e.target.value)}
                  onBlur={(e) => onEditCommit('cropBackgroundColor', e.target.value)}
                  placeholder="#ffffff"
                  className="font-mono text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditCommit('cropBackgroundColor', '#ffffff')}
                title="Đặt lại màu trắng"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Màu sẽ hiển thị khi vùng cắt mở rộng ra ngoài ảnh gốc
            </p>
          </div>

          <Separator className="my-4" />

          {/* Aspect Ratio Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tỉ lệ khung hình</Label>
              <Button
                variant={edits.cropAspectRatioLocked ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const newLocked = !edits.cropAspectRatioLocked;
                  onEditChange('cropAspectRatioLocked', newLocked);
                  // If unlocking, clear the ratio
                  if (!newLocked) {
                    onEditChange('cropAspectRatio', null);
                  }
                  onEditCommit('cropAspectRatioLocked', newLocked);
                }}
                className="h-8"
                title={edits.cropAspectRatioLocked ? 'Mở khóa tỉ lệ' : 'Khóa tỉ lệ'}
              >
                {edits.cropAspectRatioLocked ? (
                  <><Lock className="w-3 h-3 mr-1" />Đã khóa</>
                ) : (
                  <><Unlock className="w-3 h-3 mr-1" />Tự do</>
                )}
              </Button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-semibold">Phím tắt:</span> L=Khóa/Mở, F=Tự do, 1-8=Tỉ lệ nhanh
            </div>

            {/* Current Ratio Display */}
            {edits.cropAspectRatio && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                <span className="text-slate-700">Tỉ lệ hiện tại:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-blue-600">
                    {formatRatio(edits.cropAspectRatio)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const flipped = flipRatioOrientation(edits.cropAspectRatio!);
                      onEditCommit('cropAspectRatio', flipped);
                    }}
                    className="h-6 w-6 p-0"
                    title="Đổi hướng tỉ lệ"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Preset Ratios */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Tỉ lệ thông dụng:</p>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIO_PRESETS.slice(0, 6).map((preset) => (
                  <Button
                    key={preset.id}
                    variant={
                      edits.cropAspectRatio &&
                      edits.cropAspectRatio.width === preset.ratio.width &&
                      edits.cropAspectRatio.height === preset.ratio.height
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => {
                      // Update both ratio and lock state together
                      onEditChange('cropAspectRatio', preset.ratio);
                      onEditChange('cropAspectRatioLocked', true);
                      // Then commit
                      onEditCommit('cropAspectRatio', preset.ratio);
                    }}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              {/* Second row of presets */}
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIO_PRESETS.slice(6).map((preset) => (
                  <Button
                    key={preset.id}
                    variant={
                      edits.cropAspectRatio &&
                      edits.cropAspectRatio.width === preset.ratio.width &&
                      edits.cropAspectRatio.height === preset.ratio.height
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => {
                      // Update both ratio and lock state together
                      onEditChange('cropAspectRatio', preset.ratio);
                      onEditChange('cropAspectRatioLocked', true);
                      // Then commit
                      onEditCommit('cropAspectRatio', preset.ratio);
                    }}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Ratio Input */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Tỉ lệ tùy chỉnh:</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={customRatioWidth}
                  onChange={(e) => setCustomRatioWidth(e.target.value)}
                  placeholder="W"
                  className="w-20 text-sm text-center"
                />
                <span className="text-slate-500">:</span>
                <Input
                  type="number"
                  min="1"
                  value={customRatioHeight}
                  onChange={(e) => setCustomRatioHeight(e.target.value)}
                  placeholder="H"
                  className="w-20 text-sm text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const w = parseInt(customRatioWidth);
                    const h = parseInt(customRatioHeight);
                    if (w > 0 && h > 0) {
                      const ratio: AspectRatio = { width: w, height: h };
                      // Update both ratio and lock state together
                      onEditChange('cropAspectRatio', ratio);
                      onEditChange('cropAspectRatioLocked', true);
                      // Then commit
                      onEditCommit('cropAspectRatio', ratio);
                    }
                  }}
                  disabled={
                    !customRatioWidth ||
                    !customRatioHeight ||
                    parseInt(customRatioWidth) <= 0 ||
                    parseInt(customRatioHeight) <= 0
                  }
                >
                  Áp dụng
                </Button>
              </div>
            </div>

            {/* Free Crop Button */}
            {edits.cropAspectRatioLocked && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEditChange('cropAspectRatioLocked', false);
                  onEditChange('cropAspectRatio', null);
                  onEditCommit('cropAspectRatioLocked', false);
                }}
                className="w-full"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Chuyển sang cắt tự do
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (onCropCancel) {
                  onCropCancel();
                } else if ((window as any).__cancelCrop) {
                  (window as any).__cancelCrop();
                } else {
                  onEditModeChange('none');
                }
              }}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              onClick={() => {
                if ((window as any).__confirmCrop) {
                  (window as any).__confirmCrop();
                } else if (onCropConfirm) {
                  onCropConfirm(edits.crop);
                } else {
                  onEditModeChange('none');
                }
              }}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Xong
            </Button>
          </div>
        </div>
      )}

      {/* Rotate Mode */}
      {editMode === 'rotate' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Xoay ảnh</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditModeChange('none')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Góc xoay
              </Label>
              <span className="text-sm text-slate-600">{edits.rotation}°</span>
            </div>
            <Slider
              value={[edits.rotation]}
              onValueChange={([value]: number[]) => onEditChange('rotation', value)}
              onValueCommit={([value]: number[]) => onEditCommit('rotation', value)}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditCommit('rotation', (edits.rotation - 90 + 360) % 360)}
              >
                -90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditCommit('rotation', (edits.rotation + 90) % 360)}
              >
                +90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditCommit('rotation', 0)}
              >
                Đặt lại
              </Button>
            </div>
          </div>

          <Button
            onClick={() => onEditModeChange('none')}
            className="w-full"
          >
            <Check className="w-4 h-4 mr-2" />
            Xong
          </Button>
        </div>
      )}

      {/* Resize Mode */}
      {editMode === 'resize' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Thay đổi kích thước</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditModeChange('none')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="resize-width">Chiều rộng (px)</Label>
              <Input
                id="resize-width"
                type="number"
                value={resizeWidth}
                onChange={(e) => setResizeWidth(parseInt(e.target.value) || 1)}
                min={1}
                max={10000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resize-height">Chiều cao (px)</Label>
              <Input
                id="resize-height"
                type="number"
                value={resizeHeight}
                onChange={(e) => setResizeHeight(parseInt(e.target.value) || 1)}
                min={1}
                max={10000}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onEditCommit('resize', null);
                onEditModeChange('none');
              }}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              onClick={() => {
                onEditCommit('resize', { width: resizeWidth, height: resizeHeight });
                onEditModeChange('none');
              }}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}