import { EditValues } from '../App';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Droplet, Palette, Sun, Contrast, FlipHorizontal2, FlipVertical2, Crop, Maximize2, Frame, Expand } from 'lucide-react';

interface EditorControlsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
  onOpenCrop: () => void;
  onOpenResize: () => void;
  onOpenImageResize: () => void;
}

export function EditorControls({ edits, onEditChange, onOpenCrop, onOpenResize, onOpenImageResize }: EditorControlsProps) {
  return (
    <div className="p-6 space-y-6">
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
            onValueChange={([value]) => onEditChange('blur', value)}
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
            onCheckedChange={(checked) => onEditChange('grayscale', checked)}
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
            onValueChange={([value]) => onEditChange('brightness', value)}
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
            onValueChange={([value]) => onEditChange('contrast', value)}
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
              onClick={() => onEditChange('flipH', !edits.flipH)}
              className="w-full"
            >
              <FlipHorizontal2 className="w-4 h-4 mr-2" />
              Ngang
            </Button>
            <Button
              variant={edits.flipV ? 'default' : 'outline'}
              onClick={() => onEditChange('flipV', !edits.flipV)}
              className="w-full"
            >
              <FlipVertical2 className="w-4 h-4 mr-2" />
              Dọc
            </Button>
          </div>
        </div>

        {/* Crop & Rotate */}
        <div className="space-y-3">
          <Label>Biến đổi</Label>
          <Button
            variant="outline"
            onClick={onOpenCrop}
            className="w-full"
          >
            <Crop className="w-4 h-4 mr-2" />
            Cắt & Xoay
          </Button>
          <Button
            variant="outline"
            onClick={onOpenImageResize}
            className="w-full"
          >
            <Expand className="w-4 h-4 mr-2" />
            Thay đổi kích thước ảnh
          </Button>
          <Button
            variant="outline"
            onClick={onOpenResize}
            className="w-full"
          >
            <Frame className="w-4 h-4 mr-2" />
            Thay đổi khung
          </Button>
        </div>
      </div>
    </div>
  );
}