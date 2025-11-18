/**
 * RotateModeControls Component
 * 
 * Controls displayed when in rotation mode.
 * Provides input and quick rotation buttons.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Check, X, RotateCw } from 'lucide-react';
import { EditValues } from '../../types/editor.types';

interface RotateModeControlsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function RotateModeControls({
  edits,
  onEditChange,
  onApply,
  onCancel,
}: RotateModeControlsProps) {
  const [rotationInput, setRotationInput] = useState(edits.rotation);

  const handleRotationChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setRotationInput(numValue);
    onEditChange('rotation', numValue);
  };

  const quickRotate = (degrees: number) => {
    const newRotation = (edits.rotation + degrees) % 360;
    setRotationInput(newRotation);
    onEditChange('rotation', newRotation);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Góc xoay (độ)</Label>
        <Input
          type="number"
          value={rotationInput}
          onChange={(e) => handleRotationChange(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => quickRotate(90)}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          90°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => quickRotate(180)}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          180°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => quickRotate(270)}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          270°
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          Áp dụng
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
      </div>
    </div>
  );
}
