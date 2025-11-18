import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { EditValues } from '../App';
import { RotateCw, Check, X } from 'lucide-react';

interface CropRotateModalProps {
    imageUrl: string;
    currentEdits: EditValues;
    onApply?: (cropData: {
        x: number;
        y: number;
        width: number;
        height: number;
    }) => void;
    onRotateApply?: (
        cropData: { x: number; y: number; width: number; height: number },
        rotation: number
    ) => void;
    onClose: () => void;
}

export function CropRotateModal({
    imageUrl,
    currentEdits,
    onApply,
    onRotateApply,
    onClose,
}: CropRotateModalProps) {
    const [rotation, setRotation] = useState(currentEdits.rotation);
    const [cropArea, setCropArea] = useState({
        x: 10,
        y: 10,
        width: 80,
        height: 80,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [draggedPart, setDraggedPart] = useState<
        'tl' | 'tr' | 'bl' | 'br' | 'box' | null
    >(null);
    const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            imgRef.current = img;
            setIsImageLoaded(true);

            const canvas = canvasRef.current;
            if (!canvas) return;

            // Set canvas size
            const maxSize = 500;
            const scale = Math.min(
                maxSize / img.width,
                maxSize / img.height,
                1
            );
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Initialize crop area from existing crop or default to centered area
            if (currentEdits.crop) {
                setCropArea({
                    x: (currentEdits.crop.x / img.width) * 100,
                    y: (currentEdits.crop.y / img.height) * 100,
                    width: (currentEdits.crop.width / img.width) * 100,
                    height: (currentEdits.crop.height / img.height) * 100,
                });
            }
        };

        img.onerror = () => {
            console.error('Failed to load image');
        };

        img.src = imageUrl;
    }, [imageUrl, currentEdits.crop]);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !isImageLoaded) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image with rotation
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
            img,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
        );
        ctx.restore();

        // Draw dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate crop rectangle position
        const cropX = (cropArea.x / 100) * canvas.width;
        const cropY = (cropArea.y / 100) * canvas.height;
        const cropW = (cropArea.width / 100) * canvas.width;
        const cropH = (cropArea.height / 100) * canvas.height;

        // Clear crop area (make it visible)
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(cropX, cropY, cropW, cropH);
        ctx.restore();

        // Draw crop border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(cropX, cropY, cropW, cropH);

        // Draw corner handles
        const handleSize = 8;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;

        // Top-left
        ctx.fillRect(
            cropX - handleSize / 2,
            cropY - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            cropX - handleSize / 2,
            cropY - handleSize / 2,
            handleSize,
            handleSize
        );

        // Top-right
        ctx.fillRect(
            cropX + cropW - handleSize / 2,
            cropY - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            cropX + cropW - handleSize / 2,
            cropY - handleSize / 2,
            handleSize,
            handleSize
        );

        // Bottom-left
        ctx.fillRect(
            cropX - handleSize / 2,
            cropY + cropH - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            cropX - handleSize / 2,
            cropY + cropH - handleSize / 2,
            handleSize,
            handleSize
        );

        // Bottom-right
        ctx.fillRect(
            cropX + cropW - handleSize / 2,
            cropY + cropH - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            cropX + cropW - handleSize / 2,
            cropY + cropH - handleSize / 2,
            handleSize,
            handleSize
        );
    }, [rotation, cropArea, isImageLoaded]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    const getHandleAt = (
        canvas: HTMLCanvasElement,
        xPercent: number,
        yPercent: number
    ) => {
        const handleSize = 8;
        const handleMargin = 4; // Make it easier to grab
        const effectiveHandleSize = handleSize + handleMargin;

        const cropX = (cropArea.x / 100) * canvas.width;
        const cropY = (cropArea.y / 100) * canvas.height;
        const cropW = (cropArea.width / 100) * canvas.width;
        const cropH = (cropArea.height / 100) * canvas.height;

        const x = (xPercent / 100) * canvas.width;
        const y = (yPercent / 100) * canvas.height;

        // Top-left
        if (
            x >= cropX - effectiveHandleSize / 2 &&
            x <= cropX + effectiveHandleSize / 2 &&
            y >= cropY - effectiveHandleSize / 2 &&
            y <= cropY + effectiveHandleSize / 2
        )
            return 'tl';
        // Top-right
        if (
            x >= cropX + cropW - effectiveHandleSize / 2 &&
            x <= cropX + cropW + effectiveHandleSize / 2 &&
            y >= cropY - effectiveHandleSize / 2 &&
            y <= cropY + effectiveHandleSize / 2
        )
            return 'tr';
        // Bottom-left
        if (
            x >= cropX - effectiveHandleSize / 2 &&
            x <= cropX + effectiveHandleSize / 2 &&
            y >= cropY + cropH - effectiveHandleSize / 2 &&
            y <= cropY + cropH + effectiveHandleSize / 2
        )
            return 'bl';
        // Bottom-right
        if (
            x >= cropX + cropW - effectiveHandleSize / 2 &&
            x <= cropX + cropW + effectiveHandleSize / 2 &&
            y >= cropY + cropH - effectiveHandleSize / 2 &&
            y <= cropY + cropH + effectiveHandleSize / 2
        )
            return 'br';

        // Check if inside the box
        if (x > cropX && x < cropX + cropW && y > cropY && y < cropY + cropH) {
            return 'box';
        }

        return null;
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const handle = getHandleAt(canvas, x, y);
        if (handle === 'tl' || handle === 'br') {
            canvas.style.cursor = 'nwse-resize';
        } else if (handle === 'tr' || handle === 'bl') {
            canvas.style.cursor = 'nesw-resize';
        } else if (handle === 'box') {
            canvas.style.cursor = 'move';
        } else {
            canvas.style.cursor = 'crosshair';
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const handle = getHandleAt(canvas, x, y);
        setDraggedPart(handle);
        setIsDragging(true);
        setDragStart({ x, y });

        if (handle === 'box') {
            setDragStartOffset({ x: x - cropArea.x, y: y - cropArea.y });
        } else if (!handle) {
            // Start new crop
            setCropArea({ x, y, width: 0, height: 0 });
        }

        const handleWindowMouseMove = (event: MouseEvent) => {
            const newX = Math.max(
                0,
                Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)
            );
            const newY = Math.max(
                0,
                Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)
            );

            setCropArea((prev) => {
                let { x: prevX, y: prevY, width: prevW, height: prevH } = prev;
                const currentDraggedPart = draggedPart || handle;

                switch (currentDraggedPart) {
                    case 'tl':
                        prevW += prevX - newX;
                        prevH += prevY - newY;
                        prevX = newX;
                        prevY = newY;
                        break;
                    case 'tr':
                        prevW = newX - prevX;
                        prevH += prevY - newY;
                        prevY = newY;
                        break;
                    case 'bl':
                        prevW += prevX - newX;
                        prevH = newY - prevY;
                        prevX = newX;
                        break;
                    case 'br':
                        prevW = newX - prevX;
                        prevH = newY - prevY;
                        break;
                    case 'box':
                        prevX = newX - dragStartOffset.x;
                        prevY = newY - dragStartOffset.y;
                        break;
                    default:
                        // New selection
                        return {
                            x: Math.min(x, newX),
                            y: Math.min(y, newY),
                            width: Math.abs(newX - x),
                            height: Math.abs(newY - y),
                        };
                }

                // Ensure width/height are not negative and swap handles if needed
                if (prevW < 0) {
                    prevX += prevW;
                    prevW = Math.abs(prevW);
                     if (currentDraggedPart === 'tl') setDraggedPart('tr');
                     if (currentDraggedPart === 'tr') setDraggedPart('tl');
                     if (currentDraggedPart === 'bl') setDraggedPart('br');
                     if (currentDraggedPart === 'br') setDraggedPart('bl');
                }
                if (prevH < 0) {
                    prevY += prevH;
                    prevH = Math.abs(prevH);
                    if (currentDraggedPart === 'tl') setDraggedPart('bl');
                    if (currentDraggedPart === 'bl') setDraggedPart('tl');
                    if (currentDraggedPart === 'tr') setDraggedPart('br');
                    if (currentDraggedPart === 'br') setDraggedPart('tr');
                }

                // Clamp to canvas boundaries
                prevX = Math.max(0, Math.min(100 - prevW, prevX));
                prevY = Math.max(0, Math.min(100 - prevH, prevY));

                return { x: prevX, y: prevY, width: prevW, height: prevH };
            });
        };

        const handleWindowMouseUp = () => {
            setIsDragging(false);
            setDraggedPart(null);
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    };

    const handleApply = () => {
        const img = imgRef.current;
        if (!img) return;

        // Convert percentage to actual pixels
        const actualCrop = {
            x: Math.round((cropArea.x / 100) * img.width),
            y: Math.round((cropArea.y / 100) * img.height),
            width: Math.round((cropArea.width / 100) * img.width),
            height: Math.round((cropArea.height / 100) * img.height),
        };

        // Only apply crop if area was selected, otherwise apply full image
        const finalCrop =
            actualCrop.width > 10 && actualCrop.height > 10 ? actualCrop : null;

        // Use onRotateApply if available
        if (onRotateApply) {
            onRotateApply(
                finalCrop || {
                    x: 0,
                    y: 0,
                    width: img.width,
                    height: img.height,
                },
                rotation
            );
        } else if (finalCrop && onApply) {
            onApply(finalCrop);
        }

        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cắt & Xoay ảnh</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Canvas */}
                    <div className="md:col-span-2 flex justify-center items-center bg-slate-100 rounded-lg p-4">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            className="cursor-crosshair rounded shadow-lg"
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    </div>

                    {/* Controls */}
                    <div className="md:col-span-1 space-y-6 flex flex-col">
                        {/* Rotation Control */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <RotateCw className="w-4 h-4" />
                                    Xoay
                                </Label>
                                <span className="text-sm text-slate-600">
                                    {rotation}°
                                </span>
                            </div>
                            <Slider
                                value={[rotation]}
                                onValueChange={([value]: number[]) =>
                                    setRotation(value)
                                }
                                min={0}
                                max={360}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex gap-2 justify-center flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setRotation((rotation - 90 + 360) % 360)
                                    }
                                >
                                    -90°
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setRotation((rotation + 90) % 360)
                                    }
                                >
                                    +90°
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRotation(0)}
                                >
                                    Đặt lại xoay
                                </Button>
                            </div>
                        </div>

                        {/* Reset crop button */}
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCropArea({
                                        x: 10,
                                        y: 10,
                                        width: 80,
                                        height: 80,
                                    })
                                }
                            >
                                Đặt lại vùng cắt
                            </Button>
                        </div>

                        <div className="flex-grow"></div>

                        <p className="text-sm text-slate-600 text-center bg-blue-50 p-3 rounded-lg">
                            💡 Kéo chuột trên ảnh để chọn vùng cắt. Xoay ảnh
                            bằng thanh trượt.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                    </Button>
                    <Button onClick={handleApply}>
                        <Check className="w-4 h-4 mr-2" />
                        Áp dụng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
