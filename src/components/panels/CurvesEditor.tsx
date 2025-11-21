import { useState, useRef, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface CurvesEditorProps {
  onClose: () => void;
  onApply: (curve: number[]) => void;
}

export function CurvesEditor({ onClose, onApply }: CurvesEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const pos = (i * width) / 4;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }

    // Draw diagonal reference line
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    
    sortedPoints.forEach((point, i) => {
      const x = (point.x / 255) * width;
      const y = height - (point.y / 255) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw control points
    sortedPoints.forEach((point, i) => {
      const x = (point.x / 255) * width;
      const y = height - (point.y / 255) * height;
      
      ctx.fillStyle = selectedPoint === i ? '#60a5fa' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [points, selectedPoint]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 255;
    const y = 255 - ((e.clientY - rect.top) / rect.height) * 255;

    // Check if clicking near existing point
    const clickThreshold = 10;
    const pointIndex = points.findIndex((p) => {
      const px = (p.x / 255) * rect.width;
      const py = rect.height - (p.y / 255) * rect.height;
      const dx = e.clientX - rect.left - px;
      const dy = e.clientY - rect.top - py;
      return Math.sqrt(dx * dx + dy * dy) < clickThreshold;
    });

    if (pointIndex !== -1) {
      setSelectedPoint(pointIndex);
    } else {
      // Add new point
      setPoints([...points, { x: Math.round(x), y: Math.round(y) }]);
    }
  }, [points]);

  const handleReset = () => {
    setPoints([
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ]);
    setSelectedPoint(null);
  };

  const handleApply = () => {
    // Generate curve lookup table
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const curve = new Array(256).fill(0).map((_, i) => {
      // Linear interpolation between points
      for (let j = 0; j < sortedPoints.length - 1; j++) {
        const p1 = sortedPoints[j];
        const p2 = sortedPoints[j + 1];
        if (i >= p1.x && i <= p2.x) {
          const t = (i - p1.x) / (p2.x - p1.x);
          return Math.round(p1.y + t * (p2.y - p1.y));
        }
      }
      return i;
    });
    
    onApply(curve);
    onClose();
  };

  // Draw curve on mount and update
  useState(() => {
    drawCurve();
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-xl w-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-gray-200">Đường cong (Curves)</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Canvas */}
          <div className="bg-gray-900 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              onClick={handleCanvasClick}
              onMouseMove={drawCurve}
              className="w-full h-auto cursor-crosshair"
            />
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 Nhấn vào đường để thêm điểm điều chỉnh</p>
            <p>💡 Click on the curve to add control points</p>
            <p>💡 Điểm ở góc có thể di chuyển</p>
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
