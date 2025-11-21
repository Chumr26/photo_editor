# Advanced Photo Editor / Trình chỉnh sửa ảnh nâng cao

A responsive, feature-rich photo editor web application built with React + TypeScript and Tailwind CSS. The UI is bilingual (Vietnamese first, English secondary) and focuses on common desktop-style image editing workflows (upload, crop, adjust, transform, export) while remaining lightweight and extensible.

## Quick links
- Source: this repository
- Original design: https://www.figma.com/design/7wfE0HWTE1SsJZ1nwaMu9t/photo_editor

## Run locally
1. Install dependencies:

	 npm i

2. Start the dev server:

	 npm run dev

The app boots a Vite dev server and opens the editor UI. The entry point is `src/main.tsx` → `src/App.tsx` which mounts the editor shell.

## Project overview (high level)
- Core tech: React 18, TypeScript, Tailwind CSS, Vite
- State management: `zustand` store at `src/store/editorStore.ts` (holds image, layers, adjustments, history, settings)
- Canvas: `src/components/CanvasEnhanced.tsx` — primary drawing surface and preview
- UI layout: `src/components/TopBar.tsx`, `LeftToolbar.tsx`, `RightControlPanel.tsx` (panel is composed from `components/panels/*`)
- Utilities: export helpers in `src/utils/exportImage.ts` and other small helpers in `src/utils`

## Key implemented features (summary)
The project contains a number of complete, production-ready features and several partially implemented items. Highlights taken from the in-repo docs:

- Image upload & preview (drag & drop or file picker) — `UploadZone`.
- Canvas controls: zoom (10–500%), pan (Space + drag), grid and rulers toggles, mini-map/preview.
- Non-destructive adjustments (brightness, contrast, saturation, hue, blur, grayscale, sepia) applied live.
- Image resize with presets and aspect-lock (Right panel → Properties).
- Sharpen filter implemented via 3×3 convolution kernel (Tools → Adjustments).
- Transform tools: rotate (90°, 180°), flip, free rotation with proper canvas translation.
- Color Balance UI (Shadows/Midtones/Highlights) with preserve-luminosity option.
- Settings modal (language, auto-save, default export format, export quality, canvas background, grid size, history depth) and integration across the app.
- Export pipeline: `utils/exportImage.ts` with format/quality/scale/transparent options and TopBar/ExportSection wiring.
- History & snapshot system: stores snapshots of image/layers/adjustments and integrates with undo/redo and auto-save.

Partial / planned features (UI present, pixel processing missing or TODO):
- Curves & Levels editors: UI is present but pixel application (ImageData processing) remains to be implemented.
- Advanced tools like Clone/Heal, Liquify, Noise Reduction — UI placeholders exist; algorithmic implementation pending.
- Some quick-export UX improvements (TopBar quick export behavior) noted in docs as possible refinements.

## Folder map (important files)
- src/
	- App.tsx — editor shell and global keyboard shortcuts
	- main.tsx — app bootstrap
	- styles/globals.css — global Tailwind styles
	- components/
		- CanvasEnhanced.tsx — main canvas + drawing logic
		- TopBar.tsx — top controls (zoom, undo/redo, export, settings)
		- LeftToolbar.tsx — tool selector
		- RightControlPanel.tsx — collapsible right panels (Properties, Tools, Layers, History, Presets, Export)
		- UploadZone.tsx — file upload UI
		- panels/ — grouped panels (PropertiesSection, ToolsSection, ExportSection, HistorySection, LayersSection, etc.)
		- ui/ — small UI primitives and shared components
	- store/
		- editorStore.ts — single source of truth (zustand) for image, layers, adjustments, snapshots, and settings
	- utils/
		- exportImage.ts — image export helpers used by TopBar and ExportSection

## Developer notes & conventions
- Bilingual labels: UI strings are generally available in Vietnamese and English. Settings let you switch or show both.
- State & snapshots: use `useEditorStore` for all state changes; snapshots include metadata used by the History panel.
- Canvas operations: many transformations rely on HTMLCanvasElement APIs (drawImage, translate, rotate, scale) and then convert to data URLs for persistence.

## How to contribute / extend
1. Run the app locally (see Run locally above).
2. Tweak UI components under `src/components`. Use the existing panels as examples for wiring store state and actions.
3. Add pixel-processing logic in `CanvasEnhanced.tsx` or a new utility (for Curves/Levels, implement ImageData transforms and then call `saveSnapshot()` to persist the change).
4. Add unit / integration tests where appropriate. The project has no test runner configured by default — consider adding Vitest or Jest for CI.

## Known limitations & next steps
- Curves/Levels: need ImageData-level algorithms (apply curve/levels to pixels) — high priority for true non-destructive editing.
- Advanced retouch tools (Clone/Heal, Liquify) require image-sampling & mesh-warp algorithms — substantial work but planned.
- Performance: currently fine for typical images; large multi-megapixel images may need off-main-thread processing (Web Worker) for heavy filters.

## Credits
- UI/Design: original Figma design linked above.
- Libraries: React, Vite, Tailwind CSS, Zustand, Radix UI primitives, Sonner (toasts), lucide-react icons.