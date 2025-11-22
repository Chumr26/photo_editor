import { Move, Crop, Type, ImagePlus, Paintbrush, Layers, Settings2 } from 'lucide-react';
import { useEditorStore, Tool } from '../store/editorStore';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { RightControlPanel } from './RightControlPanel';
import { useState } from 'react';

export function MobileToolbar() {
  const { tool, setTool, setCropMode, setCropRect, setActiveToolTab, openPanelSection } = useEditorStore();
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case 'move':
        setTool('move');
        setCropMode(false);
        setCropRect(null);
        break;
        
      case 'crop':
        setTool('crop');
        setActiveToolTab('crop');
        setCropMode(true);
        setCropRect(null);
        toast.info(t('toast.tool.crop'));
        break;
        
      case 'text':
        setTool('text');
        setActiveToolTab('text');
        setCropMode(false);
        setCropRect(null);
        toast.info(t('toast.tool.text'));
        // Open properties panel automatically for text
        openPanelSection('properties');
        setIsSheetOpen(true);
        break;
        
      case 'insert':
        setTool('move');
        setActiveToolTab('insert');
        setCropMode(false);
        setCropRect(null);
        toast.info(t('toast.tool.insert'));
        // Open tools panel automatically for insert
        openPanelSection('tools');
        setIsSheetOpen(true);
        break;
        
      case 'brush':
        setTool('brush');
        setActiveToolTab('brush');
        setCropMode(false);
        setCropRect(null);
        // Open tools panel automatically for brush
        openPanelSection('tools');
        setIsSheetOpen(true);
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a] border-t border-gray-700 flex items-center justify-between px-4 py-2 z-50 safe-area-bottom">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => handleToolClick(t.id)}
            className={`
              p-3 rounded-full transition-colors shrink-0
              ${tool === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}
            `}
            title={t.label}
          >
            <t.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-gray-700 mx-2 shrink-0" />

      <div className="flex items-center gap-1">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="p-3 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              onClick={() => openPanelSection('layers')}
            >
              <Layers className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 bg-[#252525] border-t border-gray-700">
            <RightControlPanel className="w-full h-full border-none" />
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <button
              className="p-3 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              onClick={() => openPanelSection('properties')}
            >
              <Settings2 className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 bg-[#252525] border-t border-gray-700">
            <RightControlPanel className="w-full h-full border-none" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
