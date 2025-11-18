# Quick Reference Guide

## 🚀 Quick Start

### Need to add a new filter?
1. Add the filter property to `EditValues` in `src/types/editor.types.ts`
2. Add the filter UI to `src/components/editor/FilterControls.tsx`
3. Add the filter logic to `src/utils/canvas.utils.ts`

### Need to add a new tool?
1. Add the tool button to `src/components/editor/ToolButtons.tsx`
2. Create a new mode control component (e.g., `MyToolModeControls.tsx`)
3. Add mode handling in `EditorControls.tsx`

### Need to add reusable logic?
1. **Pure function** → Add to `src/utils/`
2. **Stateful logic** → Create hook in `src/hooks/`
3. **UI component** → Add to `src/components/editor/`

## 📁 Where to Find Things

| What | Where |
|------|-------|
| Type definitions | `src/types/editor.types.ts` |
| Canvas operations | `src/utils/canvas.utils.ts` |
| Crop calculations | `src/utils/crop.utils.ts` |
| Image loading logic | `src/hooks/useImageLoader.ts` |
| Crop interaction | `src/hooks/useCropInteraction.ts` |
| Edit history | `src/hooks/useEditHistory.ts` |
| Filter controls | `src/components/editor/FilterControls.tsx` |
| Transform controls | `src/components/editor/TransformControls.tsx` |
| Tool buttons | `src/components/editor/ToolButtons.tsx` |
| Crop mode UI | `src/components/editor/CropModeControls.tsx` |
| Rotate mode UI | `src/components/editor/RotateModeControls.tsx` |
| Resize mode UI | `src/components/editor/ResizeModeControls.tsx` |

## 🎯 Common Tasks

### Adding a New Filter

**1. Update Types**
```typescript
// src/types/editor.types.ts
export interface EditValues {
  // ... existing filters
  sepia: boolean; // NEW
}
```

**2. Add UI Control**
```typescript
// src/components/editor/FilterControls.tsx
<div className="flex items-center justify-between">
  <Label htmlFor="sepia">Sepia</Label>
  <Switch
    id="sepia"
    checked={edits.sepia}
    onCheckedChange={(checked) => onEditChange('sepia', checked)}
  />
</div>
```

**3. Add Filter Logic**
```typescript
// src/utils/canvas.utils.ts
export function applyFilters(canvas, edits) {
  const filters = [];
  // ... existing filters
  if (edits.sepia) filters.push('sepia(100%)');
  // ... rest of function
}
```

### Adding a New Tool

**1. Add Tool Button**
```typescript
// src/components/editor/ToolButtons.tsx
<Button
  variant="outline"
  onClick={() => onEditModeChange('mytool')}
>
  <MyToolIcon className="w-4 h-4 mr-2" />
  My Tool
</Button>
```

**2. Create Mode Controls**
```typescript
// src/components/editor/MyToolModeControls.tsx
export function MyToolModeControls({ onApply, onCancel }) {
  return (
    <div className="space-y-4">
      {/* Your tool UI */}
      <Button onClick={onApply}>Apply</Button>
      <Button onClick={onCancel} variant="outline">Cancel</Button>
    </div>
  );
}
```

**3. Add to EditorControls**
```typescript
// src/components/EditorControls.tsx
{editMode === 'mytool' && (
  <MyToolModeControls onApply={handleApply} onCancel={handleCancel} />
)}
```

### Creating a Utility Function

**1. Add to appropriate utils file**
```typescript
// src/utils/canvas.utils.ts or crop.utils.ts
/**
 * Description of what this function does
 */
export function myUtilityFunction(param1: Type1, param2: Type2): ReturnType {
  // Implementation
  return result;
}
```

**2. Use in component**
```typescript
import { myUtilityFunction } from '@/utils';

// In component
const result = myUtilityFunction(value1, value2);
```

### Creating a Custom Hook

**1. Create hook file**
```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export function useMyHook(initialValue) {
  const [state, setState] = useState(initialValue);
  
  const doSomething = useCallback(() => {
    // Logic
  }, []);
  
  return { state, doSomething };
}
```

**2. Export from index**
```typescript
// src/hooks/index.ts
export * from './useMyHook';
```

**3. Use in component**
```typescript
import { useMyHook } from '@/hooks';

function MyComponent() {
  const { state, doSomething } = useMyHook(initialValue);
  // ...
}
```

## 📏 Size Guidelines

| Type | Max Lines | Action if Exceeded |
|------|-----------|-------------------|
| Component | 250 | Extract sub-components or hooks |
| Utility file | 300 | Split into multiple files |
| Hook | 150 | Extract helper functions |
| Type file | No limit | Keep organized and documented |

## 🎨 Naming Patterns

### Components
- PascalCase
- Descriptive name
- Suffix with purpose if needed
- Example: `FilterControls`, `CropModeControls`

### Hooks
- camelCase
- Start with `use`
- Describe what it manages
- Example: `useImageLoader`, `useCropInteraction`

### Utilities
- camelCase
- Action verb + noun
- Be specific
- Example: `applyFilters`, `calculateCanvasDimensions`

### Types
- PascalCase
- Clear, descriptive
- Avoid abbreviations
- Example: `EditValues`, `CropArea`, `DragHandle`

## 🧪 Testing Checklist

Before committing:
- [ ] No TypeScript errors
- [ ] Component renders without errors
- [ ] Feature works as expected
- [ ] No console errors/warnings
- [ ] Responsive on mobile/tablet/desktop
- [ ] Existing features still work
- [ ] Code is properly formatted

## 📚 Documentation Templates

### Component
```typescript
/**
 * ComponentName
 * 
 * Brief description of what this component does.
 * Use cases: when to use this component.
 */

interface ComponentNameProps {
  // Props with JSDoc comments
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Implementation
}
```

### Hook
```typescript
/**
 * useHookName Hook
 * 
 * Description of what this hook manages.
 * Returns: what the hook provides to consumers.
 */

interface UseHookNameProps {
  // Props with JSDoc comments
}

export function useHookName(props: UseHookNameProps) {
  // Implementation
  return { /* returned values */ };
}
```

### Utility
```typescript
/**
 * Description of what this utility does
 * 
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 * 
 * @example
 * const result = utilityName(value1, value2);
 */
export function utilityName(param1: Type1, param2: Type2): ReturnType {
  // Implementation
}
```

## 🔗 Import Patterns

### Organize imports
```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// 2. Internal components
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

// 3. Utils and hooks
import { applyFilters } from '../../utils';
import { useImageLoader } from '../../hooks';

// 4. Types
import { EditValues, CropArea } from '../../types/editor.types';

// 5. Styles (if any)
import './styles.css';
```

### Use barrel exports
```typescript
// Good: Use index.ts exports
import { FilterControls, TransformControls } from '@/components/editor';

// Avoid: Direct imports when barrel exists
import { FilterControls } from '@/components/editor/FilterControls';
```

## 🚨 Common Pitfalls

### ❌ Don't
```typescript
// Large component with mixed concerns
function LargeComponent() {
  // 300 lines of mixed logic
}

// Inline complex logic
const result = /* 50 lines of calculations */;

// Vague names
function doStuff() {}
const x = getValue();
```

### ✅ Do
```typescript
// Small, focused component
function FilterControls() {
  // 90 lines of filter-specific UI
}

// Extract complex logic
const result = calculateComplexValue(input);

// Clear names
function applyImageFilters() {}
const imageWidth = getImageWidth();
```

## 💡 Tips

1. **Before creating a new file**, check if similar functionality exists
2. **Before making a component**, consider if it's reusable
3. **Before adding props**, consider if the component is doing too much
4. **After refactoring**, run the app and test all features
5. **When stuck**, refer to `REFACTORING_GUIDE.md` for examples

## 🆘 Need Help?

1. Check `REFACTORING_GUIDE.md` for detailed examples
2. Check `ARCHITECTURE.md` for visual structure
3. Check `AI_INSTRUCTIONS.md` for AI development guidelines
4. Look at existing components for patterns
5. Read the code comments and JSDoc

## 📖 Further Reading

- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Comprehensive refactoring guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Visual architecture diagrams
- [AI_INSTRUCTIONS.md](./.github/AI_INSTRUCTIONS.md) - AI development guidelines
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Summary of changes
