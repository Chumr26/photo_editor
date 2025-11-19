/**
 * ToolButtons Component
 * 
 * Tool selection buttons for crop, frame, and resize operations.
 * Extracted from EditorControls for better maintainability.
 */

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Crop, Frame, Maximize2 } from 'lucide-react';

interface ToolButtonsProps {
  onEditModeChange: (mode: 'none' | 'crop' | 'rotate' | 'resize') => void;
}

export function ToolButtons({ onEditModeChange }: ToolButtonsProps) {
  return (
    <div className="space-y-3">
      <Label>Công cụ</Label>
      <div className="grid gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditModeChange('crop')}
          className="w-full justify-start"
        >
          <Crop className="w-4 h-4 mr-2" />
          Cắt ảnh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditModeChange('resize')}
          className="w-full justify-start"
        >
          <Frame className="w-4 h-4 mr-2" />
          Thay đổi kích thước khung
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditModeChange('resize')}
          className="w-full justify-start"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Thay đổi kích thước ảnh
        </Button>
      </div>
    </div>
  );
}
