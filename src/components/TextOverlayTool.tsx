import { useState } from 'react';
import { TextOverlay, EditValues } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';

interface TextOverlayToolProps {
  edits: EditValues;
  onEditChange: (updates: Partial<EditValues>) => void;
  onEditCommit: (updates: Partial<EditValues>) => void;
  selectedTextId?: string | null;
  onTextSelect?: (textId: string | null) => void;
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
];

export function TextOverlayTool({ 
  edits, 
  onEditChange, 
  onEditCommit,
  selectedTextId: externalSelectedTextId,
  onTextSelect
}: TextOverlayToolProps) {
  const [internalSelectedTextId, setInternalSelectedTextId] = useState<string | null>(null);
  
  // Use external selection if provided, otherwise use internal
  const selectedTextId = externalSelectedTextId !== undefined ? externalSelectedTextId : internalSelectedTextId;
  
  // Helper to update selection
  const handleTextSelect = (textId: string | null) => {
    if (onTextSelect) {
      onTextSelect(textId);
    } else {
      setInternalSelectedTextId(textId);
    }
  };

  const handleAddText = () => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'Văn bản mới',
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      rotation: 0,
      opacity: 100,
    };
    const updatedTexts = [...edits.textOverlays, newText];
    onEditCommit({ textOverlays: updatedTexts });
    handleTextSelect(newText.id);
  };

  const handleUpdateText = (id: string, updates: Partial<TextOverlay>, commit: boolean = false) => {
    const updatedTexts = edits.textOverlays.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    if (commit) {
      onEditCommit({ textOverlays: updatedTexts });
    } else {
      onEditChange({ textOverlays: updatedTexts });
    }
  };

  const handleDeleteText = (id: string) => {
    const updatedTexts = edits.textOverlays.filter(t => t.id !== id);
    onEditCommit({ textOverlays: updatedTexts });
    if (selectedTextId === id) {
      handleTextSelect(null);
    }
  };

  const selectedText = edits.textOverlays.find(t => t.id === selectedTextId);

  return (
    <div className="p-6 space-y-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3>Văn bản</h3>
        <Button size="sm" onClick={handleAddText}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm văn bản
        </Button>
      </div>

      {edits.textOverlays.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Chưa có văn bản nào</p>
          <p className="text-xs mt-1">Nhấn "Thêm văn bản" để bắt đầu</p>
        </div>
      ) : (
        <>
          {/* Text list */}
          <div className="space-y-2 mb-4">
            {edits.textOverlays.map((text) => (
              <div
                key={text.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTextId === text.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleTextSelect(text.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{text.text}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDeleteText(text.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedText && (
            <>
              <Separator />
              
              {/* Edit selected text */}
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nội dung</Label>
                  <Input
                    value={selectedText.text}
                    onChange={(e) => handleUpdateText(selectedText.id, { text: e.target.value })}
                    onBlur={() => handleUpdateText(selectedText.id, {}, true)}
                    placeholder="Nhập văn bản..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Kích thước</Label>
                    <Input
                      type="number"
                      value={selectedText.fontSize}
                      onChange={(e) => handleUpdateText(selectedText.id, { fontSize: parseInt(e.target.value) || 16 })}
                      onBlur={() => handleUpdateText(selectedText.id, {}, true)}
                      min={8}
                      max={200}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Màu sắc</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedText.color}
                        onChange={(e) => handleUpdateText(selectedText.id, { color: e.target.value }, true)}
                        className="h-10 w-16 p-1"
                      />
                      <Input
                        type="text"
                        value={selectedText.color}
                        onChange={(e) => handleUpdateText(selectedText.id, { color: e.target.value })}
                        onBlur={() => handleUpdateText(selectedText.id, {}, true)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Phông chữ</Label>
                  <Select
                    value={selectedText.fontFamily}
                    onValueChange={(value: string) => handleUpdateText(selectedText.id, { fontFamily: value }, true)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedText.fontWeight === 'bold' ? 'default' : 'outline'}
                    onClick={() =>
                      handleUpdateText(selectedText.id, {
                        fontWeight: selectedText.fontWeight === 'bold' ? 'normal' : 'bold',
                      }, true)
                    }
                    className="flex-1"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedText.fontStyle === 'italic' ? 'default' : 'outline'}
                    onClick={() =>
                      handleUpdateText(selectedText.id, {
                        fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic',
                      }, true)
                    }
                    className="flex-1"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedText.textAlign === 'left' ? 'default' : 'outline'}
                    onClick={() => handleUpdateText(selectedText.id, { textAlign: 'left' }, true)}
                    className="flex-1"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedText.textAlign === 'center' ? 'default' : 'outline'}
                    onClick={() => handleUpdateText(selectedText.id, { textAlign: 'center' }, true)}
                    className="flex-1"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedText.textAlign === 'right' ? 'default' : 'outline'}
                    onClick={() => handleUpdateText(selectedText.id, { textAlign: 'right' }, true)}
                    className="flex-1"
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Vị trí X</Label>
                    <Input
                      type="number"
                      value={selectedText.x}
                      onChange={(e) => handleUpdateText(selectedText.id, { x: parseInt(e.target.value) || 0 })}
                      onBlur={() => handleUpdateText(selectedText.id, {}, true)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Vị trí Y</Label>
                    <Input
                      type="number"
                      value={selectedText.y}
                      onChange={(e) => handleUpdateText(selectedText.id, { y: parseInt(e.target.value) || 0 })}
                      onBlur={() => handleUpdateText(selectedText.id, {}, true)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Góc xoay</Label>
                    <span className="text-sm text-slate-600">{selectedText.rotation}°</span>
                  </div>
                  <Slider
                    value={[selectedText.rotation]}
                    onValueChange={([value]: number[]) => handleUpdateText(selectedText.id, { rotation: value })}
                    onValueCommit={([value]: number[]) => handleUpdateText(selectedText.id, { rotation: value }, true)}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Độ mờ</Label>
                    <span className="text-sm text-slate-600">{selectedText.opacity}%</span>
                  </div>
                  <Slider
                    value={[selectedText.opacity]}
                    onValueChange={([value]: number[]) => handleUpdateText(selectedText.id, { opacity: value })}
                    onValueCommit={([value]: number[]) => handleUpdateText(selectedText.id, { opacity: value }, true)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
