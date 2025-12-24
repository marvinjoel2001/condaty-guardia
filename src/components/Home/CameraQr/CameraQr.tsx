import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { View, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  Camera,
  CodeScanner,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import AnimationQr from './AnimationQr';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import useAuth from '../../../../mk/hooks/useAuth';

interface CameraQrProps {
  open: boolean;
  onClose: () => void;
  setCode?: (data: any) => void;
  onMsg?: (title: string, msg: string, type: string) => void;
}

const CameraQr = ({ open, onClose, setCode, onMsg }: CameraQrProps) => {
  const { height } = Dimensions.get('window');
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { showToast } = useAuth();

  const [codeQr, setCodeQr] = useState('');
  const [permissionRequested, setPermissionRequested] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const isActiveRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = isFocused && open && hasPermission && !!device;

  // Solicita permisos una sola vez
  useEffect(() => {
    if (!hasPermission && !permissionRequested) {
      setPermissionRequested(true);
      requestPermission().catch(err => {
        console.error('Error requesting camera permission:', err);
        onMsg?.(
          'Camera Permission Required',
          'Please enable camera access in your device settings to scan QR codes.',
          'error',
        );
      });
    }
  }, [hasPermission, permissionRequested, requestPermission, onMsg]);

  // Limpia timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleValidQr = useCallback(
    async (data: string[]) => {
      await setCode?.(data);
      onClose();
    },
    [setCode, onClose],
  );

  const handleInvalidQr = useCallback(() => {
    showToast('QR inválido', 'error');
    onClose();
  }, [showToast, onClose]);

  const processCode = useCallback(
    async (_codes: any[]) => {
      if (!isActiveRef.current) return;
      isActiveRef.current = false;

      const rawValue = _codes?.[0]?.value ?? '';
      const data = (rawValue + '||').split('|');

      if (data[0] === 'condaty' && data[1] === 'qr') {
        const time = Number(data[3].slice(-10));
        if (time > 2024 + 10 + 27 + 9 + 27) {
          data[3] = data[3].slice(0, -10);
        }
        await handleValidQr(data);
      } else {
        handleInvalidQr();
      }
    },
    [handleValidQr, handleInvalidQr],
  );

  const onCodeScanned = useCallback(
    (codes: any[]) => {
      const value = codes?.[0]?.value;
      if (!value || value === codeQr) return;

      setCodeQr(value);
      timeoutRef.current = setTimeout(() => setCodeQr(''), 8000);
      processCode(codes);
    },
    [codeQr, processCode],
  );

  const codeScanner: CodeScanner = useMemo(
    () => ({
      codeTypes: ['qr'],
      onCodeScanned,
    }),
    [onCodeScanned],
  );

  // Controla activación de cámara con ref, sin causar renders
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  if (!device) {
    console.warn('No se encontró el dispositivo de cámara');
    return null;
  }

  return (
    <ModalFull
      open={open && device && hasPermission}
      onClose={onClose}
      scrollViewHide={true}
      title="Lector Qr"
    >
      <View style={{ height: height - 100, marginTop: 8 }}>
        <Camera
          ref={cameraRef}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 1,
          }}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
          enableZoomGesture
          photo={false}
          video={false}
        />
        <AnimationQr />
      </View>
    </ModalFull>
  );
};

export default React.memo(CameraQr);
