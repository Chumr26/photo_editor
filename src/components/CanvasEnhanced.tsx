import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

type DragHandle = 'tl' | 'tr' | 'bl' | 'br' | 'rotate' | 'move' | null;
type SelectedElement = { type: 'text'; id: string } | { type: 'layer'; id: string } | null;

export function Canvas() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const lastPosRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const isCroppingRef = useRef(false);
  const cropStartPosRef = useRef({ x: 0, y: 0 });
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<{ type: 'text' | 'layer', id: string } | null>(null);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [elementStartBounds, setElementStartBounds] = useState<any>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [copiedElement, setCopiedElement] = useState<{ type: 'text' | 'layer', data: any } | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchCenter, setLastTouchCenter] = useState<{x: number, y: number} | null>(null);
  const [isTouchPanning, setIsTouchPanning] = useState(false);

  const {
    image,
    zoom,
    panX,
    panY,
    setPan,
    adjustments,
    showGrid,
    showRulers,
    cropMode,
    cropRect,
    setCropRect,
    textBoxes,
    updateTextBox,
    deleteTextBox,
    duplicateTextBox,
    layers,
    selectedLayerId,
    selectLayer,
    updateLayer,
    deleteLayer,
    addLayer,
    tool,
    brushSettings,
    settings,
  } = useEditorStore();

  // Load image when src changes
  useEffect(() => {
    if (!image) return;
    const img = imageRef.current;
    img.crossOrigin = 'anonymous';
    
    if (img.src !== image.src) {
      setIsImageLoaded(false);
      img.onload = () => setIsImageLoaded(true);
      img.src = image.src;
    } else if (img.complete) {
      setIsImageLoaded(true);
    }
  }, [image?.src]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = document.activeElement as HTMLElement;
      const isInput = target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);

      // Space key for panning
      if (e.code === 'Space' && !e.repeat && !isInput) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      
      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !isInput) {
        e.preventDefault();
        if (selectedElement.type === 'text') {
          deleteTextBox(selectedElement.id);
        } else if (selectedElement.type === 'layer') {
          deleteLayer(selectedElement.id);
        }
        setSelectedElement(null);
        toast.success(t('toast.delete'));
      }
      
      // Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement && !isInput) {
        e.preventDefault();
        if (selectedElement.type === 'text') {
          const textBox = textBoxes.find(t => t.id === selectedElement.id);
          if (textBox) {
            setCopiedElement({ type: 'text', data: textBox });
            toast.success(t('toast.copy'));
          }
        } else if (selectedElement.type === 'layer') {
          const layer = layers.find(l => l.id === selectedElement.id);
          if (layer) {
            setCopiedElement({ type: 'layer', data: layer });
            toast.success(t('toast.copy'));
          }
        }
      }
      
      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedElement && !isInput) {
        e.preventDefault();
        if (copiedElement.type === 'text') {
          const newTextBox = {
            ...copiedElement.data,
            id: Date.now().toString(),
            x: copiedElement.data.x + 20,
            y: copiedElement.data.y + 20,
          };
          useEditorStore.getState().addTextBox(newTextBox);
          setSelectedElement({ type: 'text', id: newTextBox.id });
          toast.success(t('toast.paste'));
        } else if (copiedElement.type === 'layer') {
          const newLayer = {
            ...copiedElement.data,
            id: Date.now().toString(),
            name: `${copiedElement.data.name} (copy)`,
            x: copiedElement.data.x + 20,
            y: copiedElement.data.y + 20,
          };
          addLayer(newLayer);
          setSelectedElement({ type: 'layer', id: newLayer.id });
          toast.success(t('toast.paste'));
        }
      }
      
      // Duplicate (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement && !isInput) {
        e.preventDefault();
        if (selectedElement.type === 'text') {
          duplicateTextBox(selectedElement.id);
          toast.success(t('toast.duplicate'));
        } else if (selectedElement.type === 'layer') {
          const layer = layers.find(l => l.id === selectedElement.id);
          if (layer) {
            const newLayer = {
              ...layer,
              id: Date.now().toString(),
              name: `${layer.name} (copy)`,
              x: layer.x + 20,
              y: layer.y + 20,
            };
            addLayer(newLayer);
            setSelectedElement({ type: 'layer', id: newLayer.id });
            toast.success(t('toast.duplicate'));
          }
        }
      }
      
      // Arrow keys to nudge
      if (selectedElement && !isInput) {
        const nudge = e.shiftKey ? 10 : 1;
        let moved = false;
        
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (selectedElement.type === 'text') {
            const textBox = textBoxes.find(t => t.id === selectedElement.id);
            if (textBox) updateTextBox(selectedElement.id, { x: textBox.x - nudge });
          } else {
            const layer = layers.find(l => l.id === selectedElement.id);
            if (layer) updateLayer(selectedElement.id, { x: layer.x - nudge });
          }
          moved = true;
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (selectedElement.type === 'text') {
            const textBox = textBoxes.find(t => t.id === selectedElement.id);
            if (textBox) updateTextBox(selectedElement.id, { x: textBox.x + nudge });
          } else {
            const layer = layers.find(l => l.id === selectedElement.id);
            if (layer) updateLayer(selectedElement.id, { x: layer.x + nudge });
          }
          moved = true;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedElement.type === 'text') {
            const textBox = textBoxes.find(t => t.id === selectedElement.id);
            if (textBox) updateTextBox(selectedElement.id, { y: textBox.y - nudge });
          } else {
            const layer = layers.find(l => l.id === selectedElement.id);
            if (layer) updateLayer(selectedElement.id, { y: layer.y - nudge });
          }
          moved = true;
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (selectedElement.type === 'text') {
            const textBox = textBoxes.find(t => t.id === selectedElement.id);
            if (textBox) updateTextBox(selectedElement.id, { y: textBox.y + nudge });
          } else {
            const layer = layers.find(l => l.id === selectedElement.id);
            if (layer) updateLayer(selectedElement.id, { y: layer.y + nudge });
          }
          moved = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElement, deleteTextBox, deleteLayer, textBoxes, layers, updateTextBox, updateLayer, copiedElement, duplicateTextBox, addLayer]);

  // Apply filters to canvas
  const applyFilters = useCallback((ctx: CanvasRenderingContext2D) => {
    const filters: string[] = [];
    
    if (adjustments.brightness !== 0) {
      filters.push(`brightness(${1 + adjustments.brightness / 100})`);
    }
    if (adjustments.contrast !== 0) {
      filters.push(`contrast(${1 + adjustments.contrast / 100})`);
    }
    if (adjustments.saturation !== 0) {
      filters.push(`saturate(${1 + adjustments.saturation / 100})`);
    }
    if (adjustments.blur > 0) {
      filters.push(`blur(${adjustments.blur}px)`);
    }
    if (adjustments.hue !== 0) {
      filters.push(`hue-rotate(${adjustments.hue}deg)`);
    }
    if (adjustments.grayscale) {
      filters.push('grayscale(100%)');
    }
    if (adjustments.sepia) {
      filters.push('sepia(100%)');
    }

    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
  }, [adjustments]);

  // Apply sharpen filter using convolution matrix
  const applySharpen = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, amount: number) => {
    if (amount === 0) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // Create output buffer
    const output = new Uint8ClampedArray(pixels);
    
    // Sharpen kernel (convolution matrix)
    // Amount scales the effect
    const divisor = amount / 25; // Scale 0-100 to reasonable values
    const kernel = [
      0, -divisor, 0,
      -divisor, 1 + 4 * divisor, -divisor,
      0, -divisor, 0
    ];
    
    // Apply convolution
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only, skip alpha
          let sum = 0;
          
          // Apply kernel
          sum += pixels[((y - 1) * width + (x - 1)) * 4 + c] * kernel[0];
          sum += pixels[((y - 1) * width + x) * 4 + c] * kernel[1];
          sum += pixels[((y - 1) * width + (x + 1)) * 4 + c] * kernel[2];
          sum += pixels[(y * width + (x - 1)) * 4 + c] * kernel[3];
          sum += pixels[(y * width + x) * 4 + c] * kernel[4];
          sum += pixels[(y * width + (x + 1)) * 4 + c] * kernel[5];
          sum += pixels[((y + 1) * width + (x - 1)) * 4 + c] * kernel[6];
          sum += pixels[((y + 1) * width + x) * 4 + c] * kernel[7];
          sum += pixels[((y + 1) * width + (x + 1)) * 4 + c] * kernel[8];
          
          output[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
        }
      }
    }
    
    // Copy output back
    for (let i = 0; i < pixels.length; i++) {
      if (i % 4 !== 3) { // Skip alpha channel
        pixels[i] = output[i];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Main canvas rendering
  useEffect(() => {
    if (!canvasRef.current || !image || !isImageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const renderCanvas = async () => {
      // Load all layer images first
      const loadedImages = await Promise.all(
        layers.map(layer => {
          if (layer.type === 'image' && layer.data) {
            return new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(img);
              img.src = layer.data!;
            });
          }
          return Promise.resolve(null);
        })
      );

      // Set canvas size
      canvas.width = image.width;
      canvas.height = image.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base image
      const img = imageRef.current;
      ctx.save();
      applyFilters(ctx);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none'; // Reset filter
      ctx.restore();

      // Apply sharpen filter
      applySharpen(ctx, canvas, adjustments.sharpen);

      // Draw layers
      layers.forEach((layer, index) => {
        if (!layer.visible) return;

        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;

        if (layer.type === 'image' && layer.data) {
          const layerImg = loadedImages[index];
          
          if (layerImg) {
            // Apply rotation if any
            const centerX = layer.x + layer.width / 2;
            const centerY = layer.y + layer.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((layer.rotation * Math.PI) / 180);
            ctx.drawImage(layerImg, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
            ctx.rotate((-layer.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
            
            // Draw selection outline if selected
            if (selectedElement?.type === 'layer' && selectedElement.id === layer.id) {
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
              
              // Draw corner resize handles
              const handleSize = 10;
              const handles = [
                { x: layer.x, y: layer.y, label: 'tl' },
                { x: layer.x + layer.width, y: layer.y, label: 'tr' },
                { x: layer.x, y: layer.y + layer.height, label: 'bl' },
                { x: layer.x + layer.width, y: layer.y + layer.height, label: 'br' },
              ];
              
              ctx.fillStyle = '#fff';
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              handles.forEach(handle => {
                ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
                ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
              });
              
              // Draw rotation handle
              const rotateHandleY = layer.y - 30;
              const rotateHandleX = layer.x + layer.width / 2;
              ctx.beginPath();
              ctx.arc(rotateHandleX, rotateHandleY, 8, 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.fill();
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              ctx.stroke();
              
              // Draw line from rotation handle to top edge
              ctx.beginPath();
              ctx.moveTo(rotateHandleX, rotateHandleY + 8);
              ctx.lineTo(rotateHandleX, layer.y);
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 1;
              ctx.setLineDash([5, 5]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }

        ctx.restore();
      });

      // Draw text boxes
      textBoxes.forEach((textBox) => {
        ctx.save();
        ctx.font = `${textBox.fontStyle || 'normal'} ${textBox.fontWeight || '400'} ${textBox.fontSize}px ${textBox.fontFamily}`;
        ctx.fillStyle = textBox.color;
        ctx.textAlign = (textBox.textAlign as CanvasTextAlign) || 'left';
        ctx.textBaseline = 'top';
        
        // Handle multi-line text
        const lines = textBox.text.split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, textBox.x, textBox.y + (i * textBox.fontSize * 1.2));
        });
        
        // Draw text bounding box if selected or move tool is active
        if (tool === 'move' || tool === 'text' || (selectedElement?.type === 'text' && selectedElement.id === textBox.id)) {
          const metrics = ctx.measureText(textBox.text);
          const width = metrics.width;
          const height = textBox.fontSize * lines.length * 1.2;
          
          const isSelected = selectedElement?.type === 'text' && selectedElement.id === textBox.id;
          
          ctx.strokeStyle = isSelected ? '#3b82f6' : '#3b82f688';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.setLineDash(isSelected ? [] : [5, 5]);
          ctx.strokeRect(textBox.x - 5, textBox.y - 5, width + 10, height + 10);
          ctx.setLineDash([]);
          
          // Draw resize handles for selected text
          if (isSelected) {
            const handleSize = 10;
            const handles = [
              { x: textBox.x - 5, y: textBox.y - 5 },
              { x: textBox.x + width + 5, y: textBox.y - 5 },
              { x: textBox.x - 5, y: textBox.y + height + 5 },
              { x: textBox.x + width + 5, y: textBox.y + height + 5 },
            ];
            
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            handles.forEach(handle => {
              ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
              ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
            });
          }
        }
        
        ctx.restore();
      });

      // Draw crop overlay
      if (cropMode && cropRect) {
        ctx.save();
        
        // Draw semi-transparent overlay in 4 rectangles around the crop area
        // This way we don't clear the image inside the crop area
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        
        const cropX = Math.min(cropRect.x, cropRect.x + cropRect.width);
        const cropY = Math.min(cropRect.y, cropRect.y + cropRect.height);
        const cropW = Math.abs(cropRect.width);
        const cropH = Math.abs(cropRect.height);
        
        // Top rectangle
        ctx.fillRect(0, 0, canvas.width, cropY);
        
        // Bottom rectangle
        ctx.fillRect(0, cropY + cropH, canvas.width, canvas.height - (cropY + cropH));
        
        // Left rectangle
        ctx.fillRect(0, cropY, cropX, cropH);
        
        // Right rectangle
        ctx.fillRect(cropX + cropW, cropY, canvas.width - (cropX + cropW), cropH);
        
        // Crop border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropX, cropY, cropW, cropH);
        
        // Crop handles
        const handleSize = 10;
        const handles = [
          { x: cropX, y: cropY },
          { x: cropX + cropW, y: cropY },
          { x: cropX, y: cropY + cropH },
          { x: cropX + cropW, y: cropY + cropH },
        ];
        
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        handles.forEach(handle => {
          ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
        });
        
        ctx.restore();
      }

      // Clear drawing canvas if not drawing
      // This prevents flickering when a new layer is added
      if (drawingCanvasRef.current && !isDrawingRef.current) {
         const dCtx = drawingCanvasRef.current.getContext('2d');
         dCtx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    renderCanvas();
  }, [image, adjustments, textBoxes, layers, cropMode, cropRect, applyFilters, tool, selectedLayerId, selectedElement, applySharpen, isImageLoaded]);

  // Get mouse position relative to canvas
  const getCanvasCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent | { clientX: number, clientY: number }) => {
    if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    
    // Get mouse/touch position
    let clientX, clientY;
    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      // @ts-ignore
      clientX = e.clientX;
      // @ts-ignore
      clientY = e.clientY;
    }
    
    // Get mouse position relative to canvas element (accounts for CSS scaling)
    const mouseX = clientX - canvasRect.left;
    const mouseY = clientY - canvasRect.top;
    
    // Calculate the ratio between canvas internal size and rendered size
    // This accounts for CSS scaling (maxWidth/maxHeight: 100%)
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    // Convert mouse position to canvas coordinates
    const x = mouseX * scaleX;
    const y = mouseY * scaleY;
    
    return { x, y };
  }, []);

  // Check if clicking on text box
  const getClickedTextBox = useCallback((x: number, y: number) => {
    if (!canvasRef.current) return null;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;

    for (let i = textBoxes.length - 1; i >= 0; i--) {
      const box = textBoxes[i];
      ctx.font = `${box.fontStyle || 'normal'} ${box.fontWeight || '400'} ${box.fontSize}px ${box.fontFamily}`;
      const metrics = ctx.measureText(box.text);
      const lines = box.text.split('\n');
      const width = metrics.width;
      const height = box.fontSize * lines.length * 1.2;
      
      if (x >= box.x - 5 && x <= box.x + width + 5 &&
          y >= box.y - 5 && y <= box.y + height + 5) {
        return { id: box.id, bounds: { x: box.x, y: box.y, width, height } };
      }
    }
    return null;
  }, [textBoxes]);

  // Check if clicking on layer
  const getClickedLayer = useCallback((x: number, y: number) => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible || layer.locked) continue;
      
      if (x >= layer.x && x <= layer.x + layer.width &&
          y >= layer.y && y <= layer.y + layer.height) {
        return { id: layer.id, bounds: { x: layer.x, y: layer.y, width: layer.width, height: layer.height } };
      }
    }
    return null;
  }, [layers]);

  // Check if clicking on resize handle or rotation handle
  const getClickedHandle = useCallback((x: number, y: number, bounds: any, isLayer: boolean): DragHandle => {
    const handleSize = 10;
    
    // Check rotation handle for layers
    if (isLayer) {
      const rotateHandleY = bounds.y - 30;
      const rotateHandleX = bounds.x + bounds.width / 2;
      const distToRotate = Math.sqrt(Math.pow(x - rotateHandleX, 2) + Math.pow(y - rotateHandleY, 2));
      if (distToRotate <= 8) {
        return 'rotate';
      }
    }
    
    // Check corner handles
    const handles = [
      { x: bounds.x, y: bounds.y, type: 'tl' as DragHandle },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'tr' as DragHandle },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'bl' as DragHandle },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'br' as DragHandle },
    ];
    
    for (const handle of handles) {
      if (x >= handle.x - handleSize && x <= handle.x + handleSize &&
          y >= handle.y - handleSize && y <= handle.y + handleSize) {
        return handle.type;
      }
    }
    
    // Check if inside bounds for move
    if (x >= bounds.x && x <= bounds.x + bounds.width &&
        y >= bounds.y && y <= bounds.y + bounds.height) {
      return 'move';
    }
    
    return null;
  }, []);

  // Drawing functionality
  const startDrawing = useCallback((e: React.MouseEvent) => {
    if (tool !== 'brush' && tool !== 'eraser') return;
    
    const pos = getCanvasCoordinates(e);
    setIsDrawing(true);
    isDrawingRef.current = true;
    lastPosRef.current = pos;
  }, [tool, getCanvasCoordinates]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawingRef.current || !drawingCanvasRef.current) return;
    if (tool !== 'brush' && tool !== 'eraser') return;

    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    
    if (tool === 'brush') {
      ctx.strokeStyle = brushSettings.color;
      ctx.globalAlpha = brushSettings.opacity;
      
      // Apply hardness by creating a gradient
      if (brushSettings.hardness < 100) {
        const gradient = ctx.createRadialGradient(
          pos.x, pos.y, 0,
          pos.x, pos.y, brushSettings.size / 2
        );
        const hardnessFactor = brushSettings.hardness / 100;
        gradient.addColorStop(0, brushSettings.color);
        gradient.addColorStop(hardnessFactor, brushSettings.color);
        gradient.addColorStop(1, brushSettings.color + '00'); // Transparent at edge
        ctx.strokeStyle = gradient;
      }
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.globalAlpha = brushSettings.opacity;
    }
    
    ctx.lineWidth = brushSettings.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    lastPosRef.current = pos;
  }, [tool, brushSettings, getCanvasCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    
    setIsDrawing(false);
    isDrawingRef.current = false;
    
    // Save drawing as a layer
    if (drawingCanvasRef.current && image) {
      const canvas = drawingCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Check if anything was actually drawn
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasDrawing = false;
        
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] > 0) {
            hasDrawing = true;
            break;
          }
        }
        
        if (hasDrawing) {
          // Convert canvas to data URL
          const dataURL = canvas.toDataURL('image/png');
          
          // Create a new layer with the drawing
          const newLayer = {
            id: Date.now().toString(),
            name: tool === 'brush' ? `Vẽ ${layers.length + 1}` : `Xóa ${layers.length + 1}`,
            type: 'image' as const,
            visible: true,
            opacity: 100,
            blendMode: 'source-over' as const,
            locked: false,
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            rotation: 0,
            data: dataURL,
          };
          
          addLayer(newLayer);
          toast.success(tool === 'brush' ? t('toast.drawing.saved') : t('toast.erasing.saved'));
          
          // Drawing canvas will be cleared in the main render loop after the layer is rendered
          // to prevent flickering
        }
      }
    }
  }, [isDrawing, tool, drawingCanvasRef, image, layers, addLayer]);

  // Crop functionality
  const handleCropStart = useCallback((e: React.MouseEvent) => {
    if (!cropMode || !image) return;
    
    const pos = getCanvasCoordinates(e);
    setIsCropping(true);
    isCroppingRef.current = true;
    cropStartPosRef.current = pos;
    
    setCropRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  }, [cropMode, image, getCanvasCoordinates, setCropRect]);

  const handleCropMove = useCallback((e: React.MouseEvent) => {
    if (!cropMode || !isCroppingRef.current || !cropRect) return;
    
    const pos = getCanvasCoordinates(e);
    const startPos = cropStartPosRef.current;
    
    // Calculate width and height from start position to current position
    let width = pos.x - startPos.x;
    let height = pos.y - startPos.y;
    
    // Apply aspect ratio if set
    if (cropRect.aspectRatio) {
      height = width / cropRect.aspectRatio;
    }
    
    setCropRect({
      ...cropRect,
      x: startPos.x,
      y: startPos.y,
      width,
      height,
    });
  }, [cropMode, cropRect, getCanvasCoordinates, setCropRect]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e);
    
    // Pan with space key or middle mouse
    if (isSpacePressed || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    // Drawing tools
    if (tool === 'brush' || tool === 'eraser') {
      startDrawing(e);
      return;
    }
    
    // Crop mode
    if (cropMode) {
      handleCropStart(e);
      return;
    }
    
    // Move tool - check for text/layer selection
    if (tool === 'move' || tool === 'text') {
      // Check if clicking on currently selected element's handle
      if (selectedElement) {
        let bounds;
        let isLayer = false;
        
        if (selectedElement.type === 'text') {
          const textBox = textBoxes.find(t => t.id === selectedElement.id);
          if (textBox) {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              ctx.font = `${textBox.fontStyle || 'normal'} ${textBox.fontWeight || '400'} ${textBox.fontSize}px ${textBox.fontFamily}`;
              const metrics = ctx.measureText(textBox.text);
              const lines = textBox.text.split('\n');
              bounds = { x: textBox.x - 5, y: textBox.y - 5, width: metrics.width + 10, height: textBox.fontSize * lines.length * 1.2 + 10 };
            }
          }
        } else {
          const layer = layers.find(l => l.id === selectedElement.id);
          if (layer) {
            bounds = { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
            isLayer = true;
          }
        }
        
        if (bounds) {
          const handle = getClickedHandle(pos.x, pos.y, bounds, isLayer);
          if (handle) {
            setDragHandle(handle);
            setDragStartPos(pos);
            setElementStartBounds(bounds);
            return;
          }
        }
      }
      
      // Check text boxes first
      const textResult = getClickedTextBox(pos.x, pos.y);
      if (textResult) {
        setSelectedElement({ type: 'text', id: textResult.id });
        setDragHandle('move');
        setDragStartPos(pos);
        setElementStartBounds(textResult.bounds);
        return;
      }
      
      // Check layers
      const layerResult = getClickedLayer(pos.x, pos.y);
      if (layerResult) {
        selectLayer(layerResult.id);
        setSelectedElement({ type: 'layer', id: layerResult.id });
        setDragHandle('move');
        setDragStartPos(pos);
        setElementStartBounds(layerResult.bounds);
        return;
      }
      
      // Clicked on empty space - deselect
      setSelectedElement(null);
    }
  }, [tool, cropMode, panX, panY, startDrawing, handleCropStart, getCanvasCoordinates, getClickedTextBox, getClickedLayer, selectLayer, isSpacePressed, selectedElement, textBoxes, layers, getClickedHandle]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e);
    
    // Drawing
    if (isDrawingRef.current) {
      draw(e);
      return;
    }
    
    // Panning
    if (isPanning) {
      setPan(e.clientX - panStart.x, e.clientY - panStart.y);
      return;
    }
    
    // Crop
    if (cropMode && cropRect) {
      handleCropMove(e);
      return;
    }
    
    // Transforming selected element
    if (dragHandle && selectedElement && elementStartBounds) {
      const dx = pos.x - dragStartPos.x;
      const dy = pos.y - dragStartPos.y;
      
      if (dragHandle === 'move') {
        // Move element
        if (selectedElement.type === 'text') {
          const textBox = textBoxes.find(t => t.id === selectedElement.id);
          if (textBox) {
            updateTextBox(selectedElement.id, {
              x: elementStartBounds.x + dx,
              y: elementStartBounds.y + dy,
            });
          }
        } else {
          const layer = layers.find(l => l.id === selectedElement.id);
          if (layer) {
            updateLayer(selectedElement.id, {
              x: elementStartBounds.x + dx,
              y: elementStartBounds.y + dy,
            });
          }
        }
      } else if (dragHandle === 'rotate' && selectedElement.type === 'layer') {
        // Rotate layer
        const layer = layers.find(l => l.id === selectedElement.id);
        if (layer) {
          const centerX = layer.x + layer.width / 2;
          const centerY = layer.y + layer.height / 2;
          const angle = Math.atan2(pos.y - centerY, pos.x - centerX) * (180 / Math.PI) + 90;
          updateLayer(selectedElement.id, { rotation: angle });
        }
      } else {
        // Resize element
        if (selectedElement.type === 'layer') {
          const layer = layers.find(l => l.id === selectedElement.id);
          if (layer) {
            let newX = elementStartBounds.x;
            let newY = elementStartBounds.y;
            let newWidth = elementStartBounds.width;
            let newHeight = elementStartBounds.height;
            
            const aspectRatio = elementStartBounds.width / elementStartBounds.height;
            
            if (dragHandle === 'br') {
              newWidth = elementStartBounds.width + dx;
              newHeight = newWidth / aspectRatio;
            } else if (dragHandle === 'tr') {
              newY = elementStartBounds.y + dy;
              newWidth = elementStartBounds.width + dx;
              newHeight = newWidth / aspectRatio;
            } else if (dragHandle === 'bl') {
              newX = elementStartBounds.x + dx;
              newWidth = elementStartBounds.width - dx;
              newHeight = newWidth / aspectRatio;
            } else if (dragHandle === 'tl') {
              newX = elementStartBounds.x + dx;
              newY = elementStartBounds.y + dy;
              newWidth = elementStartBounds.width - dx;
              newHeight = newWidth / aspectRatio;
            }
            
            if (newWidth > 10 && newHeight > 10) {
              updateLayer(selectedElement.id, {
                x: newX,
                y: newY,
                width: Math.abs(newWidth),
                height: Math.abs(newHeight),
              });
            }
          }
        } else if (selectedElement.type === 'text') {
          const textBox = textBoxes.find(t => t.id === selectedElement.id);
          if (textBox && dragHandle !== 'move') {
            const scaleFactor = dragHandle.includes('r') ? 
              (elementStartBounds.width + dx) / elementStartBounds.width :
              (elementStartBounds.width - dx) / elementStartBounds.width;
            
            const newFontSize = Math.max(12, Math.min(200, textBox.fontSize * scaleFactor));
            updateTextBox(selectedElement.id, { fontSize: newFontSize });
          }
        }
      }
    }
  }, [isPanning, cropMode, cropRect, dragHandle, selectedElement, elementStartBounds, panStart, draw, handleCropMove, setPan, getCanvasCoordinates, textBoxes, layers, updateTextBox, updateLayer, dragStartPos]);

  const handleMouseUp = useCallback(() => {
    stopDrawing();
    setIsPanning(false);
    setDragHandle(null);
    setElementStartBounds(null);
    setIsCropping(false);
    isCroppingRef.current = false;
  }, [stopDrawing]);

  // Wheel zoom - using native event listener to support non-passive behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentZoom = useEditorStore.getState().zoom;
        // Zoom in/out based on wheel direction
        const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out if scrolling down, zoom in if scrolling up
        const newZoom = Math.max(10, Math.min(500, currentZoom * delta));
        
        useEditorStore.getState().setZoom(newZoom);
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [isImageLoaded]);

  // Setup drawing canvas
  useEffect(() => {
    if (!drawingCanvasRef.current || !image) return;
    
    const canvas = drawingCanvasRef.current;
    // Only update if dimensions changed to avoid clearing content
    if (canvas.width !== image.width || canvas.height !== image.height) {
      canvas.width = image.width;
      canvas.height = image.height;
    }
  }, [image]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      setLastTouchDistance(dist);
      
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setLastTouchCenter({ x: centerX, y: centerY });
      setIsTouchPanning(true);
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      // Simulate mouse down
      handleMouseDown({
        ...touch,
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        preventDefault: () => {},
        stopPropagation: () => {},
        target: e.target,
        currentTarget: e.currentTarget,
        nativeEvent: e.nativeEvent,
        persist: () => {},
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'mousedown',
      } as unknown as React.MouseEvent);
    }
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      
      if (lastTouchDistance !== null) {
        const delta = dist / lastTouchDistance;
        const newZoom = Math.max(10, Math.min(500, zoom * delta));
        useEditorStore.getState().setZoom(newZoom);
        setLastTouchDistance(dist);
      }
      
      if (lastTouchCenter !== null) {
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        const deltaX = centerX - lastTouchCenter.x;
        const deltaY = centerY - lastTouchCenter.y;
        
        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          setPan(panX + deltaX, panY + deltaY);
          setLastTouchCenter({ x: centerX, y: centerY });
        }
      }
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMouseMove({
        ...touch,
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        preventDefault: () => {},
        stopPropagation: () => {},
        target: e.target,
        currentTarget: e.currentTarget,
        nativeEvent: e.nativeEvent,
        persist: () => {},
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'mousemove',
      } as unknown as React.MouseEvent);
    }
  }, [zoom, lastTouchDistance, handleMouseMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setLastTouchDistance(null);
    setLastTouchCenter(null);
    setIsTouchPanning(false);
    handleMouseUp();
  }, [handleMouseUp]);

  if (!image || !isImageLoaded) return null;

  const scale = zoom / 100;
  
  // Determine cursor based on state
  let cursor = 'default';
  if (isSpacePressed) cursor = 'grab';
  else if (isPanning) cursor = 'grabbing';
  else if (tool === 'brush' || tool === 'eraser') cursor = 'crosshair';
  else if (tool === 'move') cursor = 'move';
  else if (cropMode) cursor = 'crosshair';
  else if (dragHandle) {
    if (dragHandle === 'move') cursor = 'move';
    else if (dragHandle === 'rotate') cursor = 'crosshair';
    else if (dragHandle === 'tl' || dragHandle === 'br') cursor = 'nwse-resize';
    else if (dragHandle === 'tr' || dragHandle === 'bl') cursor = 'nesw-resize';
  }

  
  // Apply canvas background from settings
  let canvasContainerBg = '#1e1e1e'; // default dark
  if (settings.canvasBackground === 'light') {
    canvasContainerBg = '#f5f5f5';
  } else if (settings.canvasBackground === 'checkered') {
    canvasContainerBg = 'transparent';
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-hidden relative flex items-center justify-center ${
        settings.canvasBackground === 'checkered' ? '' : ''
      }`}
      style={{
        cursor,
        touchAction: 'none',
        backgroundColor: canvasContainerBg,
        backgroundImage: settings.canvasBackground === 'checkered' 
          ? `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`
          : undefined,
        backgroundSize: settings.canvasBackground === 'checkered' ? '20px 20px' : undefined,
        backgroundPosition: settings.canvasBackground === 'checkered' ? '0 0, 0 10px, 10px -10px, -10px 0px' : undefined,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Rulers */}
      {showRulers && (
        <>
          <div className="absolute top-0 left-16 right-0 h-6 bg-[#2a2a2a] border-b border-gray-700 flex items-center">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 border-l border-gray-600 h-2 relative">
                <span className="absolute text-[10px] text-gray-500 ml-1">{i * 100}</span>
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-6 bottom-0 w-6 bg-[#2a2a2a] border-r border-gray-700">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="border-t border-gray-600 w-2 relative" style={{ height: '5%' }}>
                <span className="absolute text-[10px] text-gray-500 rotate-90 origin-left ml-1">{i * 100}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Grid overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${settings.gridSize * scale}px ${settings.gridSize * scale}px`,
            backgroundPosition: `${panX}px ${panY}px`,
          }}
        />
      )}

      {/* Canvas container */}
      <div
        className="relative shadow-2xl"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          className="block bg-white"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
        
        <canvas
          ref={drawingCanvasRef}
          className="absolute top-0 left-0 pointer-events-none z-10"
          width={image?.width}
          height={image?.height}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      </div>

      {/* Tool cursor indicator */}
      {(tool === 'brush' || tool === 'eraser') && (
        <div className="absolute bottom-20 left-4 px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white"
              style={{ 
                backgroundColor: tool === 'brush' ? brushSettings.color : 'transparent',
                transform: `scale(${brushSettings.size / 20})`
              }}
            />
            <span>Kích thước: {brushSettings.size}px</span>
          </div>
        </div>
      )}

      {/* Selection info */}
      {selectedElement && (
        <div className="absolute top-4 left-4 px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-gray-300">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                {selectedElement.type === 'text' ? '📝 Chữ được chọn' : '🖼️ Layer được chọn'}
              </span>
            </div>
            <div className="text-xs text-gray-400 space-y-0.5">
              <div>Delete - Xóa</div>
              <div>Ctrl+C - Sao chép</div>
              <div>Ctrl+V - Dán</div>
              <div>Ctrl+D - Nhân đôi</div>
              <div>Arrow keys - Di chuyển (Shift=10px)</div>
            </div>
          </div>
        </div>
      )}

      {/* Space key hint */}
      {isSpacePressed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-gray-300">
          🖐️ Giữ Space để di chuyển / Hold Space to pan
        </div>
      )}

      {/* Navigator mini-map */}
      <div className="absolute bottom-4 right-4 w-48 h-32 bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-2">
          {image && (
            <img
              src={image.src}
              alt="Navigator"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
        <div className="absolute bottom-1 right-1 text-xs text-gray-400 px-2 py-1 bg-gray-900/80 rounded">
          {Math.round(zoom)}%
        </div>
      </div>

      {/* Crop info overlay */}
      {cropMode && cropRect && cropRect.width !== 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-gray-300">
          {Math.round(Math.abs(cropRect.width))} × {Math.round(Math.abs(cropRect.height))} px
        </div>
      )}
    </div>
  );
}