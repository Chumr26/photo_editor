import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Download, Image as ImageIcon, X } from 'lucide-react';

interface ExportModalProps {
  processedImage: string;
  onClose: () => void;
}

export function ExportModal({ processedImage, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState(0.9);

  const handleDownload = () => {
    if (!processedImage) return;

    // Create a temporary canvas to convert format if needed
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // For JPG, fill white background
      if (format === 'jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      // Trigger download
      const link = document.createElement('a');
      link.download = `edited-image-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      onClose();
    };
    img.src = processedImage;
  };

  const getEstimatedSize = () => {
    if (!processedImage) return '0 KB';
    
    const base64Length = processedImage.length - (processedImage.indexOf(',') + 1);
    const sizeInBytes = (base64Length * 3) / 4;
    const sizeInKB = sizeInBytes / 1024;
    
    if (sizeInKB > 1024) {
      return `~${(sizeInKB / 1024).toFixed(1)} MB`;
    }
    return `~${sizeInKB.toFixed(0)} KB`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tải về ảnh</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center bg-slate-100 rounded-lg p-4">
            {processedImage ? (
              <img
                src={processedImage}
                alt="Preview"
                className="max-w-full max-h-48 rounded shadow-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Định dạng</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'png' | 'jpg')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="png" id="png" />
                <Label htmlFor="png" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>PNG</div>
                      <div className="text-xs text-slate-500">Chất lượng cao, hỗ trợ trong suốt</div>
                    </div>
                    {format === 'png' && (
                      <span className="text-xs text-slate-500">{getEstimatedSize()}</span>
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="jpg" id="jpg" />
                <Label htmlFor="jpg" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>JPG</div>
                      <div className="text-xs text-slate-500">Dung lượng nhỏ hơn, không có nền trong suốt</div>
                    </div>
                    {format === 'jpg' && (
                      <span className="text-xs text-slate-500">{getEstimatedSize()}</span>
                    )}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quality Settings for JPG */}
          {format === 'jpg' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chất lượng</Label>
                <span className="text-sm text-slate-600">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Tải về
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
