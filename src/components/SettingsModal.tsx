import { X, Settings as SettingsIcon, Globe, Save, Download, Grid3x3, Ruler, History, Palette } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useEditorStore();
  const { t } = useTranslation();

  const handleSave = () => {
    toast.success(t('settings.saved'));
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    toast.success(t('settings.reset.success'));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl text-gray-100">{t('settings.title')}</h2>
              <p className="text-xs text-gray-400">{t('settings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Language Settings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-gray-200 font-medium">{t('settings.language')}</h3>
            </div>
            <div className="space-y-2 ml-7">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="vi"
                  checked={settings.language === 'vi'}
                  onChange={(e) => updateSettings({ language: e.target.value as any })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="text-gray-200">{t('settings.language.vi')}</div>
                  <div className="text-xs text-gray-400">{t('settings.language.vi.desc')}</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={settings.language === 'en'}
                  onChange={(e) => updateSettings({ language: e.target.value as any })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="text-gray-200">{t('settings.language.en')}</div>
                  <div className="text-xs text-gray-400">{t('settings.language.en.desc')}</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="both"
                  checked={settings.language === 'both'}
                  onChange={(e) => updateSettings({ language: e.target.value as any })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="text-gray-200">{t('settings.language.both')}</div>
                  <div className="text-xs text-gray-400">{t('settings.language.both.desc')}</div>
                </div>
              </label>
            </div>
          </section>

          <div className="h-px bg-gray-700" />

          {/* Auto-Save Settings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Save className="w-5 h-5 text-green-400" />
              <h3 className="text-gray-200 font-medium">{t('settings.autoSave')}</h3>
            </div>
            <div className="space-y-3 ml-7">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800"
                />
                <span className="text-gray-200">{t('settings.autoSave.enable')}</span>
              </label>

              {settings.autoSave && (
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    {t('settings.autoSave.interval')}: {settings.autoSaveInterval}s
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="600"
                    step="60"
                    value={settings.autoSaveInterval}
                    onChange={(e) => updateSettings({ autoSaveInterval: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t('settings.autoSave.min1')}</span>
                    <span>{t('settings.autoSave.min10')}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="h-px bg-gray-700" />

          {/* Export Settings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-200 font-medium">{t('settings.export')}</h3>
            </div>
            <div className="space-y-3 ml-7">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('settings.export.format')}
                </label>
                <select
                  value={settings.defaultExportFormat}
                  onChange={(e) => updateSettings({ defaultExportFormat: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="png">{t('settings.export.format.png')}</option>
                  <option value="jpg">{t('settings.export.format.jpg')}</option>
                  <option value="webp">{t('settings.export.format.webp')}</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('settings.export.quality')}: {settings.exportQuality}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.exportQuality}
                  onChange={(e) => updateSettings({ exportQuality: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50% ({t('settings.export.quality.low')})</span>
                  <span>100% ({t('settings.export.quality.high')})</span>
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-700" />

          {/* Canvas Settings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-yellow-400" />
              <h3 className="text-gray-200 font-medium">{t('settings.canvas')}</h3>
            </div>
            <div className="space-y-3 ml-7">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('settings.canvas.background')}
                </label>
                <select
                  value={settings.canvasBackground}
                  onChange={(e) => updateSettings({ canvasBackground: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="dark">{t('settings.canvas.background.dark')}</option>
                  <option value="light">{t('settings.canvas.background.light')}</option>
                  <option value="checkered">{t('settings.canvas.background.checkered')}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-gray-400" />
                <label className="text-sm text-gray-400">
                  {t('settings.canvas.gridSize')}: {settings.gridSize}px
                </label>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.gridSize}
                onChange={(e) => updateSettings({ gridSize: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5px</span>
                <span>50px</span>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-700" />

          {/* History Settings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-orange-400" />
              <h3 className="text-gray-200 font-medium">{t('settings.history')}</h3>
            </div>
            <div className="space-y-3 ml-7">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {t('settings.history.maxStates')}: {settings.maxHistoryStates}
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={settings.maxHistoryStates}
                  onChange={(e) => updateSettings({ maxHistoryStates: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20 ({t('settings.history.memory.low')})</span>
                  <span>200 ({t('settings.history.memory.high')})</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {t('settings.history.tip')}
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors text-sm"
          >
            {t('settings.reset')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
            >
              {t('settings.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
