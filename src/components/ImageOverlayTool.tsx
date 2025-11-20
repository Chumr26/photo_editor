import { useState, useRef } from 'react';
import { ImageOverlay, EditValues, BlendMode } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, FlipHorizontal, FlipVertical, Image as ImageIcon } from 'lucide-react';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';

interface ImageOverlayToolProps {
  edits: EditValues;
  onEditChange: (updates: Partial<EditValues>) => void;
  onEditCommit: (updates: Partial<EditValues>) => void;
}

const blendModes: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Bình thường' },
  { value: 'multiply', label: 'Nhân' },
  { value: 'screen', label: 'Màn hình' },
  { value: 'overlay', label: 'Phủ lớp' },
  { value: 'darken', label: 'Tối hơn' },
  { value: 'lighten', label: 'Sáng hơn' },
  { value: 'color-dodge', label: 'Tránh màu' },
  { value: 'color-burn', label: 'Đốt màu' },
  { value: 'hard-light', label: 'Sáng mạnh' },
  { value: 'soft-light', label: 'Sáng nhẹ' },
  { value: 'difference', label: 'Khác biệt' },
  { value: 'exclusion', label: 'Loại trừ' },
];

export function ImageOverlayTool({ edits, onEditChange, onEditCommit }: ImageOverlayToolProps) {
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newOverlay: ImageOverlay = {
          id: `overlay-${Date.now()}`,
          imageData: event.target?.result as string,
          x: 50,
          y: 50,
          width: Math.min(img.width, 300),
          height: Math.min(img.height, 300),
          rotation: 0,
          opacity: 100,
          blendMode: 'normal',
          flipH: false,
          flipV: false,
        };
        const updatedOverlays = [...edits.imageOverlays, newOverlay];
        onEditCommit({ imageOverlays: updatedOverlays });
        setSelectedOverlayId(newOverlay.id);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleUpdateOverlay = (id: string, updates: Partial<ImageOverlay>, commit: boolean = false) => {
    const updatedOverlays = edits.imageOverlays.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    );
    if (commit) {
      onEditCommit({ imageOverlays: updatedOverlays });
    } else {
      onEditChange({ imageOverlays: updatedOverlays });
    }
  };

  const handleDeleteOverlay = (id: string) => {
    const updatedOverlays = edits.imageOverlays.filter(overlay => overlay.id !== id);
    onEditCommit({ imageOverlays: updatedOverlays });
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const currentIndex = edits.imageOverlays.findIndex(o => o.id === id);
    if (currentIndex === -1) return;

    const newOverlays = [...edits.imageOverlays];
    if (direction === 'up' && currentIndex < newOverlays.length - 1) {
      [newOverlays[currentIndex], newOverlays[currentIndex + 1]] = 
        [newOverlays[currentIndex + 1], newOverlays[currentIndex]];
    } else if (direction === 'down' && currentIndex > 0) {
      [newOverlays[currentIndex], newOverlays[currentIndex - 1]] = 
        [newOverlays[currentIndex - 1], newOverlays[currentIndex]];
    }
    onEditCommit({ imageOverlays: newOverlays });
  };

  const selectedOverlay = edits.imageOverlays.find(o => o.id === selectedOverlayId);

  return (
    <div className="p-6 space-y-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3>Ghép ảnh</h3>
        <Button size="sm" onClick={handleAddImage}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm ảnh
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {edits.imageOverlays.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">Chưa có ảnh nào</p>
          <p className="text-xs mt-1">Nhấn "Thêm ảnh" để bắt đầu</p>
        </div>
      ) : (
        <>
          {/* Image overlay list */}
          <div className="space-y-2 mb-4">
            <Label className="text-xs text-slate-600">
              Lớp ảnh ({edits.imageOverlays.length})
            </Label>
            {edits.imageOverlays.map((overlay, index) => (
              <div
                key={overlay.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedOverlayId === overlay.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedOverlayId(overlay.id)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={overlay.imageData}
                    alt={`Overlay ${index + 1}`}
                    className="w-12 h-12 object-cover rounded border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Ảnh #{index + 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      {overlay.blendMode === 'normal' ? 'Bình thường' : blendModes.find(m => m.value === overlay.blendMode)?.label}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleMoveLayer(overlay.id, 'up');
                      }}
                      disabled={index === edits.imageOverlays.length - 1}
                      className="h-6 w-6 p-0 text-xs"
                      title="Lên trên"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleMoveLayer(overlay.id, 'down');
                      }}
                      disabled={index === 0}
                      className="h-6 w-6 p-0 text-xs"
                      title="Xuống dưới"
                    >
                      ↓
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDeleteOverlay(overlay.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedOverlay && (
            <>
              <Separator />
              
              {/* Edit selected overlay */}
              <div className="space-y-4 mt-4">
                <Label>Chỉnh sửa lớp ảnh</Label>

                {/* Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={selectedOverlay.imageData}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Blend Mode */}
                <div>
                  <Label>Chế độ pha trộn</Label>
                  <Select
                    value={selectedOverlay.blendMode}
                    onValueChange={(value: string) => handleUpdateOverlay(selectedOverlay.id, {
                      blendMode: value as BlendMode
                    }, true)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blendModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Độ mờ</Label>
                    <span className="text-sm text-slate-600">{selectedOverlay.opacity}%</span>
                  </div>
                  <Slider
                    value={[selectedOverlay.opacity]}
                    onValueChange={([value]: number[]) => handleUpdateOverlay(selectedOverlay.id, { opacity: value })}
                    onValueCommit={([value]: number[]) => handleUpdateOverlay(selectedOverlay.id, { opacity: value }, true)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Vị trí X</Label>
                    <Input
                      type="number"
                      value={selectedOverlay.x}
                      onChange={(e) => handleUpdateOverlay(selectedOverlay.id, { x: parseInt(e.target.value) || 0 })}
                      onBlur={() => handleUpdateOverlay(selectedOverlay.id, {}, true)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Vị trí Y</Label>
                    <Input
                      type="number"
                      value={selectedOverlay.y}
                      onChange={(e) => handleUpdateOverlay(selectedOverlay.id, { y: parseInt(e.target.value) || 0 })}
                      onBlur={() => handleUpdateOverlay(selectedOverlay.id, {}, true)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Chiều rộng</Label>
                    <Input
                      type="number"
                      value={selectedOverlay.width}
                      onChange={(e) => handleUpdateOverlay(selectedOverlay.id, { width: parseInt(e.target.value) || 1 })}
                      onBlur={() => handleUpdateOverlay(selectedOverlay.id, {}, true)}
                      min={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Chiều cao</Label>
                    <Input
                      type="number"
                      value={selectedOverlay.height}
                      onChange={(e) => handleUpdateOverlay(selectedOverlay.id, { height: parseInt(e.target.value) || 1 })}
                      onBlur={() => handleUpdateOverlay(selectedOverlay.id, {}, true)}
                      min={1}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Góc xoay</Label>
                    <span className="text-sm text-slate-600">{selectedOverlay.rotation}°</span>
                  </div>
                  <Slider
                    value={[selectedOverlay.rotation]}
                    onValueChange={([value]: number[]) => handleUpdateOverlay(selectedOverlay.id, { rotation: value })}
                    onValueCommit={([value]: number[]) => handleUpdateOverlay(selectedOverlay.id, { rotation: value }, true)}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Flip */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedOverlay.flipH ? 'default' : 'outline'}
                    onClick={() => handleUpdateOverlay(selectedOverlay.id, { flipH: !selectedOverlay.flipH }, true)}
                    className="w-full"
                    size="sm"
                  >
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Lật ngang
                  </Button>
                  <Button
                    variant={selectedOverlay.flipV ? 'default' : 'outline'}
                    onClick={() => handleUpdateOverlay(selectedOverlay.id, { flipV: !selectedOverlay.flipV }, true)}
                    className="w-full"
                    size="sm"
                  >
                    <FlipVertical className="w-4 h-4 mr-2" />
                    Lật dọc
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
