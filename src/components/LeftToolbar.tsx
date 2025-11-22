import { Move, Crop, Type, ImagePlus, Paintbrush } from 'lucide-react';
import { useEditorStore, Tool } from '../store/editorStore';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export function LeftToolbar() {
  const { tool, setTool, setCropMode, setCropRect, setActiveToolTab } = useEditorStore();
  const { t } = useTranslation();

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case 'move':
        setTool('move');
        // Disable crop mode if active
        setCropMode(false);
        setCropRect(null);
        break;
        
      case 'crop':
        setTool('crop');
        setActiveToolTab('crop');
        // Activate crop mode
        setCropMode(true);
        setCropRect(null);
        toast.info(t('toast.tool.crop'));
        break;
        
      case 'text':
        setTool('text');
        setActiveToolTab('text');
        // Disable crop mode if active
        setCropMode(false);
        setCropRect(null);
        toast.info(t('toast.tool.text'));
        break;
        
      case 'insert':
        setTool('move'); // Use move tool for insert mode
        setActiveToolTab('insert');
        // Disable crop mode if active
        setCropMode(false);
        setCropRect(null);
        toast.info(t('toast.tool.insert'));
        break;
        
      case 'brush':
        setTool('brush');
        setActiveToolTab('brush');
        // Disable crop mode if active
        setCropMode(false);
        setCropRect(null);
        break;
        
      default:
        setTool(toolId as Tool);
    }
  };

  const tools = [
    { id: 'move', icon: Move, label: t('tool.move.tooltip') },
    { id: 'crop', icon: Crop, label: t('tool.crop.tooltip') },
    { id: 'text', icon: Type, label: t('tool.text.tooltip') },
    { id: 'insert', icon: ImagePlus, label: t('tool.insert.tooltip') },
    { id: 'brush', icon: Paintbrush, label: t('tool.brush.tooltip') },
  ] as const;

  return (
    <div className="w-16 bg-[#2a2a2a] border-r border-gray-700 flex flex-col items-center py-4 gap-2">
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => handleToolClick(t.id)}
          className={`
            p-3 rounded transition-colors group relative
            ${tool === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}
          `}
          title={t.label}
        >
          <t.icon className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {t.label}
          </div>
        </button>
      ))}
    </div>
  );
}
