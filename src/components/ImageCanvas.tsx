import { useEffect, useRef } from 'react';
import { EditValues } from '../App';

interface ImageCanvasProps {
  imageUrl: string;
  edits: EditValues;
  onProcessed: (dataUrl: string) => void;
}

export function ImageCanvas({ imageUrl, edits, onProcessed }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Determine the actual image dimensions after crop
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (edits.crop) {
        sourceX = edits.crop.x;
        sourceY = edits.crop.y;
        sourceWidth = edits.crop.width;
        sourceHeight = edits.crop.height;
      }

      // Apply resize if set (this affects the actual output dimensions)
      let outputWidth = sourceWidth;
      let outputHeight = sourceHeight;
      
      if (edits.resize) {
        outputWidth = edits.resize.width;
        outputHeight = edits.resize.height;
      }

      // Calculate canvas dimensions
      let canvasWidth, canvasHeight;
      
      if (edits.frame) {
        // Use frame dimensions
        canvasWidth = edits.frame.width;
        canvasHeight = edits.frame.height;
      } else {
        // Use output dimensions (resized or original)
        canvasWidth = outputWidth;
        canvasHeight = outputHeight;
      }

      // Calculate display size while maintaining aspect ratio
      const maxWidth = container.clientWidth - 40;
      const maxHeight = container.clientHeight - 40;
      
      let displayWidth = canvasWidth;
      let displayHeight = canvasHeight;

      if (displayWidth > maxWidth || displayHeight > maxHeight) {
        const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
        displayWidth *= ratio;
        displayHeight *= ratio;
      }

      // Set canvas size to display size
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fill background if frame is set
      if (edits.frame) {
        ctx.fillStyle = edits.frame.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Calculate scale for the image
      const scale = displayWidth / canvasWidth;

      // Save context state
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Apply rotation
      if (edits.rotation) {
        ctx.rotate((edits.rotation * Math.PI) / 180);
      }

      // Apply flip
      const scaleX = edits.flipH ? -1 : 1;
      const scaleY = edits.flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Calculate image draw dimensions
      let drawWidth, drawHeight;
      
      if (edits.frame) {
        // Fit image within frame
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

      // Draw image
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

      // Restore context
      ctx.restore();

      // Apply filters
      const filters: string[] = [];
      
      if (edits.blur > 0) {
        filters.push(`blur(${edits.blur}px)`);
      }
      
      if (edits.grayscale) {
        filters.push('grayscale(100%)');
      }
      
      if (edits.brightness !== 100) {
        filters.push(`brightness(${edits.brightness}%)`);
      }
      
      if (edits.contrast !== 100) {
        filters.push(`contrast(${edits.contrast}%)`);
      }

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

      // Export processed image
      onProcessed(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      console.error('Failed to load image');
    };

    img.src = imageUrl;
  }, [imageUrl, edits, onProcessed]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full rounded-lg shadow-2xl"
        style={{ imageRendering: 'high-quality' }}
      />
    </div>
  );
}