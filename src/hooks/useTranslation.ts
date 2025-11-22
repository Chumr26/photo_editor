import { useEditorStore } from '../store/editorStore';
import { getTranslation, type Language } from '../utils/translations';

/**
 * Custom hook to get translation function that responds to language changes
 * Automatically re-renders component when language setting changes
 */
export function useTranslation() {
  const language = useEditorStore((state) => state.settings.language);

  /**
   * Translate a key to the appropriate language
   * @param key - Translation key
   * @returns Translated string based on current language setting
   */
  const t = (key: string): string => {
    return getTranslation(key, language as Language);
  };

  return { t, language };
}
