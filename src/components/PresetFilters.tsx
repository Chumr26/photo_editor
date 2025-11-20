import { EditValues } from '../App';
import { Button } from './ui/button';
import { Wand2 } from 'lucide-react';

interface PresetFiltersProps {
  edits: EditValues;
  onEditCommit: (key: keyof EditValues, value: any) => void;
}

type PresetValues = Partial<Pick<EditValues, 
  'blur' | 'grayscale' | 'brightness' | 'contrast' | 'saturation' | 
  'hue' | 'temperature' | 'shadows' | 'highlights' | 'vignette' | 'sharpen'
>>;

const presets: { name: string; description: string; preset: PresetValues }[] = [
  {
    name: 'Gốc',
    description: 'Đặt lại về mặc định',
    preset: {
      blur: 0,
      grayscale: false,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      temperature: 0,
      shadows: 0,
      highlights: 0,
      vignette: 0,
      sharpen: 0,
    }
  },
  {
    name: 'Vintage',
    description: 'Phong cách hoài cổ',
    preset: {
      saturation: 80,
      temperature: 20,
      contrast: 110,
      brightness: 105,
      vignette: 30,
      hue: 10,
    }
  },
  {
    name: 'B&W Cổ điển',
    description: 'Đen trắng kinh điển',
    preset: {
      grayscale: true,
      contrast: 120,
      brightness: 95,
      vignette: 20,
    }
  },
  {
    name: 'Nóng bỏng',
    description: 'Tông màu ấm',
    preset: {
      temperature: 40,
      saturation: 120,
      contrast: 105,
      highlights: 10,
    }
  },
  {
    name: 'Lạnh lẽo',
    description: 'Tông màu lạnh',
    preset: {
      temperature: -40,
      saturation: 110,
      contrast: 105,
      shadows: -10,
    }
  },
  {
    name: 'Mờ ảo',
    description: 'Hiệu ứng mềm mại',
    preset: {
      blur: 2,
      brightness: 110,
      saturation: 90,
      contrast: 90,
    }
  },
  {
    name: 'Sắc nét',
    description: 'Tăng độ sắc nét',
    preset: {
      sharpen: 50,
      contrast: 115,
      saturation: 110,
    }
  },
  {
    name: 'Hoàng hôn',
    description: 'Ánh sáng vàng ấm',
    preset: {
      temperature: 30,
      saturation: 130,
      highlights: 15,
      shadows: -15,
      hue: 15,
    }
  },
  {
    name: 'Bình minh',
    description: 'Ánh sáng sớm mai',
    preset: {
      temperature: 25,
      brightness: 110,
      saturation: 120,
      highlights: 20,
      hue: -5,
    }
  },
  {
    name: 'Kịch tính',
    description: 'Tương phản cao',
    preset: {
      contrast: 140,
      saturation: 120,
      shadows: -30,
      highlights: 20,
      vignette: 40,
    }
  },
  {
    name: 'Mềm mại',
    description: 'Dịu nhẹ và mơ màng',
    preset: {
      blur: 1,
      brightness: 105,
      contrast: 95,
      saturation: 95,
      highlights: 10,
    }
  },
  {
    name: 'Điện ảnh',
    description: 'Phong cách phim',
    preset: {
      contrast: 115,
      saturation: 110,
      temperature: 10,
      vignette: 35,
      shadows: -10,
    }
  },
];

export function PresetFilters({ edits, onEditCommit }: PresetFiltersProps) {
  return (
    <div className="p-6 space-y-4 border-t border-slate-200">
      <h3 className="mb-4">Bộ lọc nhanh</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {presets.map((filter) => (
          <Button
            key={filter.name}
            variant="outline"
            onClick={() => {
              for (const key in filter.preset) {
                if (Object.prototype.hasOwnProperty.call(filter.preset, key)) {
                  const typedKey = key as keyof PresetValues;
                  const value = filter.preset[typedKey];
                  if (value !== undefined) {
                    onEditCommit(typedKey as keyof EditValues, value as any);
                  }
                }
              }
            }}
            className="w-full h-auto flex-col items-start p-3 text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="w-4 h-4" />
              <span className="font-medium">{filter.name}</span>
            </div>
            <span className="text-xs text-slate-500">{filter.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
