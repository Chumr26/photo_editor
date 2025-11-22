import { LeftToolbar } from './components/LeftToolbar';
import { Canvas } from './components/CanvasEnhanced';
import { RightControlPanel } from './components/RightControlPanel';
import { TopBar } from './components/TopBar';
import { Toaster } from 'sonner';
import { UploadZone } from './components/UploadZone';
import { useEditorStore } from './store/editorStore';
import { useState, useCallback, useEffect } from 'react';
import './styles/globals.css';
import { getTranslation } from './utils/translations';

export default function App() {
    const {
        image,
        setImage,
        layers,
        selectedLayerId,
        history,
        historyIndex,
        zoom,
        setZoom,
        tool,
        setTool,
        settings,
        saveSnapshot,
    } = useEditorStore();

    const [showUpload, setShowUpload] = useState(true);

    const handleImageUpload = useCallback(
        (file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImage({
                        src: e.target?.result as string,
                        width: img.width,
                        height: img.height,
                        filename: file.name,
                        fileSize: file.size,
                    });
                    setShowUpload(false);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        },
        [setImage]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

            // Zoom shortcuts
            if (ctrlOrCmd && e.key === '=') {
                e.preventDefault();
                setZoom(Math.min(zoom * 1.2, 500));
            } else if (ctrlOrCmd && e.key === '-') {
                e.preventDefault();
                setZoom(Math.max(zoom / 1.2, 10));
            } else if (ctrlOrCmd && e.key === '0') {
                e.preventDefault();
                setZoom(100); // Fit to screen (simplified)
            } else if (ctrlOrCmd && e.key === '1') {
                e.preventDefault();
                setZoom(100); // Actual size
            }

            // Undo/Redo
            if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                useEditorStore.getState().redo();
            } else if (ctrlOrCmd && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                useEditorStore.getState().undo();
            }

            // Tool shortcuts
            if (!ctrlOrCmd && !e.shiftKey && !e.altKey) {
                // Check if user is typing in an input field
                const target = e.target as HTMLElement;
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
                    return;
                }

                switch (e.key.toLowerCase()) {
                    case 'v':
                        e.preventDefault();
                        setTool('move');
                        useEditorStore.getState().setCropMode(false);
                        useEditorStore.getState().setCropRect(null);
                        break;
                    case 'c':
                        e.preventDefault();
                        setTool('crop');
                        useEditorStore.getState().setCropMode(true);
                        useEditorStore.getState().setCropRect(null);
                        break;
                    case 't':
                        e.preventDefault();
                        setTool('text');
                        useEditorStore.getState().setCropMode(false);
                        useEditorStore.getState().setCropRect(null);
                        // Create a new text box
                        const language = useEditorStore.getState().settings.language;
                        const newTextBox = {
                            id: `text-${Date.now()}`,
                            text: getTranslation('text.defaultText', language),
                            x: 100,
                            y: 100,
                            fontSize: 32,
                            fontFamily: 'Arial',
                            color: '#000000',
                            fontWeight: 'normal',
                        };
                        useEditorStore.getState().addTextBox(newTextBox);
                        break;
                    case 'b':
                        e.preventDefault();
                        setTool('brush');
                        useEditorStore.getState().setCropMode(false);
                        useEditorStore.getState().setCropRect(null);
                        break;
                    case 'i':
                        e.preventDefault();
                        setTool('insert');
                        useEditorStore.getState().setCropMode(false);
                        useEditorStore.getState().setCropRect(null);
                        break;
                    case 'g':
                        e.preventDefault();
                        useEditorStore.getState().toggleGrid();
                        break;
                    case 'r':
                        e.preventDefault();
                        useEditorStore.getState().toggleRulers();
                        break;
                    case 'l':
                        e.preventDefault();
                        useEditorStore.getState().togglePanelSection('layers');
                        break;
                    case 'h':
                        e.preventDefault();
                        useEditorStore.getState().togglePanelSection('history');
                        break;
                    case 'p':
                        e.preventDefault();
                        useEditorStore.getState().togglePanelSection('presets');
                        break;
                }
            }
        },
        [zoom, setZoom, setTool]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Auto-save implementation
    useEffect(() => {
        if (!settings.autoSave || !image) return;

        const intervalMs = settings.autoSaveInterval * 1000; // Convert seconds to ms
        const interval = setInterval(() => {
            saveSnapshot();
            console.log('Auto-saved at', new Date().toLocaleTimeString());
        }, intervalMs);

        return () => clearInterval(interval);
    }, [settings.autoSave, settings.autoSaveInterval, image, saveSnapshot]);

    if (showUpload || !image) {
        return (
            <div className="w-full h-screen bg-[#1a1a1a] flex items-center justify-center">
                <UploadZone onUpload={handleImageUpload} />
                <Toaster position="top-right" theme="dark" />
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#1a1a1a] flex flex-col overflow-hidden">
            <TopBar onReplace={() => setShowUpload(true)} />
            <div className="flex flex-1 overflow-hidden">
                <LeftToolbar />
                <Canvas />
                <RightControlPanel />
            </div>
            <Toaster position="top-right" theme="dark" />
        </div>
    );
}
