import { useState } from 'react';
import { Download, FileImage, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { toast } from 'sonner';
import { exportImage } from '../../utils/exportImage';
import { useTranslation } from '../../hooks/useTranslation';

type ExportFormat = 'jpg' | 'png' | 'webp' | 'svg';

export function ExportSection() {
  const { image, adjustments, settings, textBoxes } = useEditorStore();
  const { t, language } = useTranslation();
  
  // Initialize from settings
  const [format, setFormat] = useState<ExportFormat>(settings.defaultExportFormat);
  const [quality, setQuality] = useState(settings.exportQuality);
  const [transparent, setTransparent] = useState(false);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [filename, setFilename] = useState('');

  const estimatedSize = image
    ? Math.round(
        (image.width * image.height * (format === 'png' ? 4 : 3) * (quality / 100) * scale) /
          1024
      )
    : 0;

  const handleExport = async () => {
    if (!image) return;
    
    setIsExporting(true);
    
    try {
      await exportImage(image, adjustments, {
        format,
        quality,
        scale,
        transparent,
        filename,
      }, textBoxes);
      
      toast.success(t('toast.export.success'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('toast.export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Format selection */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">
          {t('export.format')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['jpg', 'png', 'webp', 'svg'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`
                px-2 py-2 rounded text-xs uppercase transition-colors
                ${
                  format === fmt
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Quality slider (for JPG/WebP) */}
      {(format === 'jpg' || format === 'webp') && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">{t('export.quality')}</label>
            <span className="text-xs text-gray-400">{quality}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {t('export.estimatedSize')}: ~{estimatedSize} KB
          </div>
        </div>
      )}

      {/* Transparent background (for PNG/SVG) */}
      {(format === 'png' || format === 'svg') && (
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={transparent}
            onChange={(e) => setTransparent(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800"
          />
          <span>{t('export.transparent')}</span>
        </label>
      )}

      {/* Scale/Resolution */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">
          {t('export.scale')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`
                px-2 py-1.5 rounded text-xs transition-colors
                ${
                  scale === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {s}x
            </button>
          ))}
        </div>
        {image && (
          <div className="text-xs text-gray-500 mt-2">
            {t('export.outputSize')}: {Math.round(image.width * scale)} × {Math.round(image.height * scale)} px
          </div>
        )}
      </div>

      {/* DPI setting */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">
          {t('export.dpi')}
        </label>
        <select
          className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          defaultValue="72"
        >
          <option value="72">{t('export.dpi72')}</option>
          <option value="150">{t('export.dpi150')}</option>
          <option value="300">{t('export.dpi300')}</option>
          <option value="600">{t('export.dpi600')}</option>
        </select>
      </div>

      {/* Filename */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">
          {t('export.filename')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder={image?.filename.replace(/\.[^/.]+$/, '') || 'edited-image'}
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
          <div className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-400">
            .{format}
          </div>
        </div>
      </div>

      {/* Export layers separately */}
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-600 bg-gray-800"
        />
        <span>{t('export.layersSeparately')}</span>
      </label>

      <div className="h-px bg-gray-700" />

      {/* Export presets */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">
          {t('export.presets')}
        </label>
        <select className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none">
          <option>{t('export.preset.web')}</option>
          <option>{t('export.preset.instagram')}</option>
          <option>{t('export.preset.facebook')}</option>
          <option>{t('export.preset.print')}</option>
          <option>{t('export.preset.logo')}</option>
        </select>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('export.exporting')}</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>{t('export.download')}</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 {t('export.info.jpg')}</p>
        <p>💡 {t('export.info.png')}</p>
        <p>💡 {t('export.info.webp')}</p>
        <p>💡 {t('export.info.svg')}</p>
      </div>
    </div>
  );
}