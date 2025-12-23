import React, { useCallback, useMemo } from 'react';

/**
 * Utility functions for component memoization and performance optimization
 */

/**
 * Creates a stable callback that doesn't change on every render
 * Useful for event handlers passed to memoized components
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = [],
): T {
  return useCallback(callback, deps);
}

/**
 * Creates a stable value that doesn't change on every render
 * Useful for objects or arrays passed as props to memoized components
 */
export function useStableValue<T>(
  value: T,
  deps: React.DependencyList = [],
): T {
  return useMemo(() => value, deps);
}

/**
 * Creates a stable object with merged properties
 * Useful for combining multiple objects into a single stable reference
 */
export function useStableObject<T extends Record<string, any>>(
  objects: Partial<T>[],
  deps: React.DependencyList = [],
): T {
  return useMemo(() => Object.assign({}, ...objects), deps);
}

/**
 * Creates a stable array from multiple arrays
 * Useful for combining arrays into a single stable reference
 */
export function useStableArray<T>(
  arrays: T[][],
  deps: React.DependencyList = [],
): T[] {
  return useMemo(() => arrays.flat(), deps);
}

/**
 * Memoizes a component with shallow comparison
 * Use this for components that should only re-render when props change
 */
export function memoComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean,
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, propsAreEqual);
}

/**
 * Custom comparison function for React.memo
 * Performs shallow comparison of props
 */
export function shallowEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
): boolean {
  const keys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (keys.length !== nextKeys.length) {
    return false;
  }

  for (const key of keys) {
    if (!(key in nextProps) || prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a memoized event handler that includes the event in dependencies
 * Useful for form inputs and interactive components
 */
export function useEventCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = [],
): T {
  const ref = React.useRef<T>(callback);

  React.useLayoutEffect(() => {
    ref.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, deps) as T;
}

/**
 * Memoizes expensive computations with automatic dependency detection
 * Use for complex calculations that depend on multiple values
 */
export function useComputedValue<T>(
  computeFn: () => T,
  deps: React.DependencyList,
): T {
  return useMemo(computeFn, deps);
}
