import { EditValues } from '../App';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Droplet, Palette, Sun, Contrast, FlipHorizontal2, FlipVertical2, Crop, Maximize2, Frame, Expand, RotateCw, Check, X } from 'lucide-react';
import { useState } from 'react';

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditModeChange('none')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700">
            💡 Kéo trên ảnh để chọn vùng cắt. Kéo các góc để điều chỉnh kích thước.
          </div>

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