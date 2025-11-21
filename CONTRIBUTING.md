# Contributing to Photo Editor

Thank you for your interest in contributing to the Photo Editor project! This document provides guidelines and instructions for setting up your development environment and contributing code.

## 🛠️ Development Setup

1. **Prerequisites**
   - Node.js (v18 or higher recommended)
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd photo_editor

   # Install dependencies
   npm install
   ```

3. **Running the App**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

Please refer to [src/README.md](src/README.md) for a detailed folder map and architecture overview.

## 🧩 Coding Conventions

- **Language:** TypeScript is strictly enforced. Avoid `any` types where possible.
- **Styling:** Use Tailwind CSS utility classes. For complex components, consider breaking them down.
- **State Management:** Use the `useEditorStore` hook from `src/store/editorStore.ts`.
- **Components:** Functional components with hooks. Place reusable UI components in `src/components/ui`.
- **Bilingual Support:** Ensure all new UI text has both Vietnamese and English labels (e.g., `label: 'Cắt', labelEn: 'Crop'`).

## 🧪 How to Add a New Feature

1. **UI Component:** Create your component in `src/components/panels/` if it's a panel, or `src/components/` if it's a general UI element.
2. **State:** Add necessary state slices to `src/store/editorStore.ts`.
3. **Logic:** Implement the logic. If it involves pixel manipulation, consider adding a utility in `src/utils/` or extending `CanvasEnhanced.tsx`.
4. **Integration:** Wire up your component in `RightControlPanel.tsx` or `TopBar.tsx`.

## 📝 Pull Request Process

1. Create a new branch for your feature or fix: `git checkout -b feature/my-new-feature`.
2. Commit your changes with clear messages.
3. Push to your branch and submit a Pull Request.
4. Ensure your code builds without errors (`npm run build`).

## 🐛 Reporting Issues

If you find a bug, please open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

Happy coding! 🚀
