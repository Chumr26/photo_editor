import { create } from 'zustand';

export type Tool =
  | 'move'
  | 'crop'
  | 'text'
  | 'insert'
  | 'brush'
  | 'eraser'
  | 'selection'
  | 'clone'
  | 'liquify'
  | 'zoom';

export interface ImageData {
  src: string;
  width: number;
  height: number;
  filename: string;
  fileSize: number;
}

export interface BrushSettings {
  size: number;
  opacity: number;
  hardness: number;
  color: string;
}

export interface TextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  fontStyle?: string;
  textAlign?: string;
  width?: number;
  height?: number;
}

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'adjustment';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data?: string;
  selected?: boolean;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface Adjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  hue: number;
  sharpen: number;
}

export interface ColorBalanceValues {
  cyanRed: number; // -100 to 100
  magentaGreen: number; // -100 to 100
  yellowBlue: number; // -100 to 100
}

export interface ColorBalance {
  shadows: ColorBalanceValues;
  midtones: ColorBalanceValues;
  highlights: ColorBalanceValues;
  preserveLuminosity: boolean;
}

export interface AppSettings {
  language: 'vi' | 'en' | 'both';
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  defaultExportFormat: 'png' | 'jpg' | 'webp';
  exportQuality: number; // 0-100
  showGrid: boolean;
  showRulers: boolean;
  gridSize: number; // in pixels
  canvasBackground: 'dark' | 'light' | 'checkered';
  maxHistoryStates: number;
}

export interface Snapshot {
  id: string;
  name: string;
  details?: string;
  timestamp: number;
  thumbnail: string;
  image: ImageData | null;
  layers: Layer[];
  adjustments: Adjustment;
  colorBalance: ColorBalance;
  parentId: string | null;
  children: string[];
}

interface EditorState {
  // Image
  image: ImageData | null;
  originalImage: ImageData | null;
  setImage: (image: ImageData) => void;

  // Canvas
  zoom: number;
  setZoom: (zoom: number) => void;
  panX: number;
  panY: number;
  setPan: (x: number, y: number) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  showRulers: boolean;
  toggleRulers: () => void;

  // Tool
  tool: Tool;
  setTool: (tool: Tool) => void;

  // Brush settings
  brushSettings: BrushSettings;
  updateBrushSettings: (updates: Partial<BrushSettings>) => void;

  // Layers
  layers: Layer[];
  selectedLayerId: string | null;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  selectLayer: (id: string) => void;
  reorderLayers: (newLayers: Layer[]) => void;

  // Adjustments
  adjustments: Adjustment;
  updateAdjustments: (updates: Partial<Adjustment>) => void;
  resetAdjustments: () => void;
  
  // Color Balance
  colorBalance: ColorBalance;
  updateColorBalance: (toneRange: 'shadows' | 'midtones' | 'highlights', updates: Partial<ColorBalanceValues>) => void;
  resetColorBalance: () => void;
  togglePreserveLuminosity: () => void;

  // History
  history: Snapshot[];
  historyIndex: number;
  currentBranchId: string | null;
  saveSnapshot: (name?: string, details?: string) => void;
  goToSnapshot: (id: string) => void;
  undo: () => void;
  redo: () => void;

  // Crop
  cropMode: boolean;
  cropRect: CropRect | null;
  setCropMode: (mode: boolean) => void;
  setCropRect: (rect: CropRect | null) => void;
  applyCrop: () => void;

  // Text boxes
  textBoxes: TextBox[];
  addTextBox: (textBox: TextBox) => void;
  updateTextBox: (id: string, updates: Partial<TextBox>) => void;
  deleteTextBox: (id: string) => void;
  duplicateTextBox: (id: string) => void;
  
  // Image resize
  resizeImage: (width: number, height: number) => void;
  
  // Image transforms
  rotateImage: (degrees: 90 | 180 | 270) => void;
  flipImageHorizontal: () => void;
  flipImageVertical: () => void;
  freeRotateImage: (degrees: number) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Right panel sections
  openPanelSections: Set<string>;
  togglePanelSection: (section: string) => void;
  openPanelSection: (section: string) => void;
  closePanelSection: (section: string) => void;
  
  // Active tool tab in Tools section
  activeToolTab: string;
  setActiveToolTab: (tab: string) => void;
  
  // Reset to initial state
  resetToInitialState: () => void;
}

const defaultAdjustments: Adjustment = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: false,
  sepia: false,
  hue: 0,
  sharpen: 0,
};

const defaultColorBalance: ColorBalance = {
  shadows: { cyanRed: 0, magentaGreen: 0, yellowBlue: 0 },
  midtones: { cyanRed: 0, magentaGreen: 0, yellowBlue: 0 },
  highlights: { cyanRed: 0, magentaGreen: 0, yellowBlue: 0 },
  preserveLuminosity: true,
};

const defaultBrushSettings: BrushSettings = {
  size: 10,
  opacity: 1,
  hardness: 100,
  color: '#000000',
};

export const useEditorStore = create<EditorState>((set, get) => ({
  // Image
  image: null,
  originalImage: null,
  setImage: (image) => set({ image, originalImage: image }),

  // Canvas
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  panX: 0,
  panY: 0,
  setPan: (x, y) => set({ panX: x, panY: y }),
  showGrid: false,
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  showRulers: false,
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),

  // Tool
  tool: 'move',
  setTool: (tool) => set({ tool }),

  // Brush settings
  brushSettings: defaultBrushSettings,
  updateBrushSettings: (updates) =>
    set((state) => ({
      brushSettings: { ...state.brushSettings, ...updates },
    })),

  // Layers
  layers: [],
  selectedLayerId: null,
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer], selectedLayerId: layer.id })),
  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      ),
    })),
  deleteLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),
  selectLayer: (id) => set({ selectedLayerId: id }),
  reorderLayers: (newLayers) => set({ layers: newLayers }),

  // Adjustments
  adjustments: defaultAdjustments,
  updateAdjustments: (updates) =>
    set((state) => {
      const newAdjustments = { ...state.adjustments, ...updates };
      
      // Auto-save snapshot if significant change
      const hasSignificantChange = Object.keys(updates).some(key => {
        const oldVal = state.adjustments[key as keyof Adjustment];
        const newVal = newAdjustments[key as keyof Adjustment];
        if (typeof oldVal === 'number' && typeof newVal === 'number') {
          return Math.abs(newVal - oldVal) > 10;
        }
        return oldVal !== newVal;
      });

      if (hasSignificantChange && state.image) {
        // Delay snapshot to avoid too many during slider drag
        setTimeout(() => {
          const currentState = get();
          if (currentState.history.length === 0 || 
              Date.now() - currentState.history[currentState.history.length - 1]?.timestamp > 2000) {
            currentState.saveSnapshot();
          }
        }, 500);
      }

      return { adjustments: newAdjustments };
    }),
  resetAdjustments: () => set({ adjustments: defaultAdjustments }),

  // Color Balance
  colorBalance: defaultColorBalance,
  updateColorBalance: (toneRange, updates) =>
    set((state) => {
      const newColorBalance = {
        ...state.colorBalance,
        [toneRange]: { ...state.colorBalance[toneRange], ...updates },
      };
      
      // Auto-save snapshot if significant change
      const hasSignificantChange = Object.keys(updates).some(key => {
        const oldVal = state.colorBalance[toneRange][key as keyof ColorBalanceValues];
        const newVal = newColorBalance[toneRange][key as keyof ColorBalanceValues];
        if (typeof oldVal === 'number' && typeof newVal === 'number') {
          return Math.abs(newVal - oldVal) > 10;
        }
        return oldVal !== newVal;
      });

      if (hasSignificantChange && state.image) {
        // Delay snapshot to avoid too many during slider drag
        setTimeout(() => {
          const currentState = get();
          if (currentState.history.length === 0 || 
              Date.now() - currentState.history[currentState.history.length - 1]?.timestamp > 2000) {
            currentState.saveSnapshot();
          }
        }, 500);
      }

      return { colorBalance: newColorBalance };
    }),
  resetColorBalance: () => set({ colorBalance: defaultColorBalance }),
  togglePreserveLuminosity: () =>
    set((state) => ({
      colorBalance: {
        ...state.colorBalance,
        preserveLuminosity: !state.colorBalance.preserveLuminosity,
      },
    })),

  // History
  history: [],
  historyIndex: -1,
  currentBranchId: null,
  saveSnapshot: (name, details) => {
    const state = get();
    
    let finalName = name;
    let finalDetails = details;

    // Auto-detect changes if name is not provided
    if (!finalName) {
      const lastSnapshot = state.history.length > 0 ? state.history[state.history.length - 1] : null;
      const lastAdjustments = lastSnapshot ? lastSnapshot.adjustments : defaultAdjustments;
      const lastColorBalance = lastSnapshot ? lastSnapshot.colorBalance : defaultColorBalance;
      
      // Check adjustments
      const changedAdj: string[] = [];
      (Object.keys(state.adjustments) as Array<keyof Adjustment>).forEach(key => {
        if (state.adjustments[key] !== lastAdjustments[key]) {
          changedAdj.push(key);
        }
      });
      
      if (changedAdj.length > 0) {
        finalName = 'Chỉnh sửa ảnh / Adjustments';
        finalDetails = `Thay đổi: ${changedAdj.join(', ')}`;
      } else {
        // Check color balance
        let cbChanged = false;
        if (state.colorBalance.preserveLuminosity !== lastColorBalance.preserveLuminosity) {
            cbChanged = true;
        } else {
            (['shadows', 'midtones', 'highlights'] as const).forEach(range => {
                const current = state.colorBalance[range];
                const last = lastColorBalance[range];
                if (current.cyanRed !== last.cyanRed || 
                    current.magentaGreen !== last.magentaGreen || 
                    current.yellowBlue !== last.yellowBlue) {
                    cbChanged = true;
                }
            });
        }
        
        if (cbChanged) {
            finalName = 'Cân bằng màu / Color Balance';
            finalDetails = 'Thay đổi cân bằng màu';
        }
      }
    }

    const snapshot: Snapshot = {
      id: Date.now().toString(),
      name: finalName || `Chỉnh sửa ${state.history.length + 1}`,
      details: finalDetails,
      timestamp: Date.now(),
      thumbnail: '', // Would capture canvas thumbnail
      image: state.image,
      layers: JSON.parse(JSON.stringify(state.layers)),
      adjustments: { ...state.adjustments },
      colorBalance: JSON.parse(JSON.stringify(state.colorBalance)),
      parentId: state.currentBranchId,
      children: [],
    };

    set((state) => ({
      history: [...state.history, snapshot],
      historyIndex: state.history.length,
      currentBranchId: snapshot.id,
    }));
  },
  goToSnapshot: (id) => {
    const state = get();
    const snapshotIndex = state.history.findIndex((s) => s.id === id);
    if (snapshotIndex !== -1) {
      const snapshot = state.history[snapshotIndex];
      set({
        image: snapshot.image,
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        adjustments: { ...snapshot.adjustments },
        colorBalance: JSON.parse(JSON.stringify(snapshot.colorBalance)),
        historyIndex: snapshotIndex,
        currentBranchId: snapshot.id,
      });
    }
  },
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const snapshot = state.history[state.historyIndex - 1];
      set({
        image: snapshot.image,
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        adjustments: { ...snapshot.adjustments },
        colorBalance: JSON.parse(JSON.stringify(snapshot.colorBalance)),
        historyIndex: state.historyIndex - 1,
        currentBranchId: snapshot.id,
      });
    }
  },
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const snapshot = state.history[state.historyIndex + 1];
      set({
        image: snapshot.image,
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        adjustments: { ...snapshot.adjustments },
        colorBalance: JSON.parse(JSON.stringify(snapshot.colorBalance)),
        historyIndex: state.historyIndex + 1,
        currentBranchId: snapshot.id,
      });
    }
  },

  // Crop
  cropMode: false,
  cropRect: null,
  setCropMode: (mode) => set({ cropMode: mode }),
  setCropRect: (rect) => set({ cropRect: rect }),
  applyCrop: () => {
    const state = get();
    if (!state.image || !state.cropRect) return;

    const { cropRect, image } = state;
    
    // Validate crop rect
    if (Math.abs(cropRect.width) < 10 || Math.abs(cropRect.height) < 10) {
      // Import toast dynamically since we're in store
      import('sonner').then(({ toast }) => {
        toast.error('Vùng cắt quá nhỏ / Crop area too small');
      });
      return;
    }

    // Create temporary canvas to crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.abs(cropRect.width);
    canvas.height = Math.abs(cropRect.height);

    const img = new Image();
    img.onload = () => {
      // Draw cropped portion
      ctx.drawImage(
        img,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        cropRect.width,
        cropRect.height
      );

      // Convert to data URL and update image
      const croppedSrc = canvas.toDataURL('image/png');
      set({
        image: {
          ...image,
          src: croppedSrc,
          width: Math.abs(cropRect.width),
          height: Math.abs(cropRect.height),
        },
        cropMode: false,
        cropRect: null,
      });

      // Save to history
      state.saveSnapshot('Cắt ảnh / Crop', `${Math.round(Math.abs(cropRect.width))}x${Math.round(Math.abs(cropRect.height))}`);
      
      // Show success message
      import('sonner').then(({ toast }) => {
        toast.success('Đã cắt ảnh thành công / Image cropped successfully');
      });
    };
    img.src = image.src;
  },

  // Text boxes
  textBoxes: [],
  addTextBox: (textBox) => set((state) => ({ textBoxes: [...state.textBoxes, textBox] })),
  updateTextBox: (id, updates) =>
    set((state) => ({
      textBoxes: state.textBoxes.map((box) =>
        box.id === id ? { ...box, ...updates } : box
      ),
    })),
  deleteTextBox: (id) =>
    set((state) => ({
      textBoxes: state.textBoxes.filter((box) => box.id !== id),
    })),
  duplicateTextBox: (id) =>
    set((state) => {
      const textBox = state.textBoxes.find((box) => box.id === id);
      if (!textBox) return state;
      
      const newTextBox = {
        ...textBox,
        id: Date.now().toString(),
        x: textBox.x + 20,
        y: textBox.y + 20,
      };
      
      return { textBoxes: [...state.textBoxes, newTextBox] };
    }),
  
  // Image resize
  resizeImage: (width, height) => {
    const state = get();
    if (!state.image) return;

    const { image } = state;
    
    // Validate dimensions
    if (width < 10 || height < 10) {
      // Import toast dynamically since we're in store
      import('sonner').then(({ toast }) => {
        toast.error('Kích thước mới quá nhỏ / New size too small');
      });
      return;
    }

    // Create temporary canvas to resize the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.onload = () => {
      // Draw resized portion
      ctx.drawImage(
        img,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        width,
        height
      );

      // Convert to data URL and update image
      const resizedSrc = canvas.toDataURL('image/png');
      set({
        image: {
          ...image,
          src: resizedSrc,
          width: width,
          height: height,
        },
      });

      // Save to history
      state.saveSnapshot('Thay đổi kích thước / Resize', `${image.width}x${image.height} → ${width}x${height}`);
      
      // Show success message
      import('sonner').then(({ toast }) => {
        toast.success('Đã thay đổi kích thước ảnh thành công / Image resized successfully');
      });
    };
    img.src = image.src;
  },
  
  // Image transforms
  rotateImage: (degrees) => {
    const state = get();
    if (!state.image) return;

    const { image } = state;
    
    // Create temporary canvas to rotate the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate new dimensions
    let newWidth, newHeight;
    if (degrees === 90 || degrees === 270) {
      newWidth = image.height;
      newHeight = image.width;
    } else {
      newWidth = image.width;
      newHeight = image.height;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    const img = new Image();
    img.onload = () => {
      // Draw rotated portion
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(degrees * Math.PI / 180);
      ctx.drawImage(
        img,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      );

      // Convert to data URL and update image
      const rotatedSrc = canvas.toDataURL('image/png');
      set({
        image: {
          ...image,
          src: rotatedSrc,
          width: newWidth,
          height: newHeight,
        },
      });

      // Save to history
      state.saveSnapshot('Xoay ảnh / Rotate', `${degrees}°`);
      
      // Show success message
      import('sonner').then(({ toast }) => {
        toast.success('Đã xoay ảnh thành công / Image rotated successfully');
      });
    };
    img.src = image.src;
  },
  flipImageHorizontal: () => {
    const state = get();
    if (!state.image) return;

    const { image } = state;
    
    // Create temporary canvas to flip the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    const img = new Image();
    img.onload = () => {
      // Draw flipped portion
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        -image.width,
        0,
        image.width,
        image.height
      );

      // Convert to data URL and update image
      const flippedSrc = canvas.toDataURL('image/png');
      set({
        image: {
          ...image,
          src: flippedSrc,
        },
      });

      // Save to history
      state.saveSnapshot('Lật ảnh ngang / Flip Horizontal');
      
      // Show success message
      import('sonner').then(({ toast }) => {
        toast.success('Đã lật ảnh ngang thành công / Image flipped horizontally successfully');
      });
    };
    img.src = image.src;
  },
  flipImageVertical: () => {
    const state = get();
    if (!state.image) return;

    const { image } = state;
    
    // Create temporary canvas to flip the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    const img = new Image();
    img.onload = () => {
      // Draw flipped portion
      ctx.scale(1, -1);
      ctx.drawImage(
        img,
        0,
        -image.height,
        image.width,
        image.height
      );

      // Convert to data URL and update image
      const flippedSrc = canvas.toDataURL('image/png');
      set({
        image: {
          ...image,
          src: flippedSrc,
        },
      });

      // Save to history
      state.saveSnapshot('Lật ảnh dọc / Flip Vertical');
      
      // Show success message
      import('sonner').then(({ toast }) => {
        toast.success('Đã lật ảnh dọc thành công / Image flipped vertically successfully');
      });
    };
    img.src = image.src;
  },
  freeRotateImage: (degrees) => {
    const state = get();
    if (!state.image) return;

    const { image } = state;
    
    // Create temporary canvas to rotate the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate new dimensions
    let newWidth, newHeight;
    if (degrees === 90 || degrees === 270) {
      newWidth = image.height;
      newHeight = image.width;
    } else {
      newWidth = image.width;
      newHeight = image.height;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    const img = new Image();
    img.onload = () => {
      // Draw rotated portion
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(degrees * Math.PI / 180);
      ctx.drawImage(
        img,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      );

      // Convert to data URL and update image
      const rotatedSrc = canvas.toDataURL('image/png');
      set({
        image: {
          ...image,
          src: rotatedSrc,
          width: newWidth,
          height: newHeight,
        },
      });

      // Save to history
      state.saveSnapshot('Xoay ảnh / Rotate', `${degrees}°`);
      
      // Show success message
      import('sonner').then(({ toast }) => {
        toast.success('Đã xoay ảnh thành công / Image rotated successfully');
      });
    };
    img.src = image.src;
  },
  
  // Settings
  settings: {
    language: 'vi',
    autoSave: true,
    autoSaveInterval: 300,
    defaultExportFormat: 'png',
    exportQuality: 90,
    showGrid: false,
    showRulers: false,
    gridSize: 10,
    canvasBackground: 'light',
    maxHistoryStates: 100,
  },
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
  resetSettings: () => set({ settings: {
    language: 'vi',
    autoSave: true,
    autoSaveInterval: 300,
    defaultExportFormat: 'png',
    exportQuality: 90,
    showGrid: false,
    showRulers: false,
    gridSize: 10,
    canvasBackground: 'light',
    maxHistoryStates: 100,
  } }),
  
  // Right panel sections
  openPanelSections: new Set(),
  togglePanelSection: (section) => set((state) => {
    const newSet = new Set(state.openPanelSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    return { openPanelSections: newSet };
  }),
  openPanelSection: (section) => set((state) => {
    const newSet = new Set(state.openPanelSections);
    newSet.add(section);
    return { openPanelSections: newSet };
  }),
  closePanelSection: (section) => set((state) => {
    const newSet = new Set(state.openPanelSections);
    newSet.delete(section);
    return { openPanelSections: newSet };
  }),
  
  // Active tool tab in Tools section
  activeToolTab: 'adjustments',
  setActiveToolTab: (tab) => set({ activeToolTab: tab }),
  
  // Reset to initial state
  resetToInitialState: () => {
    const state = get();
    if (!state.image || !state.originalImage) return;
    
    // Keep the original image but reset all edits
    set({
      image: state.originalImage,
      zoom: 100,
      panX: 0,
      panY: 0,
      tool: 'move',
      brushSettings: defaultBrushSettings,
      layers: [],
      selectedLayerId: null,
      adjustments: defaultAdjustments,
      colorBalance: defaultColorBalance,
      cropMode: false,
      cropRect: null,
      textBoxes: [],
    });
    
    // Show success message
    import('sonner').then(({ toast }) => {
      toast.success('Đã đặt lại ảnh về trạng thái ban đầu / Image reset to initial state');
    });
  },
}));