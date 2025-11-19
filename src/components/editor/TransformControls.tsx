/**
 * TransformControls Component
 * 
 * Controls for transformations: flip horizontal, flip vertical, and rotation.
 * Extracted from EditorControls for better maintainability.
 */

import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FlipHorizontal2, FlipVertical2, RotateCw } from 'lucide-react';
import { EditValues } from '../../types/editor.types';

interface TransformControlsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
  onEditModeChange: (mode: 'none' | 'crop' | 'rotate' | 'resize') => void;
}

export function TransformControls({
  edits,
  onEditChange,
  onEditModeChange,
}: TransformControlsProps) {
  return (
    <div className="space-y-4">
      {/* Flip Controls */}
      <div className="space-y-3">
        <Label>Lật ảnh</Label>
        <div className="flex gap-2">
          <Button
            variant={edits.flipHorizontal ? 'default' : 'outline'}
            size="sm"
            onClick={() => onEditChange('flipHorizontal', !edits.flipHorizontal)}
            className="flex-1"
          >
            <FlipHorizontal2 className="w-4 h-4 mr-2" />
            Ngang
          </Button>
          <Button
            variant={edits.flipVertical ? 'default' : 'outline'}
            size="sm"
            onClick={() => onEditChange('flipVertical', !edits.flipVertical)}
            className="flex-1"
          >
            <FlipVertical2 className="w-4 h-4 mr-2" />
            Dọc
          </Button>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-slate-600" />
            Xoay
          </Label>
          <span className="text-sm text-slate-600">{edits.rotation}°</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditModeChange('rotate')}
          className="w-full"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Điều chỉnh góc xoay
        </Button>
      </div>
    </div>
  );
}
