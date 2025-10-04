import React, {useEffect, useRef, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  Camera,
  CodeScanner,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import AnimationQr from './AnimationQr';
import {Dimensions, View} from 'react-native';
import useAuth from '../../../../mk/hooks/useAuth';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';

interface CameraQrProps {
  open: boolean;
  onClose: () => void;
  setCode?: any;
  onMsg?: any;
}
const CameraQr = ({open, onClose, setCode, onMsg}: CameraQrProps) => {
  const isFocused = useIsFocused();
  useAuth();
  const screen = Dimensions.get('window');
  const camera = useRef<Camera>(null);
  let isActive = isFocused && open;
  const {hasPermission, requestPermission} = useCameraPermission();
  const [codeQr, setCodeQr]: any = useState('');
  const device: any = useCameraDevice('back');
  const [isPermissionRequested, setIsPermissionRequested] = useState(false);
  const {showToast} = useAuth();

  useEffect(() => {
    const checkPermission = async () => {
      if (!hasPermission && !isPermissionRequested) {
        setIsPermissionRequested(true);
        try {
          await requestPermission();
        } catch (error) {
          console.error('Error requesting camera permission:', error);
          onMsg &&
            onMsg(
              'Camera Permission Required',
              'Please enable camera access in your device settings to scan QR codes.',
              'error',
            );
        }
      }
    };

    checkPermission();
  }, [hasPermission, requestPermission, isPermissionRequested]);

  const codeLoaded = async (_codes: any) => {
    if (isActive == false) return;
    isActive = false;

    const codes = _codes[0].value;
    const data = (codes + '||').split('|');
    if (data[0] === 'condaty' && data[1] === 'qr') {
      const time: any = data[3].substring(data[3].length - 10);

      if (time * 1 > 2024 + 10 + 27 + 9 + 27) {
        // if (isValidTimeTemp(time) == false) {
        //   isActive = true;
        //   console.log('expiradop');
        //   onMsg(
        //     'Afiliado no identificado',
        //     'Revisa que el afiliado tenga el QR actualizado.',
        //     'I',
        //   );

        //   data[3] = '';
        //   setId(null);
        // }
        data[3] = data[3].slice(0, -10);
      }
      console.log('codes03', data[3]);
      await setCode(data);
      onClose();
    } else {
      isActive = true;
      console.log('Codigo no Reconocido!!!', 'error');
      showToast('QR inválido', 'error');

      // onMsg(
      //   '¡QR no válido!',
      //   'Asegúrate de que el afiliado tenga el QR correcto de Elekta.',
      //   'Q',
      // );

      onClose();
    }
  };

  const codeScanner: CodeScanner = {
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codeQr != codes[0].value) {
        setCodeQr(codes[0].value);
        setTimeout(() => {
          setCodeQr('');
        }, 10000);

        codeLoaded(codes);
      }
    },
  };

  if (!device) {
    console.log('No se encontró el dispositivo de cámara');
    return null;
  }
  return (
    <ModalFull
      open={open && device && hasPermission}
      onClose={onClose}
      title={'Lector Qr'}>
      <View style={{height: screen.height - 100}}>
        <Camera
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 1,
            flex: 1,
          }}
          device={device}
          isActive={open}
          codeScanner={codeScanner}
          ref={camera}
          enableZoomGesture
          photo={false}
          video={false}
        />
        <AnimationQr />
      </View>
    </ModalFull>
  );
};

export default CameraQr;
