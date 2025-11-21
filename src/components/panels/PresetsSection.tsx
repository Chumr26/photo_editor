import { useEditorStore } from '../../store/editorStore';

const presets = [
  {
    id: 'vintage',
    name: 'Vintage ấm',
    nameEn: 'Warm Vintage',
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
    name: 'Phim đen trắng',
    nameEn: 'Film B&W',
    adjustments: {
      brightness: 5,
      contrast: 30,
      grayscale: true,
    },
  },
  {
    id: 'portrait',
    name: 'Chân dung mềm',
    nameEn: 'Portrait Soft',
    adjustments: {
      brightness: 15,
      contrast: -10,
      saturation: 5,
      blur: 1,
    },
  },
  {
    id: 'cinematic',
    name: 'Điện ảnh',
    nameEn: 'Cinematic',
    adjustments: {
      brightness: -5,
      contrast: 25,
      saturation: -10,
      hue: -10,
    },
  },
  {
    id: 'high-contrast',
    name: 'Tương phản cao',
    nameEn: 'High Contrast',
    adjustments: {
      brightness: 0,
      contrast: 50,
      saturation: 20,
    },
  },
  {
    id: 'soft-glow',
    name: 'Ánh sáng mềm',
    nameEn: 'Soft Glow',
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

  const applyPreset = (preset: typeof presets[0]) => {
    resetAdjustments();
    updateAdjustments(preset.adjustments);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Áp dụng bộ lọc có sẵn (Apply preset filters)
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
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
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
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="text-xs text-white truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-gray-300 truncate">
                {preset.nameEn}
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
        Xóa tất cả bộ lọc (Reset All Filters)
      </button>

      {/* Custom preset save */}
      <div className="h-px bg-gray-700" />

      <div className="space-y-2">
        <h4 className="text-sm text-gray-300">
          Lưu bộ lọc tùy chỉnh (Save Custom Preset)
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tên bộ lọc..."
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
            Lưu
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>💡 Điều chỉnh các thông số sau khi áp dụng bộ lọc</p>
        <p className="mt-1">
          💡 Adjust parameters after applying preset
        </p>
      </div>
    </div>
  );
}
