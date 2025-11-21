import { useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PropertiesSection } from './panels/PropertiesSection';
import { ToolsSection } from './panels/ToolsSection';
import { LayersSection } from './panels/LayersSection';
import { HistorySection } from './panels/HistorySection';
import { PresetsSection } from './panels/PresetsSection';
import { ExportSection } from './panels/ExportSection';
import { useEditorStore } from '../store/editorStore';

type Section = 'properties' | 'tools' | 'layers' | 'history' | 'presets' | 'export';

interface PanelSection {
  id: Section;
  title: string;
  titleEn: string;
  component: React.ComponentType;
  defaultOpen?: boolean;
}

const sections: PanelSection[] = [
  { id: 'properties', title: 'Thuộc tính', titleEn: 'Properties', component: PropertiesSection, defaultOpen: true },
  { id: 'tools', title: 'Công cụ', titleEn: 'Tools', component: ToolsSection, defaultOpen: true },
  { id: 'layers', title: 'Lớp', titleEn: 'Layers', component: LayersSection },
  { id: 'history', title: 'Lịch sử', titleEn: 'History', component: HistorySection },
  { id: 'presets', title: 'Bộ lọc sẵn', titleEn: 'Presets', component: PresetsSection },
  { id: 'export', title: 'Xuất ảnh', titleEn: 'Export', component: ExportSection },
];

export function RightControlPanel() {
  const { openPanelSections, togglePanelSection, openPanelSection, tool, setActiveToolTab } = useEditorStore();
  
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
    <div className="w-80 bg-[#252525] border-l border-gray-700 overflow-y-auto">
      <div className="flex flex-col">
        {sections.map((section) => {
          const isOpen = openPanelSections.has(section.id);
          const Component = section.component;

          return (
            <div key={section.id} className="border-b border-gray-700" ref={el => sectionRefs.current[section.id] = el}>
              {/* Section header */}
              <button
                onClick={() => togglePanelSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-200">{section.title}</span>
                  <span className="text-xs text-gray-500">({section.titleEn})</span>
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