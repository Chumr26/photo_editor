import { useState } from 'react';
import { ImageState, EditValues } from '../App';
import { EditorControls } from './EditorControls';
import { InteractiveImageCanvas } from './InteractiveImageCanvas';
import { ExportModal } from './ExportModal';
import { AIChatPanel } from './AIChatPanel';
import { AISettingsModal, AISettings } from './AISettingsModal';
import { EditHistoryTimeline } from './EditHistoryTimeline';
import { AdvancedAdjustments } from './AdvancedAdjustments';
import { PresetFilters } from './PresetFilters';
import { TextOverlayTool } from './TextOverlayTool';
import { ShapesTool } from './ShapesTool';
import { ImageOverlayTool } from './ImageOverlayTool';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { useEditHistory } from '../hooks/useEditHistory';
import { aiService } from '../services/ai';
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
    SlidersHorizontal,
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
        // Basic adjustments
        blur: 0,
        grayscale: false,
        brightness: 100,
        contrast: 100,

        // Transform
        flipH: false,
        flipV: false,
        rotation: 0,
        crop: null,
        cropBackgroundColor: '#ffffff', // Default to white
        cropAspectRatio: null, // Free crop by default
        cropAspectRatioLocked: false, // Unlocked by default
        frame: null,
        resize: null,

        // Advanced adjustments
        saturation: 100,
        hue: 0,
        temperature: 0,
        shadows: 0,
        highlights: 0,
        vignette: 0,
        sharpen: 0,
        
        // Overlays
        textOverlays: [],
        shapes: [],
        imageOverlays: [],
    };

    const {
        history,
        currentIndex,
        currentEdits,
        canUndo,
        canRedo,
        addToHistory,
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
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);
    const [processedImage, setProcessedImage] = useState<string>('');
    const [showAISettings, setShowAISettings] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [tempEdits, setTempEdits] = useState<EditValues | null>(null);
    const [canvasZoom, setCanvasZoom] = useState(100);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
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

    // Wrapper handlers for overlay tools that use Partial<EditValues>
    const handleOverlayChange = (updates: Partial<EditValues>) => {
        setTempEdits({ ...currentEdits, ...updates });
    };

    const handleOverlayCommit = (updates: Partial<EditValues>) => {
        // Apply all updates to history
        let updatedEdits = { ...currentEdits, ...updates };
        addToHistory(updatedEdits);
        setTempEdits(null);
    };

    const handleCropConfirm = (crop: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null) => {
        // Commit crop to history when user clicks Done
        updateCurrent('crop', crop);
        setTempEdits(null);
        setEditMode('none');
    };

    const handleCropCancel = () => {
        // Cancel crop without saving
        setTempEdits(null);
        setEditMode('none');
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
        try {
            console.log('Processing AI command:', command);

            // Get current canvas as base64 image
            const canvas = document.querySelector('canvas');
            if (!canvas) {
                throw new Error('Không tìm thấy canvas');
            }

            const imageData = canvas.toDataURL('image/jpeg', 0.9);

            // Process command with AI service
            const response = await aiService.processCommand(
                command,
                imageData,
                aiSettings
            );

            if (!response.success) {
                throw new Error(response.error || 'Lỗi không xác định');
            }

            // Handle different response types
            if (response.type === 'image' && response.imageUrl) {
                // Background removal or style transfer - load new image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = response.imageUrl!;
                });

                // Create canvas with new image
                const newCanvas = document.createElement('canvas');
                newCanvas.width = img.width;
                newCanvas.height = img.height;
                const ctx = newCanvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);

                // Update image state with new processed image
                const newImageData = newCanvas.toDataURL('image/png');
                setImageState({
                    ...imageState,
                    original: newImageData,
                });

                // Reset edits to initial state to show new image
                reset(initialEdits);

                console.log('✓', response.message || 'Đã xử lý thành công!');
            } 
            else if (response.type === 'edits' && response.edits) {
                // Edit suggestions - apply to current edits
                const newEdits: EditValues = {
                    ...currentEdits,
                };

                // Apply suggested adjustments
                if (response.edits.brightness !== undefined) {
                    newEdits.brightness = Math.max(0, Math.min(200, 100 + response.edits.brightness));
                }
                if (response.edits.contrast !== undefined) {
                    newEdits.contrast = Math.max(0, Math.min(200, 100 + response.edits.contrast));
                }
                if (response.edits.saturation !== undefined) {
                    newEdits.saturation = Math.max(0, Math.min(200, 100 + response.edits.saturation));
                }
                if (response.edits.temperature !== undefined) {
                    newEdits.temperature = Math.max(-100, Math.min(100, response.edits.temperature));
                }
                if (response.edits.blur !== undefined) {
                    newEdits.blur = Math.max(0, Math.min(20, response.edits.blur));
                }
                if (response.edits.sharpen !== undefined) {
                    newEdits.sharpen = Math.max(0, Math.min(100, response.edits.sharpen));
                }
                if (response.edits.vignette !== undefined) {
                    newEdits.vignette = Math.max(0, Math.min(100, response.edits.vignette));
                }

                // Add to history
                addToHistory(newEdits);

                console.log('✓', response.message || 'Đã áp dụng chỉnh sửa!');
            } else {
                console.log('✓', response.message || 'Đã xử lý xong!');
            }
        } catch (error) {
            console.error('AI command error:', error);
            throw error;
        }
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
                            onClick={() => setShowHistoryTimeline(true)}
                            className="hidden md:flex"
                        >
                            <History className="w-4 h-4 mr-2" />
                            Lịch sử ({currentIndex + 1}/{history.length})
                        </Button>

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
                        onRotationChange={handleRotationChange}
                        onCropConfirm={handleCropConfirm}
                        onCropCancel={handleCropCancel}
                        onZoomChange={setCanvasZoom}
                        onResetView={() => {}}
                        selectedTextId={selectedTextId}
                        onTextSelect={setSelectedTextId}
                        onEditChange={handleOverlayChange}
                        onEditCommit={handleOverlayCommit}
                    />
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full lg:h-auto shrink-0">
                    <Tabs
                        defaultValue="manual"
                        className="flex-1 flex flex-col overflow-hidden h-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 rounded-none border-b shrink-0">
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
                            className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden"
                        >
                            <EditorControls
                                edits={displayEdits}
                                onEditChange={handleEditChange}
                                onEditCommit={handleEditCommit}
                                editMode={editMode}
                                onEditModeChange={setEditMode}
                                onCropConfirm={handleCropConfirm}
                                onCropCancel={handleCropCancel}
                            />
                            {editMode === 'none' && (
                                <>
                                    <AdvancedAdjustments
                                        edits={displayEdits}
                                        onEditChange={handleEditChange}
                                        onEditCommit={handleEditCommit}
                                    />
                                    <PresetFilters
                                        edits={displayEdits}
                                        onEditCommit={handleEditCommit}
                                    />
                                    <TextOverlayTool
                                        edits={displayEdits}
                                        onEditChange={handleOverlayChange}
                                        onEditCommit={handleOverlayCommit}
                                        selectedTextId={selectedTextId}
                                        onTextSelect={setSelectedTextId}
                                    />
                                    <ShapesTool
                                        edits={displayEdits}
                                        onEditChange={handleOverlayChange}
                                        onEditCommit={handleOverlayCommit}
                                    />
                                    <ImageOverlayTool
                                        edits={displayEdits}
                                        onEditChange={handleOverlayChange}
                                        onEditCommit={handleOverlayCommit}
                                    />
                                    
                                    {/* Before/After Button */}
                                    <div className="p-6 border-t border-slate-200">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowBeforeAfter(true)}
                                            className="w-full"
                                        >
                                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                                            So sánh trước/sau
                                        </Button>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent
                            value="ai"
                            className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden"
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

            {showBeforeAfter && (
                <BeforeAfterComparison
                    originalImage={imageState.original}
                    processedImage={processedImage}
                    onClose={() => setShowBeforeAfter(false)}
                />
            )}
        </div>
    );
}
