import { useState, useEffect } from 'react';
import { ImageState, EditValues } from '../App';
import { EditorControls } from './EditorControls';
import { ImageCanvas } from './ImageCanvas';
import { CropRotateModal } from './CropRotateModal';
import { ResizeFrameModal } from './ResizeFrameModal';
import { ImageResizeModal } from './ImageResizeModal';
import { ExportModal } from './ExportModal';
import { AIChatPanel } from './AIChatPanel';
import { AISettingsModal, AISettings } from './AISettingsModal';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Undo2, Redo2, RotateCcw, Download, X, Sparkles, Sliders } from 'lucide-react';

interface EditorScreenProps {
  imageState: ImageState;
  setImageState: (state: ImageState) => void;
  editHistory: EditValues[];
  setEditHistory: (history: EditValues[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  onReset: () => void;
}

export function EditorScreen({
  imageState,
  setImageState,
  editHistory,
  setEditHistory,
  historyIndex,
  setHistoryIndex,
  onReset,
}: EditorScreenProps) {
  const [currentEdits, setCurrentEdits] = useState<EditValues>(editHistory[historyIndex]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [showImageResizeModal, setShowImageResizeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [processedImage, setProcessedImage] = useState<string>('');
  const [showAISettings, setShowAISettings] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSettings, setAISettings] = useState<AISettings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('aiSettings');
    return saved ? JSON.parse(saved) : {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4-vision-preview',
      endpoint: '',
    };
  });

  useEffect(() => {
    setCurrentEdits(editHistory[historyIndex]);
  }, [historyIndex, editHistory]);

  const updateEdit = (key: keyof EditValues, value: any) => {
    const newEdits = { ...currentEdits, [key]: value };
    setCurrentEdits(newEdits);
    
    // Add to history
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newEdits);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleResetEdits = () => {
    const initialEdit: EditValues = {
      blur: 0,
      grayscale: false,
      brightness: 100,
      contrast: 100,
      flipH: false,
      flipV: false,
      rotation: 0,
      crop: null,
      frame: null,
      resize: null,
    };
    setCurrentEdits(initialEdit);
    setEditHistory([initialEdit]);
    setHistoryIndex(0);
  };

  const handleCropRotateApply = (
    cropData: { x: number; y: number; width: number; height: number },
    rotation: number
  ) => {
    // Update both crop and rotation
    const newEdits = { ...currentEdits, crop: cropData, rotation };
    setCurrentEdits(newEdits);
    
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newEdits);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setIsCropMode(false);
  };

  const handleCropCancel = () => {
    setIsCropMode(false);
  };

  const toggleCropMode = () => {
    setIsCropMode(!isCropMode);
  };

  const handleResizeApply = (frameData: {
    width: number;
    height: number;
    backgroundColor: string;
    maintainAspectRatio: boolean;
  }) => {
    // Update frame settings
    const newEdits = { 
      ...currentEdits, 
      frame: {
        width: frameData.width,
        height: frameData.height,
        backgroundColor: frameData.backgroundColor,
      }
    };
    setCurrentEdits(newEdits);
    
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newEdits);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setShowResizeModal(false);
  };

  const handleImageResizeApply = (resizeData: {
    width: number;
    height: number;
    mode: 'pixels' | 'percentage';
  }) => {
    // Update image resize settings
    const newEdits = { 
      ...currentEdits, 
      resize: {
        width: resizeData.width,
        height: resizeData.height,
      }
    };
    setCurrentEdits(newEdits);
    
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newEdits);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setShowImageResizeModal(false);
  };

  const handleAISaveSettings = (settings: AISettings) => {
    setAISettings(settings);
    // Save to localStorage
    localStorage.setItem('aiSettings', JSON.stringify(settings));
  };

  const handleAICommand = async (command: string) => {
    // TODO: Implement AI command processing
    // This is where you'll integrate with your AI API
    console.log('AI Command:', command);
    console.log('AI Settings:', aiSettings);
    
    /*
    Example implementation:
    
    const response = await fetch(`https://api.${aiSettings.provider}.com/v1/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiSettings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiSettings.model,
        prompt: command,
        image: imageState.original,
      }),
    });
    
    const result = await response.json();
    // Apply the AI's suggested edits to currentEdits
    */
    
    throw new Error('AI integration TODO: Configure your AI API in settings');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="rounded-full shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-slate-900 hidden sm:block">Chỉnh sửa ảnh</h2>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="hidden sm:flex"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Hoàn tác
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="sm:hidden shrink-0"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex === editHistory.length - 1}
              className="hidden sm:flex"
            >
              <Redo2 className="w-4 h-4 mr-2" />
              Làm lại
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex === editHistory.length - 1}
              className="sm:hidden shrink-0"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetEdits}
              className="hidden md:flex"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Đặt lại
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetEdits}
              className="md:hidden shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="ml-1 md:ml-2"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Tải về</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Area */}
        <div className={`flex-1 flex items-center justify-center bg-slate-50 overflow-auto relative ${isCropMode ? 'p-0' : 'p-4'}`}>
          {isCropMode ? (
            <CropRotateModal
              imageUrl={imageState.original}
              currentEdits={currentEdits}
              onRotateApply={handleCropRotateApply}
              onClose={handleCropCancel}
              isInlineMode={true}
            />
          ) : (
            <ImageCanvas
              imageUrl={imageState.original}
              edits={currentEdits}
              onProcessed={setProcessedImage}
            />
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden flex flex-col">
          <Tabs defaultValue="manual" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="manual" className="gap-2">
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Công cụ</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="flex-1 overflow-y-auto mt-0">
              <EditorControls
                edits={currentEdits}
                onEditChange={updateEdit}
                onOpenCrop={toggleCropMode}
                onOpenResize={() => setShowResizeModal(true)}
                onOpenImageResize={() => setShowImageResizeModal(true)}
                isCropMode={isCropMode}
              />
            </TabsContent>
            
            <TabsContent value="ai" className="flex-1 overflow-hidden mt-0">
              <AIChatPanel
                onAICommand={handleAICommand}
                onOpenSettings={() => setShowAISettings(true)}
                isConfigured={!!aiSettings.apiKey}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {showCropModal && (
        <CropRotateModal
          imageUrl={imageState.original}
          currentEdits={currentEdits}
          onRotateApply={handleCropRotateApply}
          onClose={() => setShowCropModal(false)}
        />
      )}

      {showResizeModal && (
        <ResizeFrameModal
          imageUrl={imageState.original}
          currentEdits={currentEdits}
          onResizeApply={handleResizeApply}
          onClose={() => setShowResizeModal(false)}
        />
      )}

      {showImageResizeModal && (
        <ImageResizeModal
          imageUrl={imageState.original}
          currentEdits={currentEdits}
          onResizeApply={handleImageResizeApply}
          onClose={() => setShowImageResizeModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          processedImage={processedImage}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showAISettings && (
        <AISettingsModal
          currentSettings={aiSettings}
          onSave={handleAISaveSettings}
          onClose={() => setShowAISettings(false)}
        />
      )}
    </div>
  );
}