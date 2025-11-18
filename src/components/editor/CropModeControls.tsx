/**
 * CropModeControls Component
 * 
 * Controls displayed when in crop mode.
 * Provides instructions and action buttons for crop operations.
 */

import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';

interface CropModeControlsProps {
  onApply: () => void;
  onCancel: () => void;
}

export function CropModeControls({ onApply, onCancel }: CropModeControlsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          Kéo các góc hoặc cạnh để điều chỉnh vùng cắt, hoặc kéo vào bên trong để di chuyển.
        </p>
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
