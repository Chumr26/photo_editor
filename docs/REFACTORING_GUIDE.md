# Code Organization & Refactoring Guide

This document explains the refactored structure of the photo editor application and provides guidelines for maintaining clean, modular code.

## 📁 Directory Structure

```
src/
├── components/              # UI Components
│   ├── editor/             # Editor-specific components
│   │   ├── FilterControls.tsx
│   │   ├── TransformControls.tsx
│   │   ├── ToolButtons.tsx
│   │   ├── CropModeControls.tsx
│   │   ├── RotateModeControls.tsx
│   │   ├── ResizeModeControls.tsx
│   │   └── index.ts
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── figma/              # Figma-specific components
│   ├── InteractiveImageCanvas.tsx
│   ├── EditorControls.tsx
│   ├── EditorScreen.tsx
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── useImageLoader.ts
│   ├── useCropInteraction.ts
│   ├── useEditHistory.ts
│   └── index.ts
├── utils/                  # Utility functions
│   ├── canvas.utils.ts
│   ├── crop.utils.ts
│   └── index.ts
├── types/                  # TypeScript type definitions
│   └── editor.types.ts
└── styles/                 # Global styles
```

## 🎯 Design Principles

### 1. Single Responsibility Principle
Each file, component, and function should have ONE clear purpose.

**Example:**
- `FilterControls.tsx` - Only handles filter-related controls
- `canvas.utils.ts` - Only contains canvas manipulation functions
- `useImageLoader.ts` - Only manages image loading logic

### 2. Keep Files Small
- **Components**: 100-250 lines
- **Utilities**: 50-150 lines per function group
- **Hooks**: 50-150 lines

### 3. Separate Concerns
- **UI Logic** → Components
- **Business Logic** → Utilities
- **State Management** → Hooks
- **Type Definitions** → Types

## 📦 Module Organization

### Types (`src/types/`)
Centralized type definitions shared across the application.

```typescript
// editor.types.ts
export interface EditValues { /* ... */ }
export interface CropArea { /* ... */ }
export type EditMode = 'none' | 'crop' | 'rotate' | 'resize';
```

### Utilities (`src/utils/`)
Pure functions for calculations and transformations.

```typescript
// canvas.utils.ts
export function applyFilters(canvas, edits) { /* ... */ }
export function calculateCanvasDimensions() { /* ... */ }

// crop.utils.ts
export function getHandleAt() { /* ... */ }
export function updateCropArea() { /* ... */ }
```

### Hooks (`src/hooks/`)
Reusable stateful logic encapsulated in custom hooks.

```typescript
// useImageLoader.ts
export function useImageLoader(imageUrl) {
  // Manages image loading state
  return { imgRef, isImageLoaded, error };
}

// useCropInteraction.ts
export function useCropInteraction(props) {
  // Manages crop interaction state and handlers
  return { cropArea, handleMouseDown, handleMouseMove, ... };
}

// useEditHistory.ts
export function useEditHistory(initialEdit) {
  // Manages undo/redo functionality
  return { currentEdits, undo, redo, canUndo, canRedo, ... };
}
```

### Components (`src/components/editor/`)
Small, focused UI components for specific features.

```typescript
// FilterControls.tsx - 90 lines
export function FilterControls({ edits, onEditChange }) {
  // Renders blur, grayscale, brightness, contrast controls
}

// TransformControls.tsx - 70 lines
export function TransformControls({ edits, onEditChange }) {
  // Renders flip and rotation controls
}

// CropModeControls.tsx - 35 lines
export function CropModeControls({ onApply, onCancel }) {
  // Renders crop mode instructions and action buttons
}
```

## 🔄 Refactoring Benefits

### Before Refactoring
```
EditorControls.tsx - 330 lines
├── Filter controls (80 lines)
├── Transform controls (60 lines)
├── Tool buttons (40 lines)
├── Crop mode UI (30 lines)
├── Rotate mode UI (60 lines)
└── Resize mode UI (60 lines)
```

**Problems:**
- Hard to navigate
- Difficult to test individual features
- Changes to one feature risk breaking others
- Poor code reusability

### After Refactoring
```
EditorControls.tsx - 80 lines (orchestration only)
├── FilterControls.tsx - 90 lines
├── TransformControls.tsx - 70 lines
├── ToolButtons.tsx - 45 lines
├── CropModeControls.tsx - 35 lines
├── RotateModeControls.tsx - 85 lines
└── ResizeModeControls.tsx - 75 lines
```

**Benefits:**
- ✅ Easy to find and modify specific features
- ✅ Can test components in isolation
- ✅ Changes are localized and safe
- ✅ Components can be reused elsewhere
- ✅ Better code readability and maintainability

## 🛠️ When to Refactor

### Extract a Component When:
1. A component exceeds 250 lines
2. You identify a reusable UI pattern
3. A section has its own state and logic
4. You need to test a specific feature independently

### Extract a Utility When:
1. Logic doesn't require React hooks
2. Function performs pure calculations
3. Same logic is used in multiple places
4. You want to unit test without React

### Extract a Hook When:
1. You have stateful logic with side effects
2. Multiple components need the same behavior
3. Logic is complex with many event handlers
4. You want to separate business logic from UI

## 📝 Code Examples

### Before: Large Component
```tsx
function EditorControls({ edits, onEditChange }) {
  // 100 lines of state declarations
  
  return (
    <div>
      {/* 80 lines of filter controls */}
      {/* 60 lines of transform controls */}
      {/* 40 lines of tool buttons */}
      {/* 150 lines of mode-specific UIs */}
    </div>
  );
}
```

### After: Modular Components
```tsx
function EditorControls({ edits, onEditChange, editMode, onEditModeChange }) {
  return (
    <div className="p-6 space-y-6">
      {editMode === 'none' && (
        <>
          <FilterControls edits={edits} onEditChange={onEditChange} />
          <Separator />
          <TransformControls 
            edits={edits} 
            onEditChange={onEditChange}
            onEditModeChange={onEditModeChange}
          />
          <Separator />
          <ToolButtons onEditModeChange={onEditModeChange} />
        </>
      )}
      
      {editMode === 'crop' && (
        <CropModeControls onApply={handleApply} onCancel={handleCancel} />
      )}
      
      {editMode === 'rotate' && (
        <RotateModeControls
          edits={edits}
          onEditChange={onEditChange}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
      
      {editMode === 'resize' && (
        <ResizeModeControls
          edits={edits}
          onEditChange={onEditChange}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
```

## 🎓 Best Practices

### 1. Import Organization
```typescript
// External dependencies
import { useState, useEffect } from 'react';

// Internal components
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

// Utilities and hooks
import { applyFilters } from '../../utils';
import { useImageLoader } from '../../hooks';

// Types
import { EditValues, CropArea } from '../../types/editor.types';
```

### 2. File Documentation
```typescript
/**
 * FilterControls Component
 * 
 * Controls for applying filters: blur, grayscale, brightness, and contrast.
 * Extracted from EditorControls for better maintainability.
 */

// Component code...
```

### 3. Meaningful Names
- ✅ `FilterControls` (descriptive)
- ❌ `Controls1` (unclear)

- ✅ `useImageLoader` (clear purpose)
- ❌ `useImage` (vague)

- ✅ `applyFilters` (action-oriented)
- ❌ `filters` (ambiguous)

## 🚀 Getting Started

To use the refactored structure:

1. **Import types:**
   ```typescript
   import { EditValues, CropArea } from '@/types/editor.types';
   ```

2. **Use utilities:**
   ```typescript
   import { applyFilters, calculateCanvasDimensions } from '@/utils';
   ```

3. **Use hooks:**
   ```typescript
   import { useImageLoader, useEditHistory } from '@/hooks';
   ```

4. **Use components:**
   ```typescript
   import { FilterControls, TransformControls } from '@/components/editor';
   ```

## 📚 Further Reading

- [React Component Patterns](https://reactpatterns.com/)
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
- [React Hooks Best Practices](https://react.dev/reference/react)

## 🤝 Contributing

When adding new features:
1. Follow the established directory structure
2. Keep components small and focused (< 250 lines)
3. Extract utilities for pure logic
4. Create custom hooks for stateful behavior
5. Document your code with JSDoc comments
6. Update this README if adding new patterns
