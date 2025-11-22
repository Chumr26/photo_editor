import { useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PropertiesSection } from './panels/PropertiesSection';
import { ToolsSection } from './panels/ToolsSection';
import { LayersSection } from './panels/LayersSection';
import { HistorySection } from './panels/HistorySection';
import { PresetsSection } from './panels/PresetsSection';
import { ExportSection } from './panels/ExportSection';
import { useEditorStore } from '../store/editorStore';
import { useTranslation } from '../hooks/useTranslation';
import { cn } from './ui/utils';

type Section = 'properties' | 'tools' | 'layers' | 'history' | 'presets' | 'export';

interface PanelSection {
  id: Section;
  titleKey: string;
  component: React.ComponentType;
  defaultOpen?: boolean;
}

interface RightControlPanelProps {
  className?: string;
}

export function RightControlPanel({ className }: RightControlPanelProps) {
  const { openPanelSections, togglePanelSection, openPanelSection, tool, setActiveToolTab } = useEditorStore();
  const { t } = useTranslation();
  
  const sections: PanelSection[] = [
    { id: 'properties', titleKey: 'panel.properties', component: PropertiesSection, defaultOpen: true },
    { id: 'tools', titleKey: 'panel.tools', component: ToolsSection, defaultOpen: true },
    { id: 'layers', titleKey: 'panel.layers', component: LayersSection },
    { id: 'history', titleKey: 'panel.history', component: HistorySection },
    { id: 'presets', titleKey: 'panel.presets', component: PresetsSection },
    { id: 'export', titleKey: 'panel.export', component: ExportSection },
  ];
  
  // Refs for each section header/container
  const sectionRefs = useRef<Record<Section, HTMLDivElement | null>>({
    properties: null,
    tools: null,
    layers: null,
    history: null,
    presets: null,
    export: null,
  });

  // Track previously open sections to detect new openings
  const prevOpenSectionsRef = useRef<Set<string>>(new Set());

  // Initialize with default open sections
  useEffect(() => {
    sections.forEach((section) => {
      if (section.defaultOpen && !openPanelSections.has(section.id)) {
        openPanelSection(section.id);
      }
    });
  }, []);

  // Auto-scroll when a section is newly opened
  useEffect(() => {
    const prevOpenSections = prevOpenSectionsRef.current;
    
    // Find newly opened sections
    openPanelSections.forEach((sectionId) => {
      if (!prevOpenSections.has(sectionId)) {
        // This section was just opened, scroll it into view
        const sectionRef = sectionRefs.current[sectionId as Section];
        if (sectionRef) {
          setTimeout(() => {
            sectionRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100); // Small delay to allow DOM to update
        }
      }
    });
    
    // Update previous open sections
    prevOpenSectionsRef.current = new Set(openPanelSections);
  }, [openPanelSections]);

  // Auto-expand sections based on active tool
  useEffect(() => {
    switch (tool) {
      case 'move':
        openPanelSection('layers');
        break;
      case 'crop':
        openPanelSection('tools');
        setActiveToolTab('crop');
        break;
      case 'text':
        openPanelSection('properties');
        openPanelSection('tools');
        setActiveToolTab('text');
        break;
      case 'insert':
        openPanelSection('layers');
        break;
      case 'brush':
        openPanelSection('tools');
        openPanelSection('layers');
        setActiveToolTab('brush');
        break;
    }
  }, [tool, openPanelSection, setActiveToolTab]);

  return (
    <div className={cn("w-80 bg-[#252525] border-l border-gray-700 overflow-y-auto", className)}>
      <div className="flex flex-col">
        {sections.map((section) => {
          const isOpen = openPanelSections.has(section.id);
          const Component = section.component;

          return (
            <div key={section.id} className="border-b border-gray-700" ref={el => { sectionRefs.current[section.id] = el; }}>
              {/* Section header */}
              <button
                onClick={() => togglePanelSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-200">{t(section.titleKey)}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="px-4 py-4 bg-[#2a2a2a]">
                  <Component />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}