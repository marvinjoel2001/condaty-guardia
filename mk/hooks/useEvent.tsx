// hooks/useEvent.ts
import {useCallback} from 'react';
import EventEmitter from 'eventemitter3';
import {useFocusEffect} from '@react-navigation/native';

// Creamos un EventEmitter global
const emitter = new EventEmitter();

export const useEvent = <T = void,>(
  eventName: string,
  callback?: (payload: T) => void,
) => {
  useFocusEffect(
    useCallback(() => {
      if (!callback) return;
      const listener = (payload: T) => {
        callback(payload);
      };
      emitter.on(eventName, listener);
      return () => {
        emitter.off(eventName, listener);
      };
    }, [eventName, callback]),
  );

  // useEffect(() => {
  //   if (!callback) return;

  //   const listener = (payload: T) => {
  //     callback(payload);
  //   };

  //   emitter.on(eventName, listener);
  //   return () => {
  //     emitter.off(eventName, listener);
  //   };
  // }, [eventName, callback]);

  const dispatch = useCallback(
    (payload: T) => {
      emitter.emit(eventName, payload);
    },
    [eventName],
  );

  return {dispatch};
};
