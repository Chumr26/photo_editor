import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, Image, GripVertical } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useTranslation } from '../../hooks/useTranslation';

export function LayersSection() {
  const { t } = useTranslation();
  const { layers, selectedLayerId, selectLayer, updateLayer, deleteLayer, addLayer, reorderLayers } =
    useEditorStore();
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const selectedLayerRef = useRef<HTMLDivElement | null>(null);

  // Scroll selected layer into view when selection changes
  useEffect(() => {
    if (selectedLayerRef.current) {
      selectedLayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedLayerId]);

  const handleAddLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `${t('layers.layer')} ${layers.length + 1}`,
      type: 'image' as const,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      data: undefined,
    };
    addLayer(newLayer);
  };

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    if (draggedLayerId && draggedLayerId !== layerId) {
      setDropTargetId(layerId);
    }
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    
    if (!draggedLayerId || draggedLayerId === targetLayerId) {
      setDraggedLayerId(null);
      setDropTargetId(null);
      return;
    }

    const draggedIndex = layers.findIndex(l => l.id === draggedLayerId);
    const targetIndex = layers.findIndex(l => l.id === targetLayerId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newLayers = [...layers];
    const [removed] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, removed);

    reorderLayers(newLayers);
    setDraggedLayerId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedLayerId(null);
    setDropTargetId(null);
  };

  return (
    <div className="space-y-4">
      {/* Add layer button */}
      <button
        onClick={handleAddLayer}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>{t('layers.add')}</span>
      </button>

      {/* Layer controls */}
      {layers.length > 0 && (
        <>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {t('layers.opacity')}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={
                  layers.find((l) => l.id === selectedLayerId)?.opacity || 100
                }
                onChange={(e) => {
                  if (selectedLayerId) {
                    updateLayer(selectedLayerId, {
                      opacity: Number(e.target.value),
                    });
                  }
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {t('layers.blendMode')}
              </label>
              <select
                value={
                  layers.find((l) => l.id === selectedLayerId)?.blendMode ||
                  'normal'
                }
                onChange={(e) => {
                  if (selectedLayerId) {
                    updateLayer(selectedLayerId, { blendMode: e.target.value });
                  }
                }}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="hard-light">Hard Light</option>
                <option value="soft-light">Soft Light</option>
                <option value="difference">Difference</option>
                <option value="exclusion">Exclusion</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-700" />
        </>
      )}

      {/* Layer list */}
      <div className="space-y-1">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{t('layers.noLayers')}</p>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 mb-2 px-2">
              💡 {t('layers.dragTip')}
            </div>
            {layers.map((layer) => (
              <div
                key={layer.id}
                draggable={!layer.locked}
                onDragStart={(e) => handleDragStart(e, layer.id)}
                onDragOver={(e) => handleDragOver(e, layer.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, layer.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-all
                  ${
                    selectedLayerId === layer.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                  ${draggedLayerId === layer.id ? 'opacity-50' : ''}
                  ${dropTargetId === layer.id ? 'border-2 border-blue-500' : ''}
                `}
                onClick={() => selectLayer(layer.id)}
                ref={selectedLayerId === layer.id ? selectedLayerRef : null}
              >
                {/* Drag handle */}
                {!layer.locked && (
                  <GripVertical className="w-4 h-4 opacity-50 cursor-grab active:cursor-grabbing shrink-0" />
                )}

                {/* Thumbnail */}
                <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center shrink-0">
                  {layer.data ? (
                    <img src={layer.data} alt={layer.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <Image className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {/* Layer name */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-sm truncate"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="text-xs opacity-70">
                    {layer.type === 'image' && t('properties.type.image')}
                    {layer.type === 'adjustment' && t('properties.type.adjustment')}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { visible: !layer.visible });
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                    title={t('layers.visibility')}
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { locked: !layer.locked });
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                    title={t('layers.lock')}
                  >
                    {layer.locked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('layers.deleteConfirm'))) {
                        deleteLayer(layer.id);
                      }
                    }}
                    className="p-1 hover:bg-red-600 rounded"
                    title={t('layers.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Layer operations */}
      {layers.length > 0 && (
        <>
          <div className="h-px bg-gray-700" />
          <div className="grid grid-cols-2 gap-2">
            <button className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors">
              {t('layers.group')}
            </button>
            <button className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors">
              {t('layers.merge')}
            </button>
            <button className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors">
              {t('layers.createMask')}
            </button>
            <button className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors">
              {t('layers.rasterize')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}