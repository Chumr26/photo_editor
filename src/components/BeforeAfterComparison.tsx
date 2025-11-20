import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { X, MoveHorizontal } from 'lucide-react';

interface BeforeAfterComparisonProps {
  originalImage: string;
  processedImage: string;
  onClose: () => void;
}

export function BeforeAfterComparison({ originalImage, processedImage, onClose }: BeforeAfterComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-medium">So sánh trước/sau</h3>
            <p className="text-sm text-slate-600 mt-1">Kéo thanh trượt để xem sự thay đổi</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Comparison container */}
        <div className="flex-1 p-6 overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-full rounded-lg overflow-hidden cursor-ew-resize select-none bg-slate-100"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
          >
            {/* After image (full) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={processedImage}
                alt="After"
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                Sau
              </div>
            </div>

            {/* Before image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden flex items-center justify-center"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={originalImage}
                alt="Before"
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                Trước
              </div>
            </div>

            {/* Slider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                <MoveHorizontal className="w-4 h-4 text-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
