/**
 * FilterControls Component
 * 
 * Controls for applying filters: blur, grayscale, brightness, and contrast.
 * Extracted from EditorControls for better maintainability.
 */

import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Droplet, Palette, Sun, Contrast } from 'lucide-react';
import { EditValues } from '../../types/editor.types';

interface FilterControlsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
}

export function FilterControls({ edits, onEditChange }: FilterControlsProps) {
  return (
    <div className="space-y-6">
      {/* Blur */}
      <div className="space-y-3">
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
          min={0}
          max={20}
          step={1}
          className="w-full"
        />
      </div>

      {/* Grayscale */}
      <div className="flex items-center justify-between">
        <Label htmlFor="grayscale" className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-600" />
          Đen trắng
        </Label>
        <Switch
          id="grayscale"
          checked={edits.grayscale}
          onCheckedChange={(checked: boolean) => onEditChange('grayscale', checked)}
        />
      </div>

      {/* Brightness */}
      <div className="space-y-3">
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
          min={0}
          max={200}
          step={1}
          className="w-full"
        />
      </div>

      {/* Contrast */}
      <div className="space-y-3">
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
          min={0}
          max={200}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}
