# Architecture Visualization

## Before Refactoring (Monolithic)

```
┌─────────────────────────────────────┐
│      EditorControls.tsx             │
│          (330 lines)                │
├─────────────────────────────────────┤
│  • All filter controls              │
│  • All transform controls           │
│  • All tool buttons                 │
│  • Crop mode UI                     │
│  • Rotate mode UI                   │
│  • Resize mode UI                   │
│  • Mixed concerns                   │
│  • Hard to test                     │
│  • Difficult to navigate            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  InteractiveImageCanvas.tsx         │
│          (468 lines)                │
├─────────────────────────────────────┤
│  • Canvas rendering                 │
│  • Filter application               │
│  • Crop overlay drawing             │
│  • Crop interaction logic           │
│  • Image loading                    │
│  • All mixed together               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      EditorScreen.tsx               │
│          (325 lines)                │
├─────────────────────────────────────┤
│  • Edit history management          │
│  • State management                 │
│  • AI panel management              │
│  • Export modal management          │
│  • Multiple responsibilities        │
└─────────────────────────────────────┘
```

## After Refactoring (Modular)

```
┌────────────────────────────────────────────────────────────┐
│                    TYPES LAYER                             │
├────────────────────────────────────────────────────────────┤
│  types/editor.types.ts                                     │
│  • EditValues, CropArea, EditMode, DragHandle              │
│  • Single source of truth for type definitions             │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                    UTILS LAYER                             │
├────────────────────────────────────────────────────────────┤
│  utils/canvas.utils.ts          utils/crop.utils.ts       │
│  • applyFilters()               • getHandleAt()            │
│  • calculateDimensions()        • updateCropArea()         │
│  • applyRotation()              • drawCropOverlay()        │
│  • applyFlip()                  • getCursorForHandle()     │
│                                                             │
│  Pure functions - No React dependencies                    │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                    HOOKS LAYER                             │
├────────────────────────────────────────────────────────────┤
│  useImageLoader      useCropInteraction    useEditHistory  │
│  • Image loading     • Crop state          • Undo/redo     │
│  • Error handling    • Mouse handlers      • History track │
│  • Refs              • Drag logic          • Updates       │
│                                                             │
│  Reusable stateful logic                                   │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                 COMPONENTS LAYER                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  editor/FilterControls.tsx (90 lines)                      │
│  ├─ Blur slider                                            │
│  ├─ Grayscale toggle                                       │
│  ├─ Brightness slider                                      │
│  └─ Contrast slider                                        │
│                                                             │
│  editor/TransformControls.tsx (70 lines)                   │
│  ├─ Flip horizontal                                        │
│  ├─ Flip vertical                                          │
│  └─ Rotation controls                                      │
│                                                             │
│  editor/ToolButtons.tsx (45 lines)                         │
│  ├─ Crop tool                                              │
│  ├─ Frame resize                                           │
│  └─ Image resize                                           │
│                                                             │
│  editor/CropModeControls.tsx (35 lines)                    │
│  ├─ Instructions                                           │
│  └─ Apply/Cancel                                           │
│                                                             │
│  editor/RotateModeControls.tsx (85 lines)                  │
│  ├─ Angle input                                            │
│  ├─ Quick rotate buttons                                   │
│  └─ Apply/Cancel                                           │
│                                                             │
│  editor/ResizeModeControls.tsx (75 lines)                  │
│  ├─ Width input                                            │
│  ├─ Height input                                           │
│  └─ Apply/Cancel                                           │
│                                                             │
│  Small, focused, testable components                       │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│              ORCHESTRATION LAYER                           │
├────────────────────────────────────────────────────────────┤
│  EditorControls.tsx (simplified, ~80 lines)                │
│  ├─ Conditionally renders mode-specific controls           │
│  ├─ Coordinates between sub-components                     │
│  └─ Manages mode switching                                 │
│                                                             │
│  EditorScreen.tsx (can be simplified further)              │
│  ├─ Uses useEditHistory hook                               │
│  ├─ Coordinates main editor layout                         │
│  └─ Manages modals and panels                              │
│                                                             │
│  InteractiveImageCanvas.tsx (can be simplified)            │
│  ├─ Can use useImageLoader hook                            │
│  ├─ Can use useCropInteraction hook                        │
│  └─ Can use canvas.utils and crop.utils                    │
└────────────────────────────────────────────────────────────┘
```

## Component Composition Example

```
EditorControls
├─ if (editMode === 'none')
│  ├─ FilterControls
│  │  ├─ Blur Slider
│  │  ├─ Grayscale Switch
│  │  ├─ Brightness Slider
│  │  └─ Contrast Slider
│  ├─ Separator
│  ├─ TransformControls
│  │  ├─ Flip Horizontal Button
│  │  ├─ Flip Vertical Button
│  │  └─ Rotation Button
│  ├─ Separator
│  └─ ToolButtons
│     ├─ Crop Button
│     ├─ Frame Resize Button
│     └─ Image Resize Button
│
├─ if (editMode === 'crop')
│  └─ CropModeControls
│     ├─ Instructions
│     ├─ Apply Button
│     └─ Cancel Button
│
├─ if (editMode === 'rotate')
│  └─ RotateModeControls
│     ├─ Angle Input
│     ├─ Quick Rotate Buttons
│     ├─ Apply Button
│     └─ Cancel Button
│
└─ if (editMode === 'resize')
   └─ ResizeModeControls
      ├─ Width Input
      ├─ Height Input
      ├─ Apply Button
      └─ Cancel Button
```

## Data Flow

```
┌──────────────┐
│   User Input │
└──────┬───────┘
       ↓
┌──────────────────────┐
│  Sub-Components      │
│  (FilterControls,    │
│   TransformControls, │
│   etc.)              │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  EditorControls      │
│  (Orchestrator)      │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  EditorScreen        │
│  (State Manager)     │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Custom Hooks        │
│  (useEditHistory,    │
│   useImageLoader,    │
│   useCropInteraction)│
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Utilities           │
│  (canvas.utils,      │
│   crop.utils)        │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Canvas/DOM Updates  │
└──────────────────────┘
```

## File Size Comparison

### Before
```
█████████████████████████████████ EditorControls.tsx (330 lines)
███████████████████████████████████████████████ InteractiveImageCanvas.tsx (468 lines)
████████████████████████████████ EditorScreen.tsx (325 lines)
```

### After
```
FilterControls.tsx        ████████████ (90 lines)
TransformControls.tsx     ██████████   (70 lines)
ToolButtons.tsx           ██████       (45 lines)
CropModeControls.tsx      ████         (35 lines)
RotateModeControls.tsx    ███████████  (85 lines)
ResizeModeControls.tsx    █████████    (75 lines)

canvas.utils.ts           ████████████████ (100 lines)
crop.utils.ts             ████████████████████ (200 lines)

useImageLoader.ts         ████████     (40 lines)
useCropInteraction.ts     ████████████ (120 lines)
useEditHistory.ts         ████████     (70 lines)

editor.types.ts           ██████       (50 lines)
```

## Benefits Overview

```
┌─────────────────────────────────────────────────────────┐
│                  BEFORE                                 │
├─────────────────────────────────────────────────────────┤
│  ❌ Large files (330-468 lines)                         │
│  ❌ Mixed concerns                                      │
│  ❌ Hard to navigate                                    │
│  ❌ Difficult to test                                   │
│  ❌ Risky to modify                                     │
│  ❌ Poor reusability                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
              REFACTORING
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   AFTER                                 │
├─────────────────────────────────────────────────────────┤
│  ✅ Small files (35-200 lines)                          │
│  ✅ Single responsibility                               │
│  ✅ Easy to navigate                                    │
│  ✅ Testable in isolation                               │
│  ✅ Safe to modify                                      │
│  ✅ Highly reusable                                     │
│  ✅ Well documented                                     │
│  ✅ Clear architecture                                  │
└─────────────────────────────────────────────────────────┘
```
