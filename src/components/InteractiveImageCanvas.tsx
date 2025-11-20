import { useEffect, useRef, useState, useCallback } from 'react';
import { EditValues } from '../App';
import { cropPercentToImagePixels, cropImagePixelsToPercent, calculateImageDisplayBounds } from '../utils/crop.utils';
import { applyAspectRatioConstraint, getRatioDecimal, detectPresetRatio, AspectRatioPreset } from '../utils/aspectRatio.utils';

/**
 * InteractiveImageCanvas - Main canvas component for image editing
 * 
 * CROP FUNCTIONALITY:
 * 1. When entering crop mode, existing crop (if any) is converted from image pixels to canvas percentage
 * 2. During crop drag, cropArea state (canvas percentage) is updated locally - NO history updates
 * 3. When user clicks "Xong" (Done), cropArea is converted to image pixels and passed to onCropConfirm
 * 4. Parent (EditorScreen) adds the crop to edit history - ONE entry per crop operation
 * 5. When not in crop mode, edits.crop (image pixels) is applied during rendering
 * 
 * COORDINATE SYSTEMS:
 * - cropArea: Canvas percentage (0-100%) - used for overlay drawing during crop mode
 * - edits.crop: Image pixel coordinates - used for actual cropping in final render
 * - Conversion handled by crop.utils.ts functions
 */

interface InteractiveImageCanvasProps {
  imageUrl: string;
  edits: EditValues;
  onProcessed: (dataUrl: string) => void;
  editMode: 'none' | 'crop' | 'rotate' | 'resize';
  onCropConfirm?: (crop: { x: number; y: number; width: number; height: number } | null) => void;
  onCropCancel?: () => void;
  onRotationChange?: (rotation: number) => void;
  onZoomChange?: (zoom: number) => void;
  onResetView?: () => void;
}

export function InteractiveImageCanvas({
  imageUrl,
  edits,
  onProcessed,
  editMode,
  onCropConfirm,
  onCropCancel,
  onRotationChange,
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
  const [detectedRatio, setDetectedRatio] = useState<AspectRatioPreset | null>(null);
  
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
    };

    img.onerror = () => {
      console.error('Failed to load image');
    };

    img.src = imageUrl;
  }, [imageUrl]);

  // Initialize crop area when entering crop mode
  useEffect(() => {
    if (editMode === 'crop' && isImageLoaded && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      
      if (edits.crop) {
        // Convert existing crop from image pixels to canvas percentage
        const cropPercent = cropImagePixelsToPercent(
          edits.crop,
          canvas,
          img.width,
          img.height,
          imageTransform
        );
        setCropArea(cropPercent);
      } else {
        // Default crop area (80% of canvas, centered)
        setCropArea({
          x: 10,
          y: 10,
          width: 80,
          height: 80,
        });
      }
    }
  }, [editMode, isImageLoaded, edits.crop, imageTransform]);

  // Apply aspect ratio constraint when ratio changes in crop mode
  useEffect(() => {
    if (editMode === 'crop' && edits.cropAspectRatioLocked && edits.cropAspectRatio && canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Convert current crop area from percentage to pixels
      const pixelWidth = (cropArea.width / 100) * canvas.width;
      const pixelHeight = (cropArea.height / 100) * canvas.height;
      
      // Calculate target ratio
      const targetRatio = edits.cropAspectRatio.width / edits.cropAspectRatio.height;
      const currentRatio = pixelWidth / pixelHeight;
      
      let newWidth = pixelWidth;
      let newHeight = pixelHeight;
      
      // Expand to maintain or increase size (not shrink)
      if (Math.abs(currentRatio - targetRatio) > 0.001) {
        if (targetRatio > currentRatio) {
          // Target is wider - expand width
          newWidth = pixelHeight * targetRatio;
        } else {
          // Target is taller - expand height
          newHeight = pixelWidth / targetRatio;
        }
      }
      
      // Convert back to percentage
      const newWidthPercent = (newWidth / canvas.width) * 100;
      const newHeightPercent = (newHeight / canvas.height) * 100;
      
      // Keep the same top-left position
      setCropArea(prev => ({
        ...prev,
        width: newWidthPercent,
        height: newHeightPercent,
      }));
    }
  }, [editMode, edits.cropAspectRatio, edits.cropAspectRatioLocked]);

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
    // NOTE: edits.crop contains image pixel coordinates (not percentage)
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.width;
    let sourceHeight = img.height;
    let cropOffsetX = 0; // Offset if crop extends left of image
    let cropOffsetY = 0; // Offset if crop extends top of image
    let hasExtendedCrop = false;

    // Apply crop if exists and not currently in crop mode (show final result)
    if (edits.crop && editMode !== 'crop') {
      // Check if crop extends beyond image boundaries
      const crop = edits.crop;
      
      // Calculate offsets for extended crop
      if (crop.x < 0) {
        cropOffsetX = -crop.x;
        sourceX = 0;
        sourceWidth = Math.min(img.width, crop.width + crop.x);
        hasExtendedCrop = true;
      } else {
        sourceX = crop.x;
        sourceWidth = Math.min(img.width - crop.x, crop.width);
      }
      
      if (crop.y < 0) {
        cropOffsetY = -crop.y;
        sourceY = 0;
        sourceHeight = Math.min(img.height, crop.height + crop.y);
        hasExtendedCrop = true;
      } else {
        sourceY = crop.y;
        sourceHeight = Math.min(img.height - crop.y, crop.height);
      }
      
      // Check if crop extends right or bottom
      if (crop.x + crop.width > img.width || crop.y + crop.height > img.height) {
        hasExtendedCrop = true;
      }
      
      // Use full crop dimensions for output (including extended areas)
      sourceWidth = crop.width;
      sourceHeight = crop.height;
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
    
    // If we have an extended crop, draw crop background first
    if (hasExtendedCrop && edits.crop) {
      ctx.fillStyle = edits.cropBackgroundColor || '#ffffff';
      ctx.fillRect(imgX, imgY, finalWidth, finalHeight);
    }
    
    // Apply transformations at image center
    ctx.translate(imgX + finalWidth / 2, imgY + finalHeight / 2);
    
    if (edits.rotation) {
      ctx.rotate((edits.rotation * Math.PI) / 180);
    }

    const scaleX = edits.flipH ? -1 : 1;
    const scaleY = edits.flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // For extended crop, calculate where to draw the actual image within the crop area
    if (hasExtendedCrop && edits.crop) {
      const crop = edits.crop;
      
      // Calculate the actual image portion dimensions and position
      const imgSourceX = Math.max(0, crop.x);
      const imgSourceY = Math.max(0, crop.y);
      const imgSourceW = Math.min(img.width - imgSourceX, crop.width - cropOffsetX);
      const imgSourceH = Math.min(img.height - imgSourceY, crop.height - cropOffsetY);
      
      // Calculate offset within the crop area where image starts
      const destOffsetX = (cropOffsetX / crop.width) * finalWidth - finalWidth / 2;
      const destOffsetY = (cropOffsetY / crop.height) * finalHeight - finalHeight / 2;
      
      // Calculate dimensions for the image portion
      const destW = (imgSourceW / crop.width) * finalWidth;
      const destH = (imgSourceH / crop.height) * finalHeight;
      
      ctx.drawImage(
        img,
        imgSourceX,
        imgSourceY,
        imgSourceW,
        imgSourceH,
        destOffsetX,
        destOffsetY,
        destW,
        destH
      );
    } else {
      // Normal rendering without extended crop
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        Math.min(sourceWidth, img.width - sourceX),
        Math.min(sourceHeight, img.height - sourceY),
        -finalWidth / 2,
        -finalHeight / 2,
        finalWidth,
        finalHeight
      );
    }

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
    // NOTE: cropArea is in canvas percentage (0-100%), converted to pixels here for drawing
    if (editMode === 'crop') {
      // Dark overlay - REMOVED to allow eyepicker color selection
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      // ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate crop rectangle position (convert percentage to pixels)
      const cropX = (cropArea.x / 100) * canvas.width;
      const cropY = (cropArea.y / 100) * canvas.height;
      const cropW = (cropArea.width / 100) * canvas.width;
      const cropH = (cropArea.height / 100) * canvas.height;

      // Calculate image display bounds to show boundary markers
      const displayBounds = calculateImageDisplayBounds(
        canvas,
        img.width,
        img.height,
        imageTransform
      );

      // Clear crop area (make it visible) - NO LONGER NEEDED since no overlay
      // ctx.save();
      // ctx.globalCompositeOperation = 'destination-out';
      // ctx.fillRect(cropX, cropY, cropW, cropH);
      // ctx.restore();

      // Fill extended areas with crop background color
      ctx.save();
      ctx.fillStyle = edits.cropBackgroundColor || '#ffffff';
      ctx.globalAlpha = 0.7;
      
      // Draw background in areas outside the image bounds
      // Top extension
      if (cropY < displayBounds.y) {
        const extendHeight = Math.min(displayBounds.y - cropY, cropH);
        ctx.fillRect(cropX, cropY, cropW, extendHeight);
      }
      // Bottom extension
      if (cropY + cropH > displayBounds.y + displayBounds.height) {
        const startY = Math.max(cropY, displayBounds.y + displayBounds.height);
        const extendHeight = (cropY + cropH) - startY;
        ctx.fillRect(cropX, startY, cropW, extendHeight);
      }
      // Left extension
      if (cropX < displayBounds.x) {
        const extendWidth = Math.min(displayBounds.x - cropX, cropW);
        const startY = Math.max(cropY, displayBounds.y);
        const height = Math.min(cropH, displayBounds.y + displayBounds.height - startY);
        ctx.fillRect(cropX, startY, extendWidth, height);
      }
      // Right extension
      if (cropX + cropW > displayBounds.x + displayBounds.width) {
        const startX = Math.max(cropX, displayBounds.x + displayBounds.width);
        const extendWidth = (cropX + cropW) - startX;
        const startY = Math.max(cropY, displayBounds.y);
        const height = Math.min(cropH, displayBounds.y + displayBounds.height - startY);
        ctx.fillRect(startX, startY, extendWidth, height);
      }
      
      ctx.restore();

      // Draw image boundary marker (dashed line)
      ctx.save();
      ctx.strokeStyle = '#f59e0b'; // Orange color for image boundary
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(displayBounds.x, displayBounds.y, displayBounds.width, displayBounds.height);
      ctx.restore();

      // Draw crop border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([]); // Solid line
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

      // Show lock indicator and ratio text when aspect ratio is locked
      if (edits.cropAspectRatioLocked && edits.cropAspectRatio) {
        // Draw lock icon badge
        ctx.save();
        const badgeSize = 24;
        const badgeX = cropX + cropW - badgeSize - 5;
        const badgeY = cropY - badgeSize - 5;
        
        // Badge background
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(badgeX, badgeY, badgeSize, badgeSize);
        
        // Lock icon (simplified)
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Lock body
        const lockX = badgeX + badgeSize / 2;
        const lockY = badgeY + badgeSize / 2 + 2;
        ctx.fillRect(lockX - 4, lockY - 2, 8, 6);
        
        // Lock shackle
        ctx.beginPath();
        ctx.arc(lockX, lockY - 3, 3, Math.PI, 0, true);
        ctx.stroke();
        
        ctx.restore();

        // Draw ratio text
        ctx.save();
        const ratioText = `${edits.cropAspectRatio.width}:${edits.cropAspectRatio.height}`;
        ctx.font = 'bold 14px system-ui';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const textX = cropX + cropW / 2;
        const textY = cropY - 10;
        
        // Draw text with outline for visibility
        ctx.strokeText(ratioText, textX, textY);
        ctx.fillText(ratioText, textX, textY);
        ctx.restore();
      }

      // Show detected ratio badge when not locked
      if (!edits.cropAspectRatioLocked && detectedRatio && isDragging) {
        ctx.save();
        const badgeWidth = 80;
        const badgeHeight = 24;
        const badgeX = cropX + (cropW - badgeWidth) / 2;
        const badgeY = cropY + cropH + 10;
        
        // Badge background
        ctx.fillStyle = 'rgba(34, 197, 94, 0.95)'; // Green
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4);
        ctx.fill();
        ctx.stroke();
        
        // Badge text
        ctx.font = 'bold 12px system-ui';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`≈ ${detectedRatio.label}`, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
        ctx.restore();
      }
    }

    // Export processed image
    onProcessed(canvas.toDataURL('image/png'));
  }, [imageUrl, edits, onProcessed, isImageLoaded, editMode, cropArea, imageTransform, isTransforming, detectedRatio, isDragging]);

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
              // Moving the box shouldn't constrain aspect ratio
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

          // Handle negative dimensions
          if (prevW < 0) {
            prevX += prevW;
            prevW = Math.abs(prevW);
          }
          if (prevH < 0) {
            prevY += prevH;
            prevH = Math.abs(prevH);
          }

          // Apply aspect ratio constraint if locked
          if (edits.cropAspectRatioLocked && edits.cropAspectRatio && currentDraggedPart !== 'box') {
            const constrained = applyAspectRatioConstraint(
              prevW,
              prevH,
              edits.cropAspectRatio,
              currentDraggedPart || 'br'
            );
            
            // Adjust position based on which handle is being dragged
            const widthDiff = constrained.width - prevW;
            const heightDiff = constrained.height - prevH;
            
            // For top/left handles, adjust position to maintain opposite corner
            if (currentDraggedPart?.includes('t')) {
              prevY -= heightDiff;
            }
            if (currentDraggedPart?.includes('l')) {
              prevX -= widthDiff;
            }
            
            prevW = constrained.width;
            prevH = constrained.height;
          }

          // Remove boundary constraints to allow extended crop
          // prevX = Math.max(0, Math.min(100 - prevW, prevX));
          // prevY = Math.max(0, Math.min(100 - prevH, prevY));

          // Detect ratio if not locked
          if (!edits.cropAspectRatioLocked && prevW > 0 && prevH > 0) {
            const canvas = canvasRef.current;
            if (canvas) {
              // Convert percentage dimensions to pixel dimensions for ratio detection
              const pixelWidth = (prevW / 100) * canvas.width;
              const pixelHeight = (prevH / 100) * canvas.height;
              const detected = detectPresetRatio(pixelWidth, pixelHeight, 0.05);
              setDetectedRatio(detected);
            }
          } else {
            setDetectedRatio(null);
          }

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

  // Get current crop in image pixel coordinates
  const getCurrentCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || editMode !== 'crop') return null;

    return cropPercentToImagePixels(
      cropArea,
      canvas,
      img.width,
      img.height,
      imageTransform
    );
  }, [cropArea, editMode, imageTransform]);

  // Expose crop functions via window for external access
  useEffect(() => {
    if (editMode === 'crop') {
      (window as any).__getCurrentCrop = getCurrentCrop;
      (window as any).__confirmCrop = () => {
        const crop = getCurrentCrop();
        if (onCropConfirm) {
          onCropConfirm(crop);
        }
      };
      (window as any).__cancelCrop = () => {
        if (onCropCancel) {
          onCropCancel();
        }
      };
    }
    return () => {
      delete (window as any).__getCurrentCrop;
      delete (window as any).__confirmCrop;
      delete (window as any).__cancelCrop;
    };
  }, [editMode, getCurrentCrop, onCropConfirm, onCropCancel]);

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
