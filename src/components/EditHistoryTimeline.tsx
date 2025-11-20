import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { EditValues } from '../App';
import { 
  History, 
  Check, 
  Circle,
  Slash,
  Sun,
  Contrast,
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
  Crop,
  Maximize2,
  Image as ImageIcon,
  Sparkles,
  X
} from 'lucide-react';

interface EditHistoryTimelineProps {
  editHistory: EditValues[];
  currentIndex: number;
  onJumpToIndex: (index: number) => void;
  onClose: () => void;
}

export function EditHistoryTimeline({ 
  editHistory, 
  currentIndex, 
  onJumpToIndex,
  onClose 
}: EditHistoryTimelineProps) {
  
  const getEditDescription = (edit: EditValues, index: number): string => {
    if (index === 0) return 'Trạng thái ban đầu';
    
    const prev = editHistory[index - 1];
    const changes: string[] = [];
    
    if (edit.blur !== prev.blur) {
      changes.push(`Làm mờ: ${edit.blur}px`);
    }
    if (edit.grayscale !== prev.grayscale) {
      changes.push(edit.grayscale ? 'Bật đen trắng' : 'Tắt đen trắng');
    }
    if (edit.brightness !== prev.brightness) {
      changes.push(`Độ sáng: ${edit.brightness}%`);
    }
    if (edit.contrast !== prev.contrast) {
      changes.push(`Độ tương phản: ${edit.contrast}%`);
    }
    if (edit.flipH !== prev.flipH) {
      changes.push(edit.flipH ? 'Lật ngang' : 'Bỏ lật ngang');
    }
    if (edit.flipV !== prev.flipV) {
      changes.push(edit.flipV ? 'Lật dọc' : 'Bỏ lật dọc');
    }
    if (edit.rotation !== prev.rotation) {
      changes.push(`Xoay: ${edit.rotation}°`);
    }
    if (edit.crop !== prev.crop) {
      if (edit.crop) {
        changes.push('Cắt ảnh');
      } else {
        changes.push('Bỏ cắt ảnh');
      }
    }
    if (edit.frame !== prev.frame) {
      if (edit.frame) {
        changes.push(`Khung: ${edit.frame.width}x${edit.frame.height}`);
      } else {
        changes.push('Bỏ khung');
      }
    }
    if (edit.resize !== prev.resize) {
      if (edit.resize) {
        changes.push(`Resize: ${edit.resize.width}x${edit.resize.height}`);
      } else {
        changes.push('Bỏ resize');
      }
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Chỉnh sửa';
  };

  const getEditIcon = (edit: EditValues, index: number) => {
    if (index === 0) return <ImageIcon className="w-4 h-4" />;
    
    const prev = editHistory[index - 1];
    
    if (edit.blur !== prev.blur) return <Circle className="w-4 h-4" />;
    if (edit.grayscale !== prev.grayscale) return <Slash className="w-4 h-4" />;
    if (edit.brightness !== prev.brightness) return <Sun className="w-4 h-4" />;
    if (edit.contrast !== prev.contrast) return <Contrast className="w-4 h-4" />;
    if (edit.flipH !== prev.flipH) return <FlipHorizontal2 className="w-4 h-4" />;
    if (edit.flipV !== prev.flipV) return <FlipVertical2 className="w-4 h-4" />;
    if (edit.rotation !== prev.rotation) return <RotateCw className="w-4 h-4" />;
    if (edit.crop !== prev.crop) return <Crop className="w-4 h-4" />;
    if (edit.frame !== prev.frame) return <Maximize2 className="w-4 h-4" />;
    if (edit.resize !== prev.resize) return <ImageIcon className="w-4 h-4" />;
    
    return <Sparkles className="w-4 h-4" />;
  };

  const getEditSummary = (edit: EditValues): string[] => {
    const summary: string[] = [];
    
    if (edit.blur > 0) summary.push(`Mờ: ${edit.blur}px`);
    if (edit.grayscale) summary.push('Đen trắng');
    if (edit.brightness !== 100) summary.push(`Sáng: ${edit.brightness}%`);
    if (edit.contrast !== 100) summary.push(`Tương phản: ${edit.contrast}%`);
    if (edit.flipH) summary.push('Lật ngang');
    if (edit.flipV) summary.push('Lật dọc');
    if (edit.rotation !== 0) summary.push(`Xoay: ${edit.rotation}°`);
    if (edit.crop) summary.push('Đã cắt');
    if (edit.frame) summary.push('Có khung');
    if (edit.resize) summary.push('Đã resize');
    
    return summary;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Lịch sử chỉnh sửa
          </DialogTitle>
          <DialogDescription>
            {editHistory.length} bước chỉnh sửa - Nhấn vào bất kỳ bước nào để quay lại
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {editHistory.map((edit, index) => {
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;
              const isFuture = index > currentIndex;
              const summary = getEditSummary(edit);
              
              return (
                <div
                  key={index}
                  className={`
                    relative pl-8 pb-6 cursor-pointer transition-all
                    ${isCurrent ? 'opacity-100' : isPast ? 'opacity-60 hover:opacity-80' : 'opacity-40 hover:opacity-60'}
                  `}
                  onClick={() => onJumpToIndex(index)}
                >
                  {/* Timeline line */}
                  {index < editHistory.length - 1 && (
                    <div 
                      className={`
                        absolute left-[11px] top-6 w-0.5 h-full
                        ${isPast ? 'bg-blue-500' : 'bg-slate-200'}
                      `}
                    />
                  )}
                  
                  {/* Timeline dot */}
                  <div 
                    className={`
                      absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${isCurrent 
                        ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-200' 
                        : isPast 
                        ? 'bg-white border-blue-500' 
                        : 'bg-white border-slate-300'
                      }
                    `}
                  >
                    {isCurrent ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : isPast ? (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* Content card */}
                  <div 
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isCurrent 
                        ? 'bg-blue-50 border-blue-500' 
                        : isPast 
                        ? 'bg-white border-blue-200 hover:border-blue-400' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`
                          p-1.5 rounded-md
                          ${isCurrent ? 'bg-blue-100 text-blue-600' : isPast ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'}
                        `}>
                          {getEditIcon(edit, index)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              Bước {index}
                            </span>
                            {isCurrent && (
                              <Badge className="text-xs bg-blue-500">
                                Hiện tại
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {getEditDescription(edit, index)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Edit summary tags */}
                    {summary.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {summary.map((item, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
{/* 
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            💡 Mẹo: Dùng <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded border">Ctrl+Z</kbd> để hoàn tác
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
