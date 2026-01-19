import React, {createContext, useContext, useEffect, useState} from 'react';
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: NetInfoStateType | null;
  isConnecting: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: null,
  isInternetReachable: null,
  type: null,
  isConnecting: true,
});

export const NetworkProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [networkState, setNetworkState] = useState<NetworkContextType>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
    isConnecting: true,
  });

  useEffect(() => {
    // Suscripción al cambio de red
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable ?? false;

      setNetworkState({
        isConnected,
        isInternetReachable,
        type: state.type,
        isConnecting: false,
      });

      // === LÓGICA PERSONALIZADA ===
      if (!isInternetReachable) {
        console.warn('📶 Conexión perdida');
        // Puedes disparar notificaciones locales aquí
      } else if (isInternetReachable && !networkState.isInternetReachable) {
        console.log('✅ Conexión restaurada');
        // Reintentar peticiones fallidas, sincronizar datos, etc.
      }
    });

    // Obtener estado inicial
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isConnecting: false,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
};

// Hook personalizado
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork debe usarse dentro de NetworkProvider');
  }
  return context;
};
