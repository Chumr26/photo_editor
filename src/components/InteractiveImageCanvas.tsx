import { useEffect, useRef, useState, useCallback } from 'react';
import { EditValues } from '../App';

interface InteractiveImageCanvasProps {
  imageUrl: string;
  edits: EditValues;
  onProcessed: (dataUrl: string) => void;
  editMode: 'none' | 'crop' | 'rotate' | 'resize';
  onCropChange?: (crop: { x: number; y: number; width: number; height: number }) => void;
  onRotationChange?: (rotation: number) => void;
}

export function InteractiveImageCanvas({
  imageUrl,
  edits,
  onProcessed,
  editMode,
  onCropChange,
  onRotationChange,
}: InteractiveImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Crop state
  const [cropArea, setCropArea] = useState({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPart, setDraggedPart] = useState<'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l' | 'box' | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  
  // Use refs for immediate access during drag operations
  const draggedPartRef = useRef<'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l' | 'box' | null>(null);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imgRef.current = img;
      setIsImageLoaded(true);

      // Initialize crop area from existing crop or default
      if (edits.crop) {
        setCropArea({
          x: (edits.crop.x / img.width) * 100,
          y: (edits.crop.y / img.height) * 100,
          width: (edits.crop.width / img.width) * 100,
          height: (edits.crop.height / img.height) * 100,
        });
      }
    };

    img.onerror = () => {
      console.error('Failed to load image');
    };

    img.src = imageUrl;
  }, [imageUrl]);

  // Update crop when crop area changes
  useEffect(() => {
    if (editMode === 'crop' && isImageLoaded && imgRef.current && onCropChange) {
      const img = imgRef.current;
      const actualCrop = {
        x: Math.round((cropArea.x / 100) * img.width),
        y: Math.round((cropArea.y / 100) * img.height),
        width: Math.round((cropArea.width / 100) * img.width),
        height: Math.round((cropArea.height / 100) * img.height),
      };
      
      if (actualCrop.width > 10 && actualCrop.height > 10) {
        onCropChange(actualCrop);
      }
    }
  }, [cropArea, editMode, isImageLoaded, onCropChange]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img || !isImageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine source dimensions
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.width;
    let sourceHeight = img.height;

    if (edits.crop && editMode !== 'crop') {
      sourceX = edits.crop.x;
      sourceY = edits.crop.y;
      sourceWidth = edits.crop.width;
      sourceHeight = edits.crop.height;
    }

    // Apply resize if set
    let outputWidth = sourceWidth;
    let outputHeight = sourceHeight;
    
    if (edits.resize) {
      outputWidth = edits.resize.width;
      outputHeight = edits.resize.height;
    }

    // Calculate canvas dimensions
    let canvasWidth, canvasHeight;
    
    if (edits.frame) {
      canvasWidth = edits.frame.width;
      canvasHeight = edits.frame.height;
    } else {
      canvasWidth = outputWidth;
      canvasHeight = outputHeight;
    }

    // Calculate display size
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;
    
    let displayWidth = canvasWidth;
    let displayHeight = canvasHeight;

    if (displayWidth > maxWidth || displayHeight > maxHeight) {
      const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
      displayWidth *= ratio;
      displayHeight *= ratio;
    }

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background if frame is set
    if (edits.frame) {
      ctx.fillStyle = edits.frame.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const scale = displayWidth / canvasWidth;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    if (edits.rotation) {
      ctx.rotate((edits.rotation * Math.PI) / 180);
    }

    const scaleX = edits.flipH ? -1 : 1;
    const scaleY = edits.flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    let drawWidth, drawHeight;
    
    if (edits.frame) {
      const imgScale = Math.min(
        (canvasWidth * scale) / outputWidth,
        (canvasHeight * scale) / outputHeight
      );
      drawWidth = outputWidth * imgScale;
      drawHeight = outputHeight * imgScale;
    } else {
      drawWidth = outputWidth * scale;
      drawHeight = outputHeight * scale;
    }

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Apply filters
    const filters: string[] = [];
    
    if (edits.blur > 0) filters.push(`blur(${edits.blur}px)`);
    if (edits.grayscale) filters.push('grayscale(100%)');
    if (edits.brightness !== 100) filters.push(`brightness(${edits.brightness}%)`);
    if (edits.contrast !== 100) filters.push(`contrast(${edits.contrast}%)`);

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.filter = filters.join(' ');
        tempCtx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }

    // Draw crop overlay if in crop mode
    if (editMode === 'crop') {
      // Dark overlay
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
      const handleSize = 10;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;

      const corners = [
        [cropX, cropY],
        [cropX + cropW, cropY],
        [cropX, cropY + cropH],
        [cropX + cropW, cropY + cropH],
      ];

      corners.forEach(([x, y]) => {
        ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
      });
    }

    // Export processed image
    onProcessed(canvas.toDataURL('image/png'));
  }, [imageUrl, edits, onProcessed, isImageLoaded, editMode, cropArea]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Crop interaction handlers
  const getHandleAt = (canvas: HTMLCanvasElement, xPercent: number, yPercent: number) => {
    const handleSize = 10;
    const handleMargin = 5;
    const effectiveHandleSize = handleSize + handleMargin;
    const edgeMargin = 8; // Margin for edge detection

    const cropX = (cropArea.x / 100) * canvas.width;
    const cropY = (cropArea.y / 100) * canvas.height;
    const cropW = (cropArea.width / 100) * canvas.width;
    const cropH = (cropArea.height / 100) * canvas.height;

    const x = (xPercent / 100) * canvas.width;
    const y = (yPercent / 100) * canvas.height;

    // Check corners first (higher priority than edges)
    if (
      x >= cropX - effectiveHandleSize / 2 &&
      x <= cropX + effectiveHandleSize / 2 &&
      y >= cropY - effectiveHandleSize / 2 &&
      y <= cropY + effectiveHandleSize / 2
    ) return 'tl';
    
    if (
      x >= cropX + cropW - effectiveHandleSize / 2 &&
      x <= cropX + cropW + effectiveHandleSize / 2 &&
      y >= cropY - effectiveHandleSize / 2 &&
      y <= cropY + effectiveHandleSize / 2
    ) return 'tr';
    
    if (
      x >= cropX - effectiveHandleSize / 2 &&
      x <= cropX + effectiveHandleSize / 2 &&
      y >= cropY + cropH - effectiveHandleSize / 2 &&
      y <= cropY + cropH + effectiveHandleSize / 2
    ) return 'bl';
    
    if (
      x >= cropX + cropW - effectiveHandleSize / 2 &&
      x <= cropX + cropW + effectiveHandleSize / 2 &&
      y >= cropY + cropH - effectiveHandleSize / 2 &&
      y <= cropY + cropH + effectiveHandleSize / 2
    ) return 'br';

    // Check edges
    if (Math.abs(y - cropY) <= edgeMargin && x >= cropX && x <= cropX + cropW) return 't';
    if (Math.abs(x - (cropX + cropW)) <= edgeMargin && y >= cropY && y <= cropY + cropH) return 'r';
    if (Math.abs(y - (cropY + cropH)) <= edgeMargin && x >= cropX && x <= cropX + cropW) return 'b';
    if (Math.abs(x - cropX) <= edgeMargin && y >= cropY && y <= cropY + cropH) return 'l';

    // Check if inside box
    if (x > cropX && x < cropX + cropW && y > cropY && y < cropY + cropH) {
      return 'box';
    }

    return null;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode !== 'crop' || isDragging) return;
    
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
    } else if (handle === 't' || handle === 'b') {
      canvas.style.cursor = 'ns-resize';
    } else if (handle === 'l' || handle === 'r') {
      canvas.style.cursor = 'ew-resize';
    } else if (handle === 'box') {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = 'crosshair';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode !== 'crop') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const handle = getHandleAt(canvas, x, y);
    setDraggedPart(handle);
    setIsDragging(true);
    
    // Store in ref for immediate access
    draggedPartRef.current = handle;

    if (handle === 'box') {
      const offset = { x: x - cropArea.x, y: y - cropArea.y };
      setDragStartOffset(offset);
      dragStartOffsetRef.current = offset;
    } else if (!handle) {
      setCropArea({ x, y, width: 0, height: 0 });
    }

    const handleWindowMouseMove = (event: MouseEvent) => {
      const newX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

      setCropArea((prev) => {
        let { x: prevX, y: prevY, width: prevW, height: prevH } = prev;
        const currentDraggedPart = draggedPartRef.current;

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
          case 't':
            prevH += prevY - newY;
            prevY = newY;
            break;
          case 'r':
            prevW = newX - prevX;
            break;
          case 'b':
            prevH = newY - prevY;
            break;
          case 'l':
            prevW += prevX - newX;
            prevX = newX;
            break;
          case 'box':
            prevX = newX - dragStartOffsetRef.current.x;
            prevY = newY - dragStartOffsetRef.current.y;
            break;
          default:
            return {
              x: Math.min(x, newX),
              y: Math.min(y, newY),
              width: Math.abs(newX - x),
              height: Math.abs(newY - y),
            };
        }

        if (prevW < 0) {
          prevX += prevW;
          prevW = Math.abs(prevW);
        }
        if (prevH < 0) {
          prevY += prevH;
          prevH = Math.abs(prevH);
        }

        prevX = Math.max(0, Math.min(100 - prevW, prevX));
        prevY = Math.max(0, Math.min(100 - prevH, prevY));

        return { x: prevX, y: prevY, width: prevW, height: prevH };
      });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      setDraggedPart(null);
      draggedPartRef.current = null;
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full rounded-lg shadow-2xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleCanvasMouseMove}
      />
    </div>
  );
}
