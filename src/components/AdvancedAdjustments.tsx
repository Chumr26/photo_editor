import { EditValues } from '../App';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Palette, Thermometer, SunDim, SunMedium, Circle, Focus } from 'lucide-react';

interface AdvancedAdjustmentsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
  onEditCommit: (key: keyof EditValues, value: any) => void;
}

export function AdvancedAdjustments({ edits, onEditChange, onEditCommit }: AdvancedAdjustmentsProps) {
  return (
    <div className="p-6 space-y-6 border-t border-slate-200">
      <div>
        <h3 className="mb-4">Điều chỉnh nâng cao</h3>

        {/* Saturation */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-600" />
              Độ bão hòa
            </Label>
            <span className="text-sm text-slate-600">{edits.saturation}%</span>
          </div>
          <Slider
            value={[edits.saturation]}
            onValueChange={([value]: number[]) => onEditChange('saturation', value)}
            onValueCommit={([value]: number[]) => onEditCommit('saturation', value)}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>

        {/* Hue */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-600" />
              Sắc độ
            </Label>
            <span className="text-sm text-slate-600">{edits.hue}°</span>
          </div>
          <Slider
            value={[edits.hue]}
            onValueChange={([value]: number[]) => onEditChange('hue', value)}
            onValueCommit={([value]: number[]) => onEditCommit('hue', value)}
            min={-180}
            max={180}
            step={1}
            className="w-full"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-slate-600" />
              Nhiệt độ màu
            </Label>
            <span className="text-sm text-slate-600">{edits.temperature > 0 ? '+' : ''}{edits.temperature}</span>
          </div>
          <Slider
            value={[edits.temperature]}
            onValueChange={([value]: number[]) => onEditChange('temperature', value)}
            onValueCommit={([value]: number[]) => onEditCommit('temperature', value)}
            min={-100}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <Separator className="my-6" />

        {/* Shadows */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <SunDim className="w-4 h-4 text-slate-600" />
              Bóng tối
            </Label>
            <span className="text-sm text-slate-600">{edits.shadows > 0 ? '+' : ''}{edits.shadows}</span>
          </div>
          <Slider
            value={[edits.shadows]}
            onValueChange={([value]: number[]) => onEditChange('shadows', value)}
            onValueCommit={([value]: number[]) => onEditCommit('shadows', value)}
            min={-100}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Highlights */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-slate-600" />
              Điểm sáng
            </Label>
            <span className="text-sm text-slate-600">{edits.highlights > 0 ? '+' : ''}{edits.highlights}</span>
          </div>
          <Slider
            value={[edits.highlights]}
            onValueChange={([value]: number[]) => onEditChange('highlights', value)}
            onValueCommit={([value]: number[]) => onEditCommit('highlights', value)}
            min={-100}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <Separator className="my-6" />

        {/* Vignette */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-slate-600" />
              Viền tối
            </Label>
            <span className="text-sm text-slate-600">{edits.vignette}%</span>
          </div>
          <Slider
            value={[edits.vignette]}
            onValueChange={([value]: number[]) => onEditChange('vignette', value)}
            onValueCommit={([value]: number[]) => onEditCommit('vignette', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Sharpen */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Focus className="w-4 h-4 text-slate-600" />
              Độ sắc nét
            </Label>
            <span className="text-sm text-slate-600">{edits.sharpen}%</span>
          </div>
          <Slider
            value={[edits.sharpen]}
            onValueChange={([value]: number[]) => onEditChange('sharpen', value)}
            onValueCommit={([value]: number[]) => onEditCommit('sharpen', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
