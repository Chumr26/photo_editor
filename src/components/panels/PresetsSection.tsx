import { useEditorStore } from '../../store/editorStore';
import { useTranslation } from '../../hooks/useTranslation';

const presets = [
  {
    id: 'vintage',
    nameKey: 'preset.vintage',
    adjustments: {
      brightness: 10,
      contrast: 15,
      saturation: -20,
      sepia: true,
      hue: 15,
    },
  },
  {
    id: 'bw-film',
    nameKey: 'preset.bwFilm',
    adjustments: {
      brightness: 5,
      contrast: 30,
      grayscale: true,
    },
  },
  {
    id: 'portrait',
    nameKey: 'preset.portrait',
    adjustments: {
      brightness: 15,
      contrast: -10,
      saturation: 5,
      blur: 1,
    },
  },
  {
    id: 'cinematic',
    nameKey: 'preset.cinematic',
    adjustments: {
      brightness: -5,
      contrast: 25,
      saturation: -10,
      hue: -10,
    },
  },
  {
    id: 'high-contrast',
    nameKey: 'preset.highContrast',
    adjustments: {
      brightness: 0,
      contrast: 50,
      saturation: 20,
    },
  },
  {
    id: 'soft-glow',
    nameKey: 'preset.softGlow',
    adjustments: {
      brightness: 20,
      contrast: -15,
      blur: 2,
      saturation: 10,
    },
  },
];

export function PresetsSection() {
  const { updateAdjustments, resetAdjustments } = useEditorStore();
  const { t } = useTranslation();

  const applyPreset = (preset: typeof presets[0]) => {
    resetAdjustments();
    updateAdjustments(preset.adjustments);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        {t('preset.description')}
      </p>

      {/* Preset grid */}
      <div className="grid grid-cols-2 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all"
          >
            {/* Preview - would show actual preview in real implementation */}
            <div className="absolute inset-0 bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="text-4xl opacity-50">
                {preset.id === 'vintage' && '📷'}
                {preset.id === 'bw-film' && '🎞️'}
                {preset.id === 'portrait' && '👤'}
                {preset.id === 'cinematic' && '🎬'}
                {preset.id === 'high-contrast' && '⚡'}
                {preset.id === 'soft-glow' && '✨'}
              </div>
            </div>

            {/* Label */}
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 to-transparent p-2">
              <div className="text-xs text-white truncate">
                {t(preset.nameKey)}
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Reset button */}
      <button
        onClick={resetAdjustments}
        className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors"
      >
        {t('preset.resetAll')}
      </button>

      {/* Custom preset save */}
      <div className="h-px bg-gray-700" />

      <div className="space-y-2">
        <h4 className="text-sm text-gray-300">
          {t('preset.saveCustom')}
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('preset.presetName')}
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
            {t('common.save')}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>💡 {t('preset.tip')}</p>
      </div>
    </div>
  );
}
