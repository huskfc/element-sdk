/**
 * @defai/element-react
 * React components and hooks for DEFAI elements
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Re-export types from SDK
export type { 
  ElementContext, 
  ElementState, 
  ElementAPI,
  ElementMetadata,
  ElementPermissions
} from '@defai/element-sdk';

/**
 * Hook for element state management
 */
export function useElementState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  
  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  return [state, updateState] as const;
}

/**
 * Hook for element events
 */
export function useElementEvents() {
  const handlersRef = useRef<Map<string, Set<Function>>>(new Map());
  
  const emit = useCallback((event: string, data: any) => {
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }, []);
  
  const on = useCallback((event: string, handler: Function) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }, []);
  
  return { emit, on };
}

/**
 * Hook for element size with ResizeObserver support
 */
export function useElementSize() {
  const [size, setSize] = useState({ width: 400, height: 600 });
  const observerRef = useRef<ResizeObserver | null>(null);
  
  useEffect(() => {
    const container = document.getElementById('element-root');
    
    const handleResize = () => {
      if (container) {
        setSize({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    
    // Initial size
    handleResize();
    
    // Try to use ResizeObserver for container-only resizes
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      observer = new ResizeObserver(handleResize);
      observer.observe(container);
      observerRef.current = observer;
    }
    
    // Fallback: window resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (observer) {
        observer.disconnect();
        observerRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return size;
}

/**
 * Hook for element theme with legacy MediaQueryList support
 */
export function useElementTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setTheme(matches ? 'dark' : 'light');
    };
    
    // Use modern API when available, fall back to legacy
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler as EventListener);
      return () => mediaQuery.removeEventListener('change', handler as EventListener);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);
  
  return theme;
}
