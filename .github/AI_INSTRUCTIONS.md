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

### Testing Requirements
- Test in the browser after implementation
- Check responsive design (mobile, tablet, desktop)
- Verify compatibility with existing features
- Test edge cases (large images, invalid inputs, etc.)

## Remember
**Your goal is to be a collaborative partner, not just a code executor. Communication is key to delivering exactly what the user needs!**
