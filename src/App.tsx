import { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { EditorScreen } from './components/EditorScreen';

export interface ImageState {
    original: string;
    current: string;
    width: number;
    height: number;
}

export interface EditValues {
    blur: number;
    grayscale: boolean;
    brightness: number;
    contrast: number;
    flipH: boolean;
    flipV: boolean;
    rotation: number;
    crop: { x: number; y: number; width: number; height: number } | null;
    frame: {
        width: number;
        height: number;
        backgroundColor: string;
    } | null;
    resize: {
        width: number;
        height: number;
    } | null;
}

export default function App() {
    const [imageState, setImageState] = useState<ImageState | null>(null);
    const [editHistory, setEditHistory] = useState<EditValues[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const imageData = {
                    original: e.target?.result as string,
                    current: e.target?.result as string,
                    width: img.width,
                    height: img.height,
                };
                setImageState(imageData);

                // Initialize edit history
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
                setEditHistory([initialEdit]);
                setHistoryIndex(0);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        setImageState(null);
        setEditHistory([]);
        setHistoryIndex(-1);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
            {!imageState ? (
                <UploadScreen onImageUpload={handleImageUpload} />
            ) : (
                <EditorScreen
                    imageState={imageState}
                    setImageState={setImageState}
                    editHistory={editHistory}
                    setEditHistory={setEditHistory}
                    historyIndex={historyIndex}
                    setHistoryIndex={setHistoryIndex}
                    onReset={handleReset}
                />
            )}
        </div>
    );
}
