import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ChevronRight, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { CurvesEditor } from './CurvesEditor';
import { LevelsEditor } from './LevelsEditor';
import { TextEditor } from './TextEditor';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';

type ToolTab = 'adjustments' | 'color' | 'crop' | 'transform' | 'text' | 'insert' | 'brush' | 'advanced';

const toolTabs = [
  { id: 'adjustments', labelKey: 'tools.tab.adjustments' },
  { id: 'color', labelKey: 'tools.tab.color' },
  { id: 'crop', labelKey: 'tools.tab.crop' },
  { id: 'transform', labelKey: 'tools.tab.transform' },
  { id: 'text', labelKey: 'tools.tab.text' },
  { id: 'insert', labelKey: 'tools.tab.insert' },
  { id: 'brush', labelKey: 'tools.tab.brush' },
  { id: 'advanced', labelKey: 'tools.tab.advanced' },
] as const;

export function ToolsSection() {
  const { t } = useTranslation();
  const [showCurves, setShowCurves] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | null>(null);
  const [freeRotation, setFreeRotation] = useState(0);
  const { 
    adjustments, updateAdjustments, 
    brushSettings, updateBrushSettings, 
    addTextBox, updateTextBox, deleteTextBox, textBoxes, 
    setCropMode, setCropRect, applyCrop, cropMode, 
    tool, setTool, 
    image, rotateImage, flipImageHorizontal, flipImageVertical, freeRotateImage, 
    activeToolTab, setActiveToolTab,
    addLayer, layers, deleteLayer, updateLayer
  } = useEditorStore();
  
  // Color Balance state
  const [colorToneRange, setColorToneRange] = useState<'shadows' | 'midtones' | 'highlights'>('midtones');
  const { colorBalance, updateColorBalance, resetColorBalance, togglePreserveLuminosity } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for each content section
  const contentRefs = useRef<Record<ToolTab, HTMLDivElement | null>>({
    adjustments: null,
    color: null,
    crop: null,
    transform: null,
    text: null,
    insert: null,
    brush: null,
    advanced: null,
  });

  // Scroll active content into view when activeToolTab changes
  useEffect(() => {
    const activeContentRef = contentRefs.current[activeToolTab as ToolTab];
    if (activeContentRef) {
      activeContentRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeToolTab]);

  const handleCurvesApply = (curve: number[]) => {
    console.log('Curves applied:', curve);
    // In a full implementation, this would apply the curve to the image
  };

  const handleLevelsApply = (levels: any) => {
    console.log('Levels applied:', levels);
    // In a full implementation, this would apply levels adjustment
  };

  const handleTextApply = (textConfig: any) => {
    if (editingTextBoxId) {
      updateTextBox(editingTextBoxId, textConfig);
      setEditingTextBoxId(null);
    } else {
      addTextBox({
        id: `text-${Date.now()}`,
        ...textConfig,
      });
    }
  };

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('toast.insert.invalidFile'));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t('toast.insert.tooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        addLayer({
          id: `layer-${Date.now()}`,
          name: `Ảnh ${file.name}`,
          type: 'image',
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: 'normal',
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          rotation: 0,
          data: event.target?.result as string,
        });
        
        toast.success(t('toast.insert.success'));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAspectRatioChange = (ratio: string) => {
    let aspectRatio: number | null = null;
    
    switch (ratio) {
      case '1:1':
        aspectRatio = 1;
        break;
      case '4:3':
        aspectRatio = 4 / 3;
        break;
      case '16:9':
        aspectRatio = 16 / 9;
        break;
      case '3:2':
        aspectRatio = 3 / 2;
        break;
      case '2:3':
        aspectRatio = 2 / 3;
        break;
      default:
        aspectRatio = null;
    }
    
    setCropAspectRatio(aspectRatio);
    
    // Update existing crop rect if any
    const currentCropRect = useEditorStore.getState().cropRect;
    if (currentCropRect) {
      setCropRect({
        ...currentCropRect,
        aspectRatio: aspectRatio || undefined,
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Tool tabs */}
        <div className="space-y-1">
          {toolTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveToolTab(tab.id as ToolTab);
                if (tab.id === 'text') setTool('text');
                else if (tab.id === 'crop') setTool('crop');
                else if (tab.id === 'brush') setTool('brush');
                else if (tab.id === 'insert') setTool('move'); // Default to move tool for insert
              }}
              className={`
                w-full px-3 py-2 rounded flex items-center justify-between text-sm transition-colors
                ${
                  activeToolTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <span>{t(tab.labelKey)}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="h-px bg-gray-700" />

        {/* Tool content */}
        {activeToolTab === 'adjustments' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.adjustments = el; }}>
            {/* Brightness */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('adj.brightness')}</label>
                <span className="text-xs text-gray-400">{adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) =>
                  updateAdjustments({ brightness: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('adj.contrast')}</label>
                <span className="text-xs text-gray-400">{adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) =>
                  updateAdjustments({ contrast: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('adj.saturation')}</label>
                <span className="text-xs text-gray-400">{adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) =>
                  updateAdjustments({ saturation: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Hue */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('adj.hue')}</label>
                <span className="text-xs text-gray-400">{adjustments.hue}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={adjustments.hue}
                onChange={(e) => updateAdjustments({ hue: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Blur */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('adj.blur')}</label>
                <span className="text-xs text-gray-400">{adjustments.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={adjustments.blur}
                onChange={(e) => updateAdjustments({ blur: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Sharpen */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('adj.sharpen')}</label>
                <span className="text-xs text-gray-400">{adjustments.sharpen}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpen}
                onChange={(e) =>
                  updateAdjustments({ sharpen: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Grayscale */}
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={adjustments.grayscale}
                onChange={(e) => updateAdjustments({ grayscale: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800"
              />
              <span>{t('adj.grayscale')}</span>
            </label>

            {/* Sepia */}
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={adjustments.sepia}
                onChange={(e) => updateAdjustments({ sepia: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800"
              />
              <span>{t('adj.sepia')}</span>
            </label>

            <button
              onClick={() => {
                updateAdjustments({
                  brightness: 0,
                  contrast: 0,
                  saturation: 0,
                  blur: 0,
                  hue: 0,
                  sharpen: 0,
                  grayscale: false,
                  sepia: false,
                });
              }}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors"
            >
              🔄 {t('adj.reset')}
            </button>
          </div>
        )}

        {activeToolTab === 'color' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.color = el; }}>
            <h4 className="text-sm text-gray-300">{t('tools.colorBalance')}</h4>
            
            {/* Tone Range Selector */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">{t('colorBalance.toneRange')}</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setColorToneRange('shadows')}
                  className={`px-2 py-1.5 rounded text-xs transition-colors ${
                    colorToneRange === 'shadows'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {t('colorBalance.shadows')}
                </button>
                <button
                  onClick={() => setColorToneRange('midtones')}
                  className={`px-2 py-1.5 rounded text-xs transition-colors ${
                    colorToneRange === 'midtones'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {t('colorBalance.midtones')}
                </button>
                <button
                  onClick={() => setColorToneRange('highlights')}
                  className={`px-2 py-1.5 rounded text-xs transition-colors ${
                    colorToneRange === 'highlights'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {t('colorBalance.highlights')}
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-700" />

            {/* Cyan-Red Balance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-cyan-400">Cyan</span>
                <span className="text-xs text-gray-400">{colorBalance[colorToneRange].cyanRed}</span>
                <span className="text-xs text-red-400">Red</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={colorBalance[colorToneRange].cyanRed}
                onChange={(e) =>
                  updateColorBalance(colorToneRange, { cyanRed: Number(e.target.value) })
                }
                className="w-full"
                style={{
                  background: `linear-gradient(to right, rgb(0, 255, 255), rgb(128, 128, 128), rgb(255, 0, 0))`
                }}
              />
            </div>

            {/* Magenta-Green Balance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-pink-400">Magenta</span>
                <span className="text-xs text-gray-400">{colorBalance[colorToneRange].magentaGreen}</span>
                <span className="text-xs text-green-400">Green</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={colorBalance[colorToneRange].magentaGreen}
                onChange={(e) =>
                  updateColorBalance(colorToneRange, { magentaGreen: Number(e.target.value) })
                }
                className="w-full"
                style={{
                  background: `linear-gradient(to right, rgb(255, 0, 255), rgb(128, 128, 128), rgb(0, 255, 0))`
                }}
              />
            </div>

            {/* Yellow-Blue Balance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-yellow-400">Yellow</span>
                <span className="text-xs text-gray-400">{colorBalance[colorToneRange].yellowBlue}</span>
                <span className="text-xs text-blue-400">Blue</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={colorBalance[colorToneRange].yellowBlue}
                onChange={(e) =>
                  updateColorBalance(colorToneRange, { yellowBlue: Number(e.target.value) })
                }
                className="w-full"
                style={{
                  background: `linear-gradient(to right, rgb(255, 255, 0), rgb(128, 128, 128), rgb(0, 0, 255))`
                }}
              />
            </div>

            <div className="h-px bg-gray-700" />

            {/* Preserve Luminosity Toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={colorBalance.preserveLuminosity}
                onChange={() => togglePreserveLuminosity()}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800"
              />
              <span>{t('colorBalance.preserveLuminosity')}</span>
            </label>

            {/* Current Values Display */}
            <div className="bg-gray-800 p-3 rounded space-y-1">
              <div className="text-xs text-gray-400">{t('colorBalance.currentValues')} ({t(`colorBalance.${colorToneRange}`)}):</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">C-R:</span>
                  <span className={`ml-1 ${colorBalance[colorToneRange].cyanRed < 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {colorBalance[colorToneRange].cyanRed}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">M-G:</span>
                  <span className={`ml-1 ${colorBalance[colorToneRange].magentaGreen < 0 ? 'text-pink-400' : 'text-green-400'}`}>
                    {colorBalance[colorToneRange].magentaGreen}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Y-B:</span>
                  <span className={`ml-1 ${colorBalance[colorToneRange].yellowBlue < 0 ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {colorBalance[colorToneRange].yellowBlue}
                  </span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => resetColorBalance()}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors"
            >
              🔄 {t('colorBalance.reset')}
            </button>

            <div className="text-xs text-gray-400 space-y-1 bg-gray-800 p-2 rounded">
              <p>💡 {t('colorBalance.tip1')}</p>
              <p>💡 {t('colorBalance.tip2')}</p>
            </div>
          </div>
        )}

        {activeToolTab === 'crop' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.crop = el; }}>
            <p className="text-sm text-gray-400">
              {t('crop.description')}
            </p>
            
            <button 
              onClick={() => {
                setCropMode(true);
                setCropRect(null);
              }}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              {cropMode ? `🔄 ${t('crop.redraw')}` : `✂️ ${t('crop.start')}`}
            </button>
            
            <div>
              <label className="text-xs text-gray-400 block mb-2">{t('crop.aspectRatio')}</label>
              <select 
                onChange={(e) => handleAspectRatioChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="free">{t('crop.free')}</option>
                <option value="1:1">1:1 ({t('crop.square')})</option>
                <option value="4:3">4:3 ({t('crop.landscape')})</option>
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="3:2">3:2 (Photo)</option>
                <option value="2:3">2:3 ({t('crop.portrait')})</option>
              </select>
            </div>

            {cropAspectRatio && (
              <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
                🔒 {t('crop.locked')}: {cropAspectRatio.toFixed(2)}:1
              </div>
            )}
            
            {cropMode && (
              <>
                <button 
                  onClick={() => applyCrop()}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                  ✅ {t('crop.apply')}
                </button>

                <button 
                  onClick={() => {
                    setCropMode(false);
                    setCropRect(null);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors">
                  ❌ {t('crop.cancel')}
                </button>
              </>
            )}

            <div className="text-xs text-gray-400 space-y-1 bg-gray-800 p-2 rounded">
              <p>💡 {t('crop.tip1')}</p>
              <p>💡 {t('crop.tip2')}</p>
            </div>
          </div>
        )}

        {activeToolTab === 'transform' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.transform = el; }}>
            <h4 className="text-sm text-gray-300">{t('transform.rotate')}</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => rotateImage(90)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>↻</span>
                <span>90° CW</span>
              </button>
              
              <button 
                onClick={() => rotateImage(270)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>↺</span>
                <span>90° CCW</span>
              </button>
            </div>

            <button 
              onClick={() => rotateImage(180)}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              ↻ {t('transform.rotate180')}
            </button>

            <div className="h-px bg-gray-700" />

            <h4 className="text-sm text-gray-300">{t('transform.flip')}</h4>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => flipImageHorizontal()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                ↔️ {t('transform.flipH')}
              </button>
              
              <button 
                onClick={() => flipImageVertical()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                ↕️ {t('transform.flipV')}
              </button>
            </div>

            <div className="h-px bg-gray-700" />

            <h4 className="text-sm text-gray-300">{t('transform.freeRotate')}</h4>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-400">{t('transform.angle')}</label>
                <span className="text-xs text-gray-400">{freeRotation}°</span>
              </div>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={freeRotation} 
                onChange={(e) => setFreeRotation(Number(e.target.value))}
                className="w-full" 
              />
            </div>

            <div>
              <input
                type="number"
                min="-180"
                max="180"
                value={freeRotation}
                onChange={(e) => setFreeRotation(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                placeholder={t('transform.enterAngle')}
              />
            </div>

            <button 
              onClick={() => {
                if (freeRotation !== 0) {
                  freeRotateImage(freeRotation);
                  setFreeRotation(0);
                }
              }}
              disabled={freeRotation === 0}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
            >
              ✅ {t('transform.apply')}
            </button>

            <div className="text-xs text-gray-400 space-y-1 bg-gray-800 p-2 rounded">
              <p>💡 {t('transform.tip1')}</p>
              <p>💡 {t('transform.tip2')}</p>
            </div>
          </div>
        )}

        {activeToolTab === 'text' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.text = el; }}>
            <button 
              onClick={() => {
                setEditingTextBoxId(null);
                setShowTextEditor(true);
              }}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
              + {t('text.addNew')}
            </button>

            <div>
              <label className="text-xs text-gray-400 block mb-2">{t('text.list')}</label>
              {textBoxes.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4 bg-gray-800 rounded">
                  {t('text.noText')}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {textBoxes.map((box) => (
                    <div key={box.id} className="bg-gray-800 p-2 rounded flex items-center justify-between group">
                      <div className="truncate text-sm text-gray-200 flex-1 mr-2" style={{ fontFamily: box.fontFamily }}>
                        {box.text}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTextBoxId(box.id);
                            setShowTextEditor(true);
                          }}
                          className="p-1 hover:bg-blue-600 rounded text-gray-400 hover:text-white"
                          title={t('text.edit')}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteTextBox(box.id)}
                          className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white"
                          title={t('text.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeToolTab === 'insert' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.insert = el; }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInsertImage}
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{t('insert.upload')}</span>
            </button>

            <div>
              <label className="text-xs text-gray-400 block mb-2">{t('insert.list')}</label>
              {layers.filter(l => l.type === 'image').length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4 bg-gray-800 rounded">
                  {t('insert.noImages')}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {layers.filter(l => l.type === 'image').map((layer) => (
                    <div key={layer.id} className="bg-gray-800 p-2 rounded flex items-center justify-between group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 bg-gray-700 rounded shrink-0 overflow-hidden">
                          <img src={layer.data || ''} alt={layer.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate text-sm text-gray-200">
                          {layer.name}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteLayer(layer.id)}
                          className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400 space-y-1 bg-gray-800 p-2 rounded">
              <p>💡 {t('insert.tip1')}</p>
              <p>💡 {t('insert.tip2')}</p>
            </div>
          </div>
        )}

        {activeToolTab === 'brush' && (
          <div className="space-y-4" ref={(el) => { contentRefs.current.brush = el; }}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('brush.size')}</label>
                <span className="text-xs text-gray-400">{brushSettings.size}px</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={brushSettings.size} 
                onChange={(e) => updateBrushSettings({ size: Number(e.target.value) })}
                className="w-full" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('brush.opacity')}</label>
                <span className="text-xs text-gray-400">{Math.round(brushSettings.opacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={brushSettings.opacity * 100} 
                onChange={(e) => updateBrushSettings({ opacity: Number(e.target.value) / 100 })}
                className="w-full" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">{t('brush.hardness')}</label>
                <span className="text-xs text-gray-400">{brushSettings.hardness}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={brushSettings.hardness} 
                onChange={(e) => updateBrushSettings({ hardness: Number(e.target.value) })}
                className="w-full" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">{t('brush.color')}</label>
              <input
                type="color"
                value={brushSettings.color}
                onChange={(e) => updateBrushSettings({ color: e.target.value })}
                className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
              />
            </div>

            {/* <div>
              <label className="text-xs text-gray-400 block mb-1">Chế độ (Mode)</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => useEditorStore.getState().setTool('brush')}
                  className={`px-2 py-1.5 rounded text-xs ${tool === 'brush' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                  Vẽ (Draw)
                </button>
                <button 
                  onClick={() => useEditorStore.getState().setTool('eraser')}
                  className={`px-2 py-1.5 rounded text-xs ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                  Xóa (Erase)
                </button>
              </div>
            </div> */}
          </div>
        )}

        {activeToolTab === 'advanced' && (
          <div className="space-y-3" ref={(el) => { contentRefs.current.advanced = el; }}>
            <button 
              onClick={() => setShowCurves(true)}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              📈 {t('tools.curves')}
            </button>
            <button 
              onClick={() => setShowLevels(true)}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              📊 {t('tools.levels')}
            </button>
            <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              🎨 {t('tools.colorBalance')}
            </button>
            <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              🌈 {t('advanced.hsl')}
            </button>
            <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              🔍 {t('advanced.clone')}
            </button>
            <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              💧 {t('advanced.liquify')}
            </button>
            <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              📐 {t('advanced.perspective')}
            </button>
            <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors text-left">
              🔊 {t('advanced.noise')}
            </button>
          </div>
        )}
      </div>

      {/* Advanced tool modals */}
      {showCurves && (
        <CurvesEditor
          onClose={() => setShowCurves(false)}
          onApply={handleCurvesApply}
        />
      )}
      {showLevels && (
        <LevelsEditor
          onClose={() => setShowLevels(false)}
          onApply={handleLevelsApply}
        />
      )}
      {showTextEditor && (
        <TextEditor
          onClose={() => {
            setShowTextEditor(false);
            setEditingTextBoxId(null);
          }}
          onApply={handleTextApply}
          initialData={editingTextBoxId ? {
            ...textBoxes.find(t => t.id === editingTextBoxId)!,
            fontStyle: textBoxes.find(t => t.id === editingTextBoxId)?.fontStyle || 'normal',
            fontWeight: textBoxes.find(t => t.id === editingTextBoxId)?.fontWeight || 'normal',
            textAlign: textBoxes.find(t => t.id === editingTextBoxId)?.textAlign || 'left',
          } : undefined}
          initialX={image ? image.width / 2 : 100}
          initialY={image ? image.height / 2 : 100}
        />
      )}
    </>
  );
}