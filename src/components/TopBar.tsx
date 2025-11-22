import { Upload, Undo, Redo, ZoomIn, ZoomOut, Maximize2, Download, Settings, Keyboard, Grid3x3, Ruler, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { SettingsModal } from './SettingsModal';
import { quickExport } from '../utils/exportImage';
import { useTranslation } from '../hooks/useTranslation';
import { useIsMobile } from './ui/use-mobile';

interface TopBarProps {
  onReplace: () => void;
}

export function TopBar({ onReplace }: TopBarProps) {
  const { zoom, setZoom, undo, redo, historyIndex, history, showGrid, toggleGrid, showRulers, toggleRulers, resetToInitialState, image, adjustments, settings, textBoxes } = useEditorStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { t, language } = useTranslation();
  const isMobile = useIsMobile();

  const handleExport = async () => {
    if (!image) return;
    
    try {
      await quickExport(
        image,
        adjustments,
        settings.defaultExportFormat,
        settings.exportQuality,
        textBoxes,
        language as any
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isMobile) {
    return (
      <>
        <div className="h-14 bg-[#2a2a2a] border-b border-gray-700 flex items-center justify-between px-2">
          {/* Left section */}
          <div className="flex items-center gap-1">
            <button
              onClick={onReplace}
              className="p-2 text-gray-300 hover:bg-gray-700 rounded"
              title={t('topbar.replaceImage.tooltip')}
            >
              <Upload className="w-5 h-5" />
            </button>

            <button
              onClick={resetToInitialState}
              className="p-2 text-orange-500 hover:bg-gray-700 rounded"
              title={t('topbar.reset.tooltip')}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Center section */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={t('topbar.undo.tooltip')}
            >
              <Undo className="w-5 h-5" />
            </button>

            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={t('topbar.redo.tooltip')}
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              className="p-2 text-blue-500 hover:bg-gray-700 rounded"
              title={t('topbar.download.tooltip')}
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-700 text-gray-300 rounded transition-colors"
              title={t('topbar.settings.tooltip')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="h-14 bg-[#2a2a2a] border-b border-gray-700 flex items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReplace}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded flex items-center gap-2 transition-colors text-sm"
            title={t('topbar.replaceImage.tooltip')}
          >
            <Upload className="w-4 h-4" />
            <span>{t('topbar.replaceImage')}</span>
          </button>

          <button
            onClick={resetToInitialState}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-2 transition-colors text-sm"
            title={t('topbar.reset.tooltip')}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('topbar.reset')}</span>
          </button>

          <div className="w-px h-6 bg-gray-700" />

          <button
            onClick={toggleGrid}
            className={`p-2 rounded transition-colors ${showGrid ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title={t('topbar.grid.tooltip')}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRulers}
            className={`p-2 rounded transition-colors ${showRulers ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title={t('topbar.rulers.tooltip')}
          >
            <Ruler className="w-5 h-5" />
          </button>
        </div>

        {/* Center section */}
        <div className="flex items-center gap-4">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={t('topbar.undo.tooltip')}
          >
            <Undo className="w-5 h-5" />
          </button>

          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={t('topbar.redo.tooltip')}
          >
            <Redo className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-700" />

          <button
            onClick={() => setZoom(Math.max(zoom / 1.2, 10))}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title={t('topbar.zoomOut.tooltip')}
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            onClick={() => setZoom(Math.min(zoom * 1.2, 500))}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title={t('topbar.zoomIn.tooltip')}
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={() => setZoom(100)}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title={t('topbar.fitScreen.tooltip')}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition-colors"
            title={t('topbar.download.tooltip')}
          >
            <Download className="w-4 h-4" />
            <span>{t('topbar.download')}</span>
          </button>

          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title={t('topbar.shortcuts.tooltip')}
          >
            <Keyboard className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title={t('topbar.settings.tooltip')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}