/**
 * Editor Types
 * 
 * Centralized type definitions for the photo editor application.
 * This file contains all shared types used across components.
 */

export interface EditValues {
  blur: number;
  grayscale: boolean;
  brightness: number;
  contrast: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  rotation: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resize?: {
    width: number;
    height: number;
  };
}

export interface ImageState {
  url: string;
  originalUrl: string;
  processedUrl: string;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EditMode = 'none' | 'crop' | 'rotate' | 'resize';

export type DragHandle = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l' | 'box' | null;

export interface AISettings {
  apiKey: string;
  model: string;
  enabled: boolean;
}
