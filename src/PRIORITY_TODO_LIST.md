# 🎯 PRIORITY TODO LIST - What to Fix Next

**Last Updated:** Current Session

---

## 📊 CURRENT STATE

✅ **16 Features Fully Working (67%)**
⚠️ **4 Features Partially Working (17%)**  
❌ **8 Features Not Implemented (33%)**

---

## 🔥 PHASE 1: FIX PARTIAL IMPLEMENTATIONS (CRITICAL)

These features have complete UI but don't actually work. Users will expect them to function!

### 1. ❌ Color Balance Canvas Integration
**Priority:** 🔥🔥🔥 CRITICAL  
**Status:** UI complete, zero canvas effect  
**Problem:**
- UI exists and updates store state
- BUT `CanvasEnhanced.tsx` never reads `colorBalance` state
- Sliders move but image doesn't change

**What's Needed:**
```typescript
// Add to CanvasEnhanced.tsx:
1. Import colorBalance from store
2. Add colorBalance to useEffect dependencies
3. Create applyColorBalance(ctx, canvas, colorBalance) function
4. Process ImageData pixels:
   - Calculate pixel luminosity (0-255)
   - Determine if pixel is shadow/midtone/highlight
   - Apply color shifts based on tone range
   - Optionally preserve luminosity
5. Call after applySharpen()
```

**Estimate:** 30-45 minutes  
**Impact:** HIGH - Professional color grading feature

---

### 2. ❌ Settings Integration Throughout App
**Priority:** 🔥🔥 HIGH  
**Status:** Settings save but aren't used  
**Problem:**
- Settings modal works perfectly
- Values save to store
- BUT no component actually uses the settings

**What's Needed:**
```typescript
// 1. ExportSection.tsx
- Read settings.defaultExportFormat on mount
- Read settings.exportQuality as default value
- Set initial format/quality from settings

// 2. CanvasEnhanced.tsx or container
- Apply settings.canvasBackground to canvas container style
- Show grid if settings.showGrid === true
- Show rulers if settings.showRulers === true

// 3. Implement Auto-Save
- Create useEffect with settings.autoSaveInterval timer
- Only run if settings.autoSave === true
- Call saveSnapshot() on interval

// 4. Language Integration
- Create useLanguage() hook that reads settings.language
- Conditionally render text based on 'vi' | 'en' | 'both'
```

**Estimate:** 1-2 hours  
**Impact:** HIGH - Core user preferences

---

### 3. ❌ Curves Pixel Processing
**Priority:** 🔥 MEDIUM-HIGH  
**Status:** Modal works, "Apply" does nothing  
**Problem:**
- Beautiful curve editor modal
- Apply button calls `handleCurvesApply(curve)`
- BUT function just does `console.log()`

**What's Needed:**
```typescript
// In store or CanvasEnhanced:
1. Store curve array (256 values, 0-255)
2. Create applyCurvesToImage() function:
   - Get ImageData
   - For each pixel RGB channel:
     - newValue = curve[oldValue]
   - Put ImageData back
3. Update image.src with new data
4. Save snapshot to history
```

**Estimate:** 45-60 minutes  
**Impact:** MEDIUM - Advanced users feature

---

### 4. ❌ Levels Pixel Processing
**Priority:** 🔥 MEDIUM-HIGH  
**Status:** Modal works, "Apply" does nothing  
**Problem:**
- Histogram display works
- Apply button calls `handleLevelsApply(levels)`
- BUT function just does `console.log()`

**What's Needed:**
```typescript
// In store or CanvasEnhanced:
1. Store levels: { inputBlack, inputMid, inputWhite, outputBlack, outputWhite }
2. Create applyLevelsToImage() function:
   - Get ImageData
   - For each pixel RGB channel:
     - Clamp input range
     - Apply midtone gamma correction
     - Map to output range
   - Put ImageData back
3. Update image.src
4. Save snapshot
```

**Estimate:** 45-60 minutes  
**Impact:** MEDIUM - Advanced adjustment

---

## 🌟 PHASE 2: IMPLEMENT ADVANCED COLOR TOOLS

These have buttons in the "Advanced" tab but no implementation.

### 5. ❌ HSL / Selective Color
**Priority:** 🌟 MEDIUM  
**Status:** Button only, zero implementation  

**What's Needed:**
```typescript
1. Create HSLEditor.tsx modal component
2. UI with:
   - Color range selector (Reds, Yellows, Greens, Cyans, Blues, Magentas)
   - Hue slider for selected range
   - Saturation slider
   - Lightness slider
3. Create pixel processing function:
   - Convert RGB to HSL
   - Check if hue falls in selected range
   - Adjust H/S/L for matching pixels
   - Convert back to RGB
4. Apply to image
```

**Estimate:** 1.5-2 hours  
**Impact:** MEDIUM - Targeted color adjustment

---

## ⭐ PHASE 3: ADVANCED MANIPULATION TOOLS

Specialized tools for advanced users.

### 6. ❌ Clone/Heal Tool
**Priority:** ⭐ MEDIUM-LOW  
**Status:** Button + toolbar icon only  

**What's Needed:**
```typescript
1. Add clone tool state to store
2. Implement clone mode in canvas:
   - Alt+Click to set source point
   - Click+Drag to clone from source
   - Copy pixels from source offset
   - Paint to destination
3. Heal mode (blend with surroundings)
```

**Estimate:** 2-3 hours  
**Impact:** MEDIUM - Content-aware editing

---

### 7. ❌ Liquify Tool
**Priority:** ⭐ LOW  
**Status:** Button + toolbar icon only  

**What's Needed:**
```typescript
1. Create liquify mode
2. Implement mesh-based distortion:
   - Push, pull, rotate, pucker, bloat
   - Drag to warp pixels
   - Real-time mesh deformation
3. Apply warp to ImageData
```

**Estimate:** 3-4 hours  
**Impact:** LOW - Specialized effect

---

### 8. ❌ Perspective Correction
**Priority:** ⭐ LOW  
**Status:** Button only  

**What's Needed:**
```typescript
1. Create perspective grid overlay
2. Allow corner dragging
3. Implement perspective transform matrix
4. Apply transform to image
```

**Estimate:** 2-3 hours  
**Impact:** LOW - Architecture/product photos

---

### 9. ❌ Noise Reduction
**Priority:** ⭐ LOW  
**Status:** Button only  

**What's Needed:**
```typescript
1. Create NoiseReduction modal
2. Implement median filter or bilateral filter
3. Strength slider
4. Apply to ImageData
```

**Estimate:** 1-2 hours  
**Impact:** LOW - Photo enhancement

---

## 📝 PHASE 4: POLISH & ENHANCEMENTS

Optional improvements for better UX.

### 10. ⭐ Presets System
**Priority:** ⭐ VERY LOW  
**Status:** Empty section  

**What's Needed:**
```typescript
1. Define preset interface (save all adjustments + settings)
2. localStorage or Supabase storage
3. Save preset button
4. Load preset button
5. Preset list with thumbnails
6. Delete preset
```

**Estimate:** 2-3 hours  
**Impact:** LOW - User convenience

---

### 11. ⭐ Selection Tool Enhancement
**Priority:** ⭐ VERY LOW  
**Status:** Toolbar icon only  

**What's Needed:**
```typescript
1. Draw selection rectangle on canvas
2. Selection operations (cut, copy, delete)
3. Move selected area
4. Transform selected area
```

**Estimate:** 2-3 hours  
**Impact:** LOW - Enhanced editing

---

## 🎯 RECOMMENDED ACTION PLAN

### Next Session - Fix These 4 Items:
1. ✅ **Color Balance Canvas Integration** (30-45 min) - DONE: Feature #5
2. 🔜 **Curves Pixel Processing** (45-60 min)
3. 🔜 **Levels Pixel Processing** (45-60 min)
4. 🔜 **Settings Integration** (1-2 hours)

**Total Time:** ~4-5 hours  
**Result:** All partial implementations become fully functional

### After That - Add New Features:
5. HSL / Selective Color (1.5-2 hours)
6. Clone/Heal Tool (2-3 hours)
7. Liquify Tool (3-4 hours)
8. Others as desired

---

## 📈 PROGRESS TRACKING

- ✅ Phase 1, Item 1: Color Balance - **UI DONE, CANVAS PENDING**
- 🔜 Phase 1, Item 2: Settings Integration - **NOT STARTED**
- 🔜 Phase 1, Item 3: Curves Processing - **NOT STARTED**
- 🔜 Phase 1, Item 4: Levels Processing - **NOT STARTED**
- 🔜 Phase 2, Item 5: HSL/Selective - **NOT STARTED**
- 🔜 Phase 3+: Advanced tools - **NOT STARTED**

---

## 💡 KEY INSIGHT

**The app LOOKS more complete than it actually is!**

Many features have beautiful, functional UI that gives the impression they work, but behind the scenes they do nothing. This creates a misleading user experience.

**Priority is to fix these "fake" features before adding new ones.**
