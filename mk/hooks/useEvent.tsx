// hooks/useEvent.ts
import {useEffect, useCallback} from 'react';
import EventEmitter from 'eventemitter3';

// Creamos un EventEmitter global
const emitter = new EventEmitter();

export const useEvent = <T = void,>(
  eventName: string,
  callback?: (payload: T) => void,
) => {
  useEffect(() => {
    if (!callback) return;

    // Tipado correcto para el callback
    const listener = (payload: T) => {
      callback(payload);
    };

    emitter.on(eventName, listener);
    return () => {
      emitter.off(eventName, listener);
    };
  }, [eventName, callback]);

  const dispatch = useCallback(
    (payload: T) => {
      emitter.emit(eventName, payload);
    },
    [eventName],
  );

  return {dispatch};
};
