# AI Development Instructions

## Communication Guidelines

### Before Implementation
When receiving a new feature request or requirement from the user, **ALWAYS**:

1. **Ask Clarifying Questions** - Don't assume! Ask about:
   - The specific use case and user story
   - Expected behavior and edge cases
   - UI/UX preferences (layout, colors, interactions)
   - Performance requirements
   - Browser/device compatibility needs
   - Integration with existing features

2. **Confirm Understanding** - Summarize what you understood and ask:
   - "Did I understand correctly that you want...?"
   - "Should this feature work like... or like...?"
   - "What should happen when...?"

3. **Propose Solutions** - Before coding, present options:
   - Outline 2-3 possible approaches
   - Explain pros and cons of each
   - Get user approval on the chosen approach

### During Implementation
- **Show Progress** - Explain what you're doing and why
- **Ask When Uncertain** - Better to ask than to implement incorrectly
- **Validate Assumptions** - If making assumptions, state them clearly

### After Implementation
- **Request Feedback** - Ask if the implementation meets expectations
- **Offer Improvements** - Suggest enhancements or optimizations
- **Document Changes** - Explain what was changed and why

## Example Interaction Flow

❌ **Bad:**
```
User: "Add a filter feature"
AI: [Immediately implements a filter without asking questions]
```

✅ **Good:**
```
User: "Add a filter feature"
AI: "I'd like to clarify a few things about the filter feature:
     1. What type of filters should be included? (e.g., brightness, contrast, blur, vintage effects?)
     2. Should users be able to preview filters before applying?
     3. Should filters be stackable or mutually exclusive?
     4. Where should this feature be placed in the UI?
     5. Should there be preset filter combinations?
     Please let me know your preferences!"
```

## Project-Specific Context

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Image Processing**: Canvas API
- **State Management**: React hooks

### Code Standards
- Use TypeScript with proper type annotations
- Follow existing component structure
- Maintain consistent naming conventions (camelCase for variables, PascalCase for components)
- Add proper error handling
- Keep components modular and reusable

### File Organization & Component Structure

#### Component Size Guidelines
- **Maximum file size**: 200-300 lines for components
- **Single Responsibility**: Each component should do ONE thing well
- **Extract when needed**: If a component grows beyond 250 lines, consider breaking it down

#### Directory Structure
```
src/
├── components/          # UI Components
│   ├── editor/         # Editor-specific components (small, focused)
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   └── [feature]/      # Feature-specific components
├── hooks/              # Custom React hooks
│   ├── useImageLoader.ts
│   ├── useCropInteraction.ts
│   └── useEditHistory.ts
├── utils/              # Utility functions
│   ├── canvas.utils.ts    # Canvas operations
│   ├── crop.utils.ts      # Crop calculations
│   └── image.utils.ts     # Image processing
├── types/              # TypeScript type definitions
│   └── editor.types.ts
└── styles/             # Global styles
```

#### When to Extract Components
Extract a component when:
1. **Repeated UI patterns**: Same UI structure used multiple times
2. **Logical grouping**: Related controls/features that work together
3. **File size**: Component exceeds 250 lines
4. **Complex logic**: Component handles multiple concerns
5. **Testing needs**: Need to test a specific piece independently

#### When to Extract Utilities
Create utility functions when:
1. **Pure logic**: Function doesn't need React hooks or state
2. **Reusability**: Logic used in multiple places
3. **Complex calculations**: Math, transformations, validations
4. **Testability**: Need to unit test logic separately

#### When to Extract Hooks
Create custom hooks when:
1. **Stateful logic**: Managing related state and side effects
2. **Reusable behavior**: Same pattern used across components
3. **Complex interactions**: Multiple event handlers and state updates
4. **Separation of concerns**: UI logic separate from business logic

#### Example: Breaking Down Large Components
❌ **Bad** - One large component (500+ lines):
```tsx
function EditorControls() {
  // 100 lines of state
  // 200 lines of filter controls
  // 100 lines of transform controls
  // 100 lines of tool buttons
  // Result: Hard to maintain, test, and understand
}
```

✅ **Good** - Multiple focused components:
```tsx
// EditorControls.tsx (50 lines) - Orchestration
function EditorControls() {
  return (
    <div>
      <FilterControls {...props} />
      <TransformControls {...props} />
      <ToolButtons {...props} />
    </div>
  );
}

// FilterControls.tsx (80 lines) - Filter-specific
// TransformControls.tsx (60 lines) - Transform-specific
// ToolButtons.tsx (40 lines) - Tool selection
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `FilterControls`, `CropModeControls`)
- **Hooks**: camelCase with `use` prefix (e.g., `useImageLoader`, `useCropInteraction`)
- **Utilities**: camelCase with descriptive names (e.g., `applyFilters`, `calculateCanvasDimensions`)
- **Types**: PascalCase with descriptive names (e.g., `EditValues`, `CropArea`)
- **Files**: Match the export name (e.g., `FilterControls.tsx`, `useImageLoader.ts`)

#### Code Organization Within Files
1. **Imports**: Group by external, internal, types
2. **Types/Interfaces**: Define at top of file
3. **Component/Function**: Main export
4. **Helper functions**: Below main export (or extract to utils)
5. **Styles**: Tailwind classes inline or separate file

#### Documentation
- Add JSDoc comments to utility functions
- Add file-level comments explaining purpose
- Document complex algorithms or non-obvious logic
- Keep comments concise and meaningful

### Testing Requirements
- Test in the browser after implementation
- Check responsive design (mobile, tablet, desktop)
- Verify compatibility with existing features
- Test edge cases (large images, invalid inputs, etc.)

## Remember
**Your goal is to be a collaborative partner, not just a code executor. Communication is key to delivering exactly what the user needs!**
