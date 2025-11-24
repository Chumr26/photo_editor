import { X, Move, Maximize, MousePointer2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useEffect, useState } from 'react';

interface GestureHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GestureHelpModal({ open, onOpenChange }: GestureHelpModalProps) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252525] border-gray-700 text-white max-w-[90vw] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {t('gestures.title') || 'Mobile Gestures'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Maximize className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t('gestures.zoom.title') || 'Pinch to Zoom'}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {t('gestures.zoom.desc') || 'Use two fingers to pinch in or out to zoom the canvas.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
              <Move className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t('gestures.pan.title') || 'Two-finger Pan'}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {t('gestures.pan.desc') || 'Use two fingers to move around the canvas.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <MousePointer2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t('gestures.edit.title') || 'Single Touch to Edit'}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {t('gestures.edit.desc') || 'Use one finger to draw, select, or move objects.'}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onOpenChange(false)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {t('common.gotIt') || 'Got it'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
