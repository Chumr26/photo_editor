import { Clock, GitBranch, Save, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export function HistorySection() {
  const { history, historyIndex, saveSnapshot, goToSnapshot } = useEditorStore();
  const { t, language } = useTranslation();
  const currentSnapshotRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll current snapshot into view when historyIndex changes
  useEffect(() => {
    if (currentSnapshotRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = currentSnapshotRef.current;

      // Calculate relative position to scroll only the container, not the whole page
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.offsetHeight;

      // Only scroll if out of view within the container
      if (elementTop < containerTop) {
        container.scrollTop = elementTop;
      } else if (elementBottom > containerBottom) {
        container.scrollTop = elementBottom - container.offsetHeight;
      }
    }
  }, [historyIndex]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return t('history.justNow');
    if (diffMins < 60) return t('history.minutesAgo').replace('{n}', String(diffMins));
    if (diffHours < 24) return t('history.hoursAgo').replace('{n}', String(diffHours));
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN');
  };

  return (
    <div className="space-y-4">
      {/* Create snapshot */}
      <button
        onClick={() => saveSnapshot()}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>{t('history.saveSnapshot')}</span>
      </button>

      {/* History timeline */}
      <div 
        ref={containerRef}
        className="space-y-2 max-h-60 overflow-y-auto relative pr-1 custom-scrollbar"
      >
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{t('history.noHistory')}</p>
            <p className="text-xs mt-2">
              {t('history.startEditing')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {history.map((snapshot, index) => {
              const isCurrent = index === historyIndex;
              const hasBranch = snapshot.children.length > 0;

              return (
                <div
                  key={snapshot.id}
                  ref={isCurrent ? currentSnapshotRef : null}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 rounded cursor-pointer
                    ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                  onClick={() => goToSnapshot(snapshot.id)}
                >
                  {/* Timeline connector */}
                  {index > 0 && (
                    <div className="absolute left-3 -top-1 w-0.5 h-2 bg-gray-600" />
                  )}

                  {/* Icon */}
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center shrink-0">
                    {hasBranch ? (
                      <GitBranch className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">
                      {snapshot.name}
                    </div>
                    {snapshot.details && (
                      <div className={`text-xs truncate ${isCurrent ? 'text-blue-100' : 'text-gray-400'}`} title={snapshot.details}>
                        {snapshot.details}
                      </div>
                    )}
                    <div className="text-xs opacity-70">
                      {formatTime(snapshot.timestamp)}
                    </div>
                  </div>

                  {/* Current indicator */}
                  {isCurrent && (
                    <div className="w-2 h-2 bg-white rounded-full shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History info */}
      {history.length > 0 && (
        <>
          <div className="h-px bg-gray-700" />
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>{t('history.totalSnapshots')}:</span>
              <span>{history.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('history.currentPosition')}:</span>
              <span>{historyIndex + 1}/{history.length}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>💡 {t('history.tip')}</p>
          </div>
        </>
      )}
    </div>
  );
}