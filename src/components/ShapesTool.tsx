import { useState } from 'react';
import { Shape, EditValues } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Square, Circle, ArrowRight, Minus, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';

interface ShapesToolProps {
  edits: EditValues;
  onEditChange: (updates: Partial<EditValues>) => void;
  onEditCommit: (updates: Partial<EditValues>) => void;
}

export function ShapesTool({ edits, onEditChange, onEditCommit }: ShapesToolProps) {
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fillColor, setFillColor] = useState('transparent');

  const handleAddShape = (type: Shape['type']) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'rectangle' || type === 'circle' ? 100 : undefined,
      height: type === 'rectangle' || type === 'circle' ? 100 : undefined,
      x2: type === 'line' || type === 'arrow' ? 200 : undefined,
      y2: type === 'line' || type === 'arrow' ? 200 : undefined,
      strokeColor,
      strokeWidth,
      fillColor: type === 'rectangle' || type === 'circle' ? fillColor : undefined,
      opacity: 100,
    };
    const updatedShapes = [...edits.shapes, newShape];
    onEditCommit({ shapes: updatedShapes });
    setSelectedShapeId(newShape.id);
  };

  const handleUpdateShape = (id: string, updates: Partial<Shape>, commit: boolean = false) => {
    const updatedShapes = edits.shapes.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    if (commit) {
      onEditCommit({ shapes: updatedShapes });
    } else {
      onEditChange({ shapes: updatedShapes });
    }
  };

  const handleDeleteShape = (id: string) => {
    const updatedShapes = edits.shapes.filter(s => s.id !== id);
    onEditCommit({ shapes: updatedShapes });
    if (selectedShapeId === id) {
      setSelectedShapeId(null);
    }
  };

  const selectedShape = edits.shapes.find(s => s.id === selectedShapeId);

  return (
    <div className="p-6 space-y-4 border-t border-slate-200">
      <h3 className="mb-4">Hình dạng</h3>

      {/* Shape tool buttons */}
      <div className="space-y-3">
        <Label>Thêm hình dạng</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleAddShape('rectangle')}
            className="w-full"
            size="sm"
          >
            <Square className="w-4 h-4 mr-2" />
            Chữ nhật
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAddShape('circle')}
            className="w-full"
            size="sm"
          >
            <Circle className="w-4 h-4 mr-2" />
            Hình tròn
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAddShape('line')}
            className="w-full"
            size="sm"
          >
            <Minus className="w-4 h-4 mr-2" />
            Đường thẳng
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAddShape('arrow')}
            className="w-full"
            size="sm"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Mũi tên
          </Button>
        </div>
      </div>

      <Separator />

      {/* Default stroke settings */}
      <div className="space-y-3">
        <Label>Cài đặt mặc định</Label>
        
        <div>
          <Label className="text-xs text-slate-600">Màu nét vẽ</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="h-10 w-16 p-1"
            />
            <Input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-600">Độ dày nét</Label>
          <Input
            type="number"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value) || 1)}
            min={1}
            max={50}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-slate-600">Màu tô</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={fillColor === 'transparent' ? '#ffffff' : fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="h-10 w-16 p-1"
            />
            <Input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              placeholder="transparent"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Shapes list */}
      <div className="space-y-2">
        <Label>Các hình đã vẽ ({edits.shapes.length})</Label>
        {edits.shapes.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            Chưa có hình vẽ nào
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {edits.shapes.map((shape, index) => (
                <div
                  key={shape.id}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    selectedShapeId === shape.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedShapeId(shape.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {shape.type === 'rectangle' && 'Chữ nhật'}
                      {shape.type === 'circle' && 'Hình tròn'}
                      {shape.type === 'line' && 'Đường thẳng'}
                      {shape.type === 'arrow' && 'Mũi tên'}
                      {' #'}{index + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteShape(shape.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedShape && (
              <>
                <Separator className="my-3" />
                
                {/* Edit selected shape */}
                <div className="space-y-3">
                  <Label>Chỉnh sửa hình</Label>
                  
                  <div>
                    <Label className="text-xs text-slate-600">Màu nét vẽ</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedShape.strokeColor}
                        onChange={(e) => handleUpdateShape(selectedShape.id, { strokeColor: e.target.value }, true)}
                        className="h-10 w-16 p-1"
                      />
                      <Input
                        type="text"
                        value={selectedShape.strokeColor}
                        onChange={(e) => handleUpdateShape(selectedShape.id, { strokeColor: e.target.value })}
                        onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">Độ dày nét</Label>
                    <Input
                      type="number"
                      value={selectedShape.strokeWidth}
                      onChange={(e) => handleUpdateShape(selectedShape.id, { strokeWidth: parseInt(e.target.value) || 1 })}
                      onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                      min={1}
                      max={50}
                      className="mt-1"
                    />
                  </div>

                  {selectedShape.fillColor !== undefined && (
                    <div>
                      <Label className="text-xs text-slate-600">Màu tô</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={selectedShape.fillColor === 'transparent' ? '#ffffff' : selectedShape.fillColor}
                          onChange={(e) => handleUpdateShape(selectedShape.id, { fillColor: e.target.value }, true)}
                          className="h-10 w-16 p-1"
                        />
                        <Input
                          type="text"
                          value={selectedShape.fillColor}
                          onChange={(e) => handleUpdateShape(selectedShape.id, { fillColor: e.target.value })}
                          onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                          placeholder="transparent"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-slate-600">Độ mờ</Label>
                      <span className="text-xs text-slate-600">{selectedShape.opacity}%</span>
                    </div>
                    <Slider
                      value={[selectedShape.opacity]}
                      onValueChange={([value]: number[]) => handleUpdateShape(selectedShape.id, { opacity: value })}
                      onValueCommit={([value]: number[]) => handleUpdateShape(selectedShape.id, { opacity: value }, true)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-slate-600">X</Label>
                      <Input
                        type="number"
                        value={selectedShape.x}
                        onChange={(e) => handleUpdateShape(selectedShape.id, { x: parseInt(e.target.value) || 0 })}
                        onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Y</Label>
                      <Input
                        type="number"
                        value={selectedShape.y}
                        onChange={(e) => handleUpdateShape(selectedShape.id, { y: parseInt(e.target.value) || 0 })}
                        onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {selectedShape.width !== undefined && selectedShape.height !== undefined && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-600">Rộng</Label>
                        <Input
                          type="number"
                          value={selectedShape.width}
                          onChange={(e) => handleUpdateShape(selectedShape.id, { width: parseInt(e.target.value) || 1 })}
                          onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                          min={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Cao</Label>
                        <Input
                          type="number"
                          value={selectedShape.height}
                          onChange={(e) => handleUpdateShape(selectedShape.id, { height: parseInt(e.target.value) || 1 })}
                          onBlur={() => handleUpdateShape(selectedShape.id, {}, true)}
                          min={1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
