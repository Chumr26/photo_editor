import { useState } from 'react';
import { ImageState, EditValues } from '../App';
import { EditorControls } from './EditorControls';
import { InteractiveImageCanvas } from './InteractiveImageCanvas';
import { ExportModal } from './ExportModal';
import { AIChatPanel } from './AIChatPanel';
import { AISettingsModal, AISettings } from './AISettingsModal';
import { EditHistoryTimeline } from './EditHistoryTimeline';
import { useEditHistory } from '../hooks/useEditHistory';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Undo2,
    Redo2,
    RotateCcw,
    Download,
    X,
    Sparkles,
    Sliders,
    History,
    Maximize,
} from 'lucide-react';

interface EditorScreenProps {
    imageState: ImageState;
    setImageState: (state: ImageState) => void;
    onReset: () => void;
}

export function EditorScreen({
    imageState,
    setImageState,
    onReset,
}: EditorScreenProps) {
    // Initialize edit history hook
    const initialEdits: EditValues = {
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

    const {
        history,
        currentIndex,
        currentEdits,
        canUndo,
        canRedo,
        updateCurrent,
        undo,
        redo,
        reset,
        jumpToIndex,
    } = useEditHistory(initialEdits);

    const [editMode, setEditMode] = useState<
        'none' | 'crop' | 'rotate' | 'resize'
    >('none');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showHistoryTimeline, setShowHistoryTimeline] = useState(false);
    const [processedImage, setProcessedImage] = useState<string>('');
    const [showAISettings, setShowAISettings] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [tempEdits, setTempEdits] = useState<EditValues | null>(null);
    const [canvasZoom, setCanvasZoom] = useState(100);
    const [aiSettings, setAISettings] = useState<AISettings>(() => {
        // Load from localStorage
        const saved = localStorage.getItem('aiSettings');
        return saved
            ? JSON.parse(saved)
            : {
                  provider: 'openai',
                  apiKey: '',
                  model: 'gpt-4-vision-preview',
                  endpoint: '',
              };
    });

    // Get the edits to display (temp if available, otherwise current)
    const displayEdits = tempEdits || currentEdits;

    const handleEditChange = (key: keyof EditValues, value: any) => {
        // For live preview during slider drag - don't add to history
        setTempEdits({ ...currentEdits, [key]: value });
    };

    const handleEditCommit = (key: keyof EditValues, value: any) => {
        // Commit to history when slider is released or button is clicked
        updateCurrent(key, value);
        setTempEdits(null);
    };

    const handleUndo = () => {
        undo();
        setTempEdits(null);
    };

    const handleRedo = () => {
        redo();
        setTempEdits(null);
    };

    const handleResetEdits = () => {
        reset(initialEdits);
        setTempEdits(null);
    };

    const handleCropChange = (crop: {
        x: number;
        y: number;
        width: number;
        height: number;
    }) => {
        // Temporary update during crop drag - don't add to history
        setTempEdits({ ...currentEdits, crop });
    };

    const handleCropEnd = (crop: {
        x: number;
        y: number;
        width: number;
        height: number;
    }) => {
        // Commit to history when crop is finished
        updateCurrent('crop', crop);
        setTempEdits(null);
    };

    const handleRotationChange = (rotation: number) => {
        // Temporary update during rotation - don't add to history
        setTempEdits({ ...currentEdits, rotation });
    };

    const handleResetView = () => {
        // Trigger reset on canvas via window function
        if ((window as any).__resetCanvasView) {
            (window as any).__resetCanvasView();
        }
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

        throw new Error(
            'AI integration TODO: Configure your AI API in settings'
        );
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
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
                        <h2 className="text-slate-900 hidden sm:block">
                            Chỉnh sửa ảnh
                        </h2>
                        
                        {/* Zoom Display and Reset View */}
                        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetView}
                                title="Đặt lại khung nhìn"
                            >
                                <Maximize className="w-4 h-4 mr-2" />
                                Đặt lại khung nhìn
                            </Button>
                            <div className="text-sm text-slate-600 px-2 py-1 bg-slate-50 rounded">
                                {canvasZoom}%
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className="hidden sm:flex"
                        >
                            <Undo2 className="w-4 h-4 mr-2" />
                            Hoàn tác
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className="sm:hidden shrink-0"
                        >
                            <Undo2 className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className="hidden sm:flex"
                        >
                            <Redo2 className="w-4 h-4 mr-2" />
                            Làm lại
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className="sm:hidden shrink-0"
                        >
                            <Redo2 className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHistoryTimeline(true)}
                            className="hidden md:flex"
                        >
                            <History className="w-4 h-4 mr-2" />
                            Lịch sử ({currentIndex + 1}/{history.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowHistoryTimeline(true)}
                            className="md:hidden shrink-0"
                        >
                            <History className="w-4 h-4" />
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
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Canvas Area */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden">
                    <InteractiveImageCanvas
                        imageUrl={imageState.original}
                        edits={displayEdits}
                        onProcessed={setProcessedImage}
                        editMode={editMode}
                        onCropChange={handleCropChange}
                        onRotationChange={handleRotationChange}
                        onEditEnd={() => displayEdits.crop && handleCropEnd(displayEdits.crop)}
                        onZoomChange={setCanvasZoom}
                        onResetView={() => {}}
                    />
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden flex flex-col">
                    <Tabs
                        defaultValue="manual"
                        className="flex-1 flex flex-col"
                    >
                        <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                            <TabsTrigger value="manual" className="gap-2">
                                <Sliders className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Công cụ
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    AI Assistant
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="manual"
                            className="flex-1 overflow-y-auto mt-0"
                        >
                            <EditorControls
                                edits={displayEdits}
                                onEditChange={handleEditChange}
                                onEditCommit={handleEditCommit}
                                editMode={editMode}
                                onEditModeChange={setEditMode}
                            />
                        </TabsContent>

                        <TabsContent
                            value="ai"
                            className="flex-1 overflow-hidden mt-0"
                        >
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

            {showHistoryTimeline && (
                <EditHistoryTimeline
                    editHistory={history}
                    currentIndex={currentIndex}
                    onJumpToIndex={jumpToIndex}
                    onClose={() => setShowHistoryTimeline(false)}
                />
            )}
        </div>
    );
}
