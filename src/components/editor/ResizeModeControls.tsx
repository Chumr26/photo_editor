/**
 * ResizeModeControls Component
 * 
 * Controls displayed when in resize mode.
 * Provides width and height inputs with preserve aspect ratio option.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Check, X } from 'lucide-react';
import { EditValues } from '../../types/editor.types';

interface ResizeModeControlsProps {
  edits: EditValues;
  onEditChange: (key: keyof EditValues, value: any) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ResizeModeControls({
  edits,
  onEditChange,
  onApply,
  onCancel,
}: ResizeModeControlsProps) {
  const [resizeWidth, setResizeWidth] = useState(edits.resize?.width || 1000);
  const [resizeHeight, setResizeHeight] = useState(edits.resize?.height || 1000);

  const handleResize = () => {
    onEditChange('resize', {
      width: resizeWidth,
      height: resizeHeight,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Chiều rộng (px)</Label>
        <Input
          type="number"
          value={resizeWidth}
          onChange={(e) => setResizeWidth(parseInt(e.target.value) || 0)}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Chiều cao (px)</Label>
        <Input
          type="number"
          value={resizeHeight}
          onChange={(e) => setResizeHeight(parseInt(e.target.value) || 0)}
          className="mt-2"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            handleResize();
            onApply();
          }}
          className="flex-1"
        >
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
