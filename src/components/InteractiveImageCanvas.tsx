import { useEffect, useRef, useState, useCallback } from 'react';
import { EditValues } from '../App';

interface InteractiveImageCanvasProps {
  imageUrl: string;
  edits: EditValues;
  onProcessed: (dataUrl: string) => void;
  editMode: 'none' | 'crop' | 'rotate' | 'resize';
  onCropChange?: (crop: { x: number; y: number; width: number; height: number }) => void;
  onRotationChange?: (rotation: number) => void;
  onEditEnd?: (action: string) => void;
  onZoomChange?: (zoom: number) => void;
  onResetView?: () => void;
}

export function InteractiveImageCanvas({
  imageUrl,
  edits,
  onProcessed,
  editMode,
  onCropChange,
  onRotationChange,
  onEditEnd,
  onZoomChange,
  onResetView,
}: InteractiveImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Image transformation state (for free move and resize in preview mode)
  const [imageTransform, setImageTransform] = useState({
    x: 0, // X position in canvas (percentage)
    y: 0, // Y position in canvas (percentage)
    scale: 1, // Scale factor
  });
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformType, setTransformType] = useState<'move' | 'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const transformTypeRef = useRef<'move' | 'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const initialScaleRef = useRef(1);
  const initialTransformRef = useRef({ x: 0, y: 0, scale: 1 });
  
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

  // Resize canvas to fill parent
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Make canvas fill the container
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Redraw after resize
      drawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img || !isImageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas fills parent
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

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

    // Calculate base display size (fit to canvas)
    const aspectRatio = outputWidth / outputHeight;
    let baseWidth = canvas.width * 0.8; // Leave some margin
    let baseHeight = canvas.height * 0.8;
    
    if (baseWidth / baseHeight > aspectRatio) {
      baseWidth = baseHeight * aspectRatio;
    } else {
      baseHeight = baseWidth / aspectRatio;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = edits.frame?.backgroundColor || '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate final dimensions with user transform
    const finalWidth = baseWidth * imageTransform.scale;
    const finalHeight = baseHeight * imageTransform.scale;
    
    // Calculate position (center + offset)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const imgX = centerX + (imageTransform.x * canvas.width / 100) - finalWidth / 2;
    const imgY = centerY + (imageTransform.y * canvas.height / 100) - finalHeight / 2;

    ctx.save();
    
    // Apply transformations at image center
    ctx.translate(imgX + finalWidth / 2, imgY + finalHeight / 2);
    
    if (edits.rotation) {
      ctx.rotate((edits.rotation * Math.PI) / 180);
    }

    const scaleX = edits.flipH ? -1 : 1;
    const scaleY = edits.flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -finalWidth / 2,
      -finalHeight / 2,
      finalWidth,
      finalHeight
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

    // Draw overlays (shapes, image overlays, text overlays)
    if (editMode !== 'crop') {
      // Calculate the scale factor for overlays
      const overlayScale = (finalWidth / outputWidth);

      // Draw shapes
      if (edits.shapes && edits.shapes.length > 0) {
        edits.shapes.forEach((shape) => {
          ctx.save();
          ctx.globalAlpha = shape.opacity / 100;

          const shapeX = imgX + (shape.x * overlayScale);
          const shapeY = imgY + (shape.y * overlayScale);

          if (shape.type === 'rectangle') {
            const width = (shape.width || 100) * overlayScale;
            const height = (shape.height || 100) * overlayScale;
            
            if (shape.fillColor && shape.fillColor !== 'transparent') {
              ctx.fillStyle = shape.fillColor;
              ctx.fillRect(shapeX, shapeY, width, height);
            }
            
            ctx.strokeStyle = shape.strokeColor;
            ctx.lineWidth = shape.strokeWidth;
            ctx.strokeRect(shapeX, shapeY, width, height);
          } else if (shape.type === 'circle') {
            const radius = ((shape.width || 100) / 2) * overlayScale;
            const centerX = shapeX + radius;
            const centerY = shapeY + radius;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            
            if (shape.fillColor && shape.fillColor !== 'transparent') {
              ctx.fillStyle = shape.fillColor;
              ctx.fill();
            }
            
            ctx.strokeStyle = shape.strokeColor;
            ctx.lineWidth = shape.strokeWidth;
            ctx.stroke();
          } else if (shape.type === 'line') {
            const x2 = imgX + ((shape.x2 || 0) * overlayScale);
            const y2 = imgY + ((shape.y2 || 0) * overlayScale);
            
            ctx.strokeStyle = shape.strokeColor;
            ctx.lineWidth = shape.strokeWidth;
            ctx.beginPath();
            ctx.moveTo(shapeX, shapeY);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          } else if (shape.type === 'arrow') {
            const x2 = imgX + ((shape.x2 || 0) * overlayScale);
            const y2 = imgY + ((shape.y2 || 0) * overlayScale);
            
            ctx.strokeStyle = shape.strokeColor;
            ctx.lineWidth = shape.strokeWidth;
            ctx.fillStyle = shape.strokeColor;
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(shapeX, shapeY);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Draw arrowhead
            const angle = Math.atan2(y2 - shapeY, x2 - shapeX);
            const headLength = 15 * overlayScale;
            
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
              x2 - headLength * Math.cos(angle - Math.PI / 6),
              y2 - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              x2 - headLength * Math.cos(angle + Math.PI / 6),
              y2 - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        });
      }

      // Draw image overlays
      if (edits.imageOverlays && edits.imageOverlays.length > 0) {
        edits.imageOverlays.forEach((overlay) => {
          const overlayImg = new Image();
          overlayImg.src = overlay.imageData;
          
          if (overlayImg.complete && overlayImg.naturalWidth > 0) {
            ctx.save();
            
            // Set blend mode
            ctx.globalCompositeOperation = overlay.blendMode as GlobalCompositeOperation;
            
            // Set opacity
            ctx.globalAlpha = overlay.opacity / 100;
            
            // Calculate overlay position and size
            const overlayX = imgX + (overlay.x * overlayScale);
            const overlayY = imgY + (overlay.y * overlayScale);
            const overlayWidth = overlay.width * overlayScale;
            const overlayHeight = overlay.height * overlayScale;
            
            // Translate to overlay center for rotation
            ctx.translate(overlayX + overlayWidth / 2, overlayY + overlayHeight / 2);
            
            // Apply rotation
            if (overlay.rotation) {
              ctx.rotate((overlay.rotation * Math.PI) / 180);
            }
            
            // Apply flip
            const flipScaleX = overlay.flipH ? -1 : 1;
            const flipScaleY = overlay.flipV ? -1 : 1;
            ctx.scale(flipScaleX, flipScaleY);
            
            // Draw overlay image
            ctx.drawImage(
              overlayImg,
              -overlayWidth / 2,
              -overlayHeight / 2,
              overlayWidth,
              overlayHeight
            );
            
            ctx.restore();
          }
        });
      }

      // Draw text overlays
      if (edits.textOverlays && edits.textOverlays.length > 0) {
        edits.textOverlays.forEach((text) => {
          ctx.save();
          
          ctx.globalAlpha = text.opacity / 100;
          
          // Calculate text position
          const textX = imgX + (text.x * overlayScale);
          const textY = imgY + (text.y * overlayScale);
          
          // Apply text transformations
          ctx.translate(textX, textY);
          
          if (text.rotation) {
            ctx.rotate((text.rotation * Math.PI) / 180);
          }
          
          // Set font properties
          const fontSize = text.fontSize * overlayScale;
          ctx.font = `${text.fontStyle} ${text.fontWeight} ${fontSize}px ${text.fontFamily}`;
          ctx.fillStyle = text.color;
          ctx.textAlign = text.textAlign;
          ctx.textBaseline = 'top';
          
          // Draw text
          ctx.fillText(text.text, 0, 0);
          
          ctx.restore();
        });
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
  }, [imageUrl, edits, onProcessed, isImageLoaded, editMode, cropArea, imageTransform, isTransforming]);

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

  // Free transform handlers (for preview mode)
  const getTransformHandleAt = (canvas: HTMLCanvasElement, mouseX: number, mouseY: number): 'tl' | 'tr' | 'bl' | 'br' | 'move' | null => {
    const img = imgRef.current;
    if (!img) return null;

    // Calculate image bounds
    const aspectRatio = img.width / img.height;
    let baseWidth = canvas.width * 0.8;
    let baseHeight = canvas.height * 0.8;
    
    if (baseWidth / baseHeight > aspectRatio) {
      baseWidth = baseHeight * aspectRatio;
    } else {
      baseHeight = baseWidth / aspectRatio;
    }

    const finalWidth = baseWidth * imageTransform.scale;
    const finalHeight = baseHeight * imageTransform.scale;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const imgX = centerX + (imageTransform.x * canvas.width / 100) - finalWidth / 2;
    const imgY = centerY + (imageTransform.y * canvas.height / 100) - finalHeight / 2;

    const handleSize = 12;
    const handleMargin = 10;

    // Check corner handles for resize with specific corners
    const corners = [
      { x: imgX, y: imgY, type: 'tl' as const },
      { x: imgX + finalWidth, y: imgY, type: 'tr' as const },
      { x: imgX, y: imgY + finalHeight, type: 'bl' as const },
      { x: imgX + finalWidth, y: imgY + finalHeight, type: 'br' as const },
    ];

    for (const corner of corners) {
      const dist = Math.sqrt(Math.pow(mouseX - corner.x, 2) + Math.pow(mouseY - corner.y, 2));
      if (dist <= handleSize + handleMargin) {
        return corner.type;
      }
    }

    // Check if inside image for move
    if (mouseX >= imgX && mouseX <= imgX + finalWidth && 
        mouseY >= imgY && mouseY <= imgY + finalHeight) {
      return 'move';
    }

    return null;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (editMode === 'crop') {
      if (isDragging) return;
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
    } else if (editMode === 'none' && !isTransforming) {
      // Free transform mode
      const handle = getTransformHandleAt(canvas, mouseX, mouseY);
      if (handle === 'tl' || handle === 'br') {
        canvas.style.cursor = 'nwse-resize'; // Top-left or bottom-right
      } else if (handle === 'tr' || handle === 'bl') {
        canvas.style.cursor = 'nesw-resize'; // Top-right or bottom-left
      } else if (handle === 'move') {
        canvas.style.cursor = 'move';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (editMode === 'crop') {
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
    } else if (editMode === 'none') {
      // Free transform mode
      const handle = getTransformHandleAt(canvas, mouseX, mouseY);
      if (!handle) return;

      setIsTransforming(true);
      setTransformType(handle);
      transformTypeRef.current = handle;
      setDragStart({ x: mouseX, y: mouseY });
      dragStartRef.current = { x: mouseX, y: mouseY };
      initialScaleRef.current = imageTransform.scale;
      initialTransformRef.current = { ...imageTransform };
    }

    if (editMode !== 'crop' && editMode !== 'none') return;

    const handleWindowMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (editMode === 'crop') {
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
      } else if (editMode === 'none' && transformTypeRef.current) {
        // Free transform
        const deltaX = mouseX - dragStartRef.current.x;
        const deltaY = mouseY - dragStartRef.current.y;

        if (transformTypeRef.current === 'move') {
          setImageTransform((prev) => ({
            ...prev,
            x: prev.x + (deltaX / canvas.width) * 100,
            y: prev.y + (deltaY / canvas.height) * 100,
          }));
          dragStartRef.current = { x: mouseX, y: mouseY };
        } else if (transformTypeRef.current === 'tl' || transformTypeRef.current === 'tr' || 
                   transformTypeRef.current === 'bl' || transformTypeRef.current === 'br') {
          // Calculate distance from opposite corner for scaling
          const img = imgRef.current;
          if (!img) return;

          const aspectRatio = img.width / img.height;
          let baseWidth = canvas.width * 0.8;
          let baseHeight = canvas.height * 0.8;
          
          if (baseWidth / baseHeight > aspectRatio) {
            baseWidth = baseHeight * aspectRatio;
          } else {
            baseHeight = baseWidth / aspectRatio;
          }

          const initialWidth = baseWidth * initialScaleRef.current;
          const initialHeight = baseHeight * initialScaleRef.current;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const imgX = centerX + (initialTransformRef.current.x * canvas.width / 100) - initialWidth / 2;
          const imgY = centerY + (initialTransformRef.current.y * canvas.height / 100) - initialHeight / 2;

          // Get opposite corner based on which corner is being dragged
          let oppX = 0, oppY = 0;
          if (transformTypeRef.current === 'tl') {
            oppX = imgX + initialWidth;
            oppY = imgY + initialHeight;
          } else if (transformTypeRef.current === 'tr') {
            oppX = imgX;
            oppY = imgY + initialHeight;
          } else if (transformTypeRef.current === 'bl') {
            oppX = imgX + initialWidth;
            oppY = imgY;
          } else if (transformTypeRef.current === 'br') {
            oppX = imgX;
            oppY = imgY;
          }

          // Calculate distance from opposite corner
          const initialDist = Math.sqrt(
            Math.pow(dragStartRef.current.x - oppX, 2) + 
            Math.pow(dragStartRef.current.y - oppY, 2)
          );
          const currentDist = Math.sqrt(
            Math.pow(mouseX - oppX, 2) + 
            Math.pow(mouseY - oppY, 2)
          );
          
          const scaleFactor = currentDist / initialDist;
          const newScale = Math.max(0.1, Math.min(5, initialScaleRef.current * scaleFactor));
          
          setImageTransform((prev) => ({
            ...prev,
            scale: newScale,
          }));
        }
      }
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      setIsTransforming(false);
      setDraggedPart(null);
      setTransformType(null);
      draggedPartRef.current = null;
      transformTypeRef.current = null;
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      if (onEditEnd) {
        onEditEnd('Crop');
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Reset transform when switching modes
  useEffect(() => {
    if (editMode !== 'none') {
      setImageTransform({ x: 0, y: 0, scale: 1 });
    }
  }, [editMode]);

  // Handle keyboard zoom (Ctrl + +/-)
  useEffect(() => {
    if (editMode !== 'none') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setImageTransform((prev) => ({
          ...prev,
          scale: Math.min(5, prev.scale * 1.1),
        }));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setImageTransform((prev) => ({
          ...prev,
          scale: Math.max(0.1, prev.scale / 1.1),
        }));
      } else if (e.key === '0') {
        e.preventDefault();
        setImageTransform((prev) => ({
          ...prev,
          scale: 1,
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode]);

  // Handle mouse wheel zoom with native event listener to properly prevent default
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || editMode !== 'none') return;

    const handleWheelNative = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setImageTransform((prev) => ({
        ...prev,
        scale: Math.max(0.1, Math.min(5, prev.scale * delta)),
      }));
    };

    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelNative);
  }, [editMode]);

  // Handle mouse wheel zoom (React synthetic event as backup)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (editMode !== 'none') return;
    if (!e.ctrlKey && !e.metaKey) return;

    e.preventDefault();
    e.stopPropagation();
  };

  // Report zoom changes to parent
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(Math.round(imageTransform.scale * 100));
    }
  }, [imageTransform.scale, onZoomChange]);

  // Handle reset view
  const handleResetView = useCallback(() => {
    setImageTransform({ x: 0, y: 0, scale: 1 });
    if (onResetView) {
      onResetView();
    }
  }, [onResetView]);

  // Expose reset function via window for external access
  useEffect(() => {
    if (onResetView) {
      (window as any).__resetCanvasView = handleResetView;
    }
    return () => {
      delete (window as any).__resetCanvasView;
    };
  }, [handleResetView, onResetView]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
