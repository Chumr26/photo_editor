import { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { EditorScreen } from './components/EditorScreen';

export interface ImageState {
    original: string;
    current: string;
    width: number;
    height: number;
}

export interface TextOverlay {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textAlign: 'left' | 'center' | 'right';
    rotation: number;
    opacity: number;
}

export interface Shape {
    id: string;
    type: 'rectangle' | 'circle' | 'line' | 'arrow';
    x: number;
    y: number;
    width?: number;
    height?: number;
    x2?: number;
    y2?: number;
    strokeColor: string;
    strokeWidth: number;
    fillColor?: string;
    opacity: number;
}

export interface ImageOverlay {
    id: string;
    imageData: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    blendMode: BlendMode;
    flipH: boolean;
    flipV: boolean;
}

export type BlendMode = 
    | 'normal' 
    | 'multiply' 
    | 'screen' 
    | 'overlay' 
    | 'darken' 
    | 'lighten' 
    | 'color-dodge' 
    | 'color-burn' 
    | 'hard-light' 
    | 'soft-light' 
    | 'difference' 
    | 'exclusion';

export interface EditValues {
    // Basic adjustments
    blur: number;
    grayscale: boolean;
    brightness: number;
    contrast: number;
    
    // Transform
    flipH: boolean;
    flipV: boolean;
    rotation: number;
    crop: { x: number; y: number; width: number; height: number } | null;
    cropBackgroundColor: string; // Color for extended crop areas (hex or 'transparent')
    frame: {
        width: number;
        height: number;
        backgroundColor: string;
    } | null;
    resize: {
        width: number;
        height: number;
    } | null;
    
    // Advanced adjustments
    saturation: number;
    hue: number;
    temperature: number;
    shadows: number;
    highlights: number;
    vignette: number;
    sharpen: number;
    
    // Overlays
    textOverlays: TextOverlay[];
    shapes: Shape[];
    imageOverlays: ImageOverlay[];
}

export default function App() {
    const [imageState, setImageState] = useState<ImageState | null>(null);

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
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        setImageState(null);
    };

    return (
        <div className="h-screen overflow-hidden bg-linear-to-br from-slate-50 to-slate-100">
            {!imageState ? (
                <UploadScreen onImageUpload={handleImageUpload} />
            ) : (
                <EditorScreen
                    imageState={imageState}
                    setImageState={setImageState}
                    onReset={handleReset}
                />
            )}
        </div>
    );
}
