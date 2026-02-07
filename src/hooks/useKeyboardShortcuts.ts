import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;

interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  handler: ShortcutHandler;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const metaOrCtrl = shortcut.metaKey || shortcut.ctrlKey;
      const isMetaPressed = event.metaKey || event.ctrlKey;
      
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (!metaOrCtrl || isMetaPressed) &&
        (!shortcut.shiftKey || event.shiftKey)
      ) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useCommandPalette(onOpen: () => void) {
  useKeyboardShortcuts([
    { key: 'k', metaKey: true, handler: onOpen }
  ]);
}
