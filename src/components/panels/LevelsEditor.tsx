import { useState, useRef, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface LevelsEditorProps {
  onClose: () => void;
  onApply: (levels: { inputMin: number; inputMax: number; outputMin: number; outputMax: number }) => void;
}

export function LevelsEditor({ onClose, onApply }: LevelsEditorProps) {
  const [inputMin, setInputMin] = useState(0);
  const [inputMax, setInputMax] = useState(255);
  const [outputMin, setOutputMin] = useState(0);
  const [outputMax, setOutputMax] = useState(255);
  const histogramRef = useRef<HTMLCanvasElement>(null);

  // Draw histogram (simplified - would normally analyze actual image data)
  useEffect(() => {
    const canvas = histogramRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(1, '#fff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - 20, width, 20);

    // Draw sample histogram (bell curve simulation)
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(0, height - 20);
    
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * width;
      // Gaussian-like distribution
      const value = Math.exp(-Math.pow((i - 128) / 50, 2));
      const y = height - 20 - value * (height - 40);
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height - 20);
    ctx.closePath();
    ctx.fill();

    // Draw input range indicators
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    const inputMinX = (inputMin / 255) * width;
    const inputMaxX = (inputMax / 255) * width;
    
    ctx.beginPath();
    ctx.moveTo(inputMinX, 0);
    ctx.lineTo(inputMinX, height - 20);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(inputMaxX, 0);
    ctx.lineTo(inputMaxX, height - 20);
    ctx.stroke();
  }, [inputMin, inputMax]);

  const handleReset = () => {
    setInputMin(0);
    setInputMax(255);
    setOutputMin(0);
    setOutputMax(255);
  };

  const handleApply = () => {
    onApply({ inputMin, inputMax, outputMin, outputMax });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-xl w-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-gray-200">Cấp độ (Levels)</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Histogram */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Biểu đồ (Histogram)
            </label>
            <div className="bg-gray-900 rounded-lg p-4">
              <canvas
                ref={histogramRef}
                width={400}
                height={150}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Input Levels */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300 block">
              Cấp độ đầu vào (Input Levels)
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tối thiểu (Min)</label>
                <input
                  type="number"
                  min="0"
                  max={inputMax - 1}
                  value={inputMin}
                  onChange={(e) => setInputMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tối đa (Max)</label>
                <input
                  type="number"
                  min={inputMin + 1}
                  max="255"
                  value={inputMax}
                  onChange={(e) => setInputMax(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="255"
              value={inputMin}
              onChange={(e) => setInputMin(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Output Levels */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300 block">
              Cấp độ đầu ra (Output Levels)
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tối thiểu (Min)</label>
                <input
                  type="number"
                  min="0"
                  max={outputMax - 1}
                  value={outputMin}
                  onChange={(e) => setOutputMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tối đa (Max)</label>
                <input
                  type="number"
                  min={outputMin + 1}
                  max="255"
                  value={outputMax}
                  onChange={(e) => setOutputMax(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="h-6 rounded" style={{
              background: `linear-gradient(to right, rgb(${outputMin}, ${outputMin}, ${outputMin}), rgb(${outputMax}, ${outputMax}, ${outputMax}))`
            }} />
          </div>

          {/* Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 Điều chỉnh Input để tăng độ tương phản</p>
            <p>💡 Adjust Input levels to increase contrast</p>
            <p>💡 Điều chỉnh Output để thay đổi phạm vi tông màu</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại (Reset)</span>
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Áp dụng (Apply)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
