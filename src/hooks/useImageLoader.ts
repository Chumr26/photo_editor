/**
 * useImageLoader Hook
 * 
 * Custom hook for loading and managing image state.
 * Handles image loading, error handling, and provides loaded image reference.
 */

import { useRef, useState, useEffect } from 'react';

export function useImageLoader(imageUrl: string) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imgRef.current = img;
      setIsImageLoaded(true);
      setError(null);
    };

    img.onerror = () => {
      console.error('Failed to load image');
      setError('Failed to load image');
      setIsImageLoaded(false);
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { imgRef, isImageLoaded, error };
}
