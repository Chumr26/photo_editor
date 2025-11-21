import { useState } from 'react';
import { X, Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextEditorProps {
  onClose: () => void;
  onApply: (textConfig: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
    x: number;
    y: number;
  }) => void;
  initialData?: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
    x: number;
    y: number;
  };
  initialX?: number;
  initialY?: number;
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Comic Sans MS',
  'Impact',
  'Palatino',
];

export function TextEditor({ onClose, onApply, initialData, initialX = 100, initialY = 100 }: TextEditorProps) {
  const [text, setText] = useState(initialData?.text || 'Nhập chữ...');
  const [fontSize, setFontSize] = useState(initialData?.fontSize || 48);
  const [fontFamily, setFontFamily] = useState(initialData?.fontFamily || 'Arial');
  const [color, setColor] = useState(initialData?.color || '#000000');
  const [fontWeight, setFontWeight] = useState(initialData?.fontWeight || '400');
  const [fontStyle, setFontStyle] = useState(initialData?.fontStyle || 'normal');
  const [textAlign, setTextAlign] = useState(initialData?.textAlign || 'left');

  const handleApply = () => {
    if (!text.trim()) return;
    
    onApply({
      text,
      fontSize,
      fontFamily,
      color,
      fontWeight,
      fontStyle,
      textAlign,
      x: initialData?.x || initialX,
      y: initialData?.y || initialY,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-[#2a2a2a]">
          <h3 className="text-gray-200 flex items-center gap-2">
            <Type className="w-5 h-5" />
            <span>{initialData ? 'Chỉnh sửa chữ (Edit Text)' : 'Thêm chữ (Add Text)'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Text Preview */}
          <div className="bg-white rounded-lg p-8 min-h-[150px] flex items-center justify-center">
            <p
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                color,
                fontWeight,
                fontStyle,
                textAlign: textAlign as any,
                width: '100%',
              }}
            >
              {text || 'Nhập chữ...'}
            </p>
          </div>

          {/* Text Input */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Nội dung (Text Content)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập chữ..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Phông chữ (Font Family)
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-300">
                Kích thước (Font Size)
              </label>
              <span className="text-xs text-gray-400">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Màu chữ (Text Color)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Formatting Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Font Weight */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Độ đậm (Weight)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFontWeight('400')}
                  className={`px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors ${
                    fontWeight === '400'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setFontWeight('700')}
                  className={`px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors ${
                    fontWeight === '700'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                  Bold
                </button>
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Kiểu chữ (Style)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFontStyle('normal')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    fontStyle === 'normal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setFontStyle('italic')}
                  className={`px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors ${
                    fontStyle === 'italic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                  Italic
                </button>
              </div>
            </div>
          </div>

          {/* Text Align */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Căn chỉnh (Text Align)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTextAlign('left')}
                className={`px-3 py-2 rounded text-sm flex items-center justify-center transition-colors ${
                  textAlign === 'left'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`px-3 py-2 rounded text-sm flex items-center justify-center transition-colors ${
                  textAlign === 'center'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`px-3 py-2 rounded text-sm flex items-center justify-center transition-colors ${
                  textAlign === 'right'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 Chữ sẽ xuất hiện ở tâm canvas</p>
            <p>💡 Text will appear at canvas center</p>
            <p>💡 Bạn có thể kéo thả để di chuyển sau khi thêm</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sticky bottom-0 bg-[#2a2a2a] py-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
            >
              Hủy (Cancel)
            </button>
            <button
              onClick={handleApply}
              disabled={!text.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? 'Lưu thay đổi (Save Changes)' : 'Thêm chữ (Add Text)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
