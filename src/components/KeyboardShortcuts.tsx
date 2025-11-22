import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const { t } = useTranslation();
  
  const shortcuts = [
    { key: 'Ctrl/Cmd + Z', action: t('shortcuts.undo') },
    { key: 'Ctrl/Cmd + Shift + Z', action: t('shortcuts.redo') },
    { key: 'Ctrl/Cmd + +', action: t('shortcuts.zoomIn') },
    { key: 'Ctrl/Cmd + -', action: t('shortcuts.zoomOut') },
    { key: 'Ctrl/Cmd + Wheel', action: t('shortcuts.zoomWheel') },
    { key: 'Ctrl/Cmd + 0', action: t('shortcuts.fitScreen') },
    { key: 'Ctrl/Cmd + 1', action: t('shortcuts.actualSize') },
    { key: 'Space + Drag', action: t('shortcuts.pan') },
    { key: 'V', action: t('shortcuts.moveTool') },
    { key: 'C', action: t('shortcuts.cropTool') },
    { key: 'T', action: t('shortcuts.textTool') },
    { key: 'I', action: t('shortcuts.insertImage') },
    { key: 'B', action: t('shortcuts.brushTool') },
    { key: 'L', action: t('shortcuts.toggleLayers') },
    { key: 'H', action: t('shortcuts.toggleHistory') },
    { key: 'G', action: t('shortcuts.toggleGrid') },
    { key: 'R', action: t('shortcuts.toggleRulers') },
    { key: 'P', action: t('shortcuts.togglePresets') },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#2a2a2a] border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-gray-200">
            {t('shortcuts.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800 rounded"
              >
                <span className="text-sm text-gray-300">{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-gray-900 text-gray-200 rounded text-xs border border-gray-700">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded">
            <p className="text-sm text-blue-200">
              💡 {t('shortcuts.tip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}