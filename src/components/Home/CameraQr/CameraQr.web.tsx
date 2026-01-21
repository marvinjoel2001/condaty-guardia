// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import jsQR from 'jsqr';
import Button from '../../../../mk/components/forms/Button/Button';
import { cssVar } from '../../../../mk/styles/themes';

interface CameraQrProps {
  open: boolean;
  onClose: () => void;
  setCode?: (data: any) => void;
  onMsg?: (title: string, msg: string, type: string) => void;
}

const CameraQr = ({ open, onClose, setCode, onMsg }: CameraQrProps) => {
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const fileInputRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const requestRef = useRef<any>();
  const streamRef = useRef<any>(null);
  const lastScanRef = useRef<number>(0); // Cooldown para evitar lecturas múltiples rápidas

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const handleCodeFound = useCallback(
    (code: string) => {
      const now = Date.now();
      // Evitar lecturas repetidas muy seguidas (3 segundos de cooldown si hay error)
      if (now - lastScanRef.current < 3000) return;
      lastScanRef.current = now;

      const data = (code + '||').split('|');
      if (data[0] === 'condaty' && data[1] === 'qr') {
        stopCamera(); // Detener cámara solo si es válido
        const time = Number(data[3].slice(-10));
        if (time > 2024 + 10 + 27 + 9 + 27) {
          data[3] = data[3].slice(0, -10);
        }
        if (setCode) setCode(data);
        onClose();
      } else {
        // Si es inválido, mostramos error pero NO cerramos el modal
        if (onMsg) onMsg('QR Inválido', 'El código QR no es válido', 'error');
        // @ts-ignore
        else window.alert('QR Inválido');
        
        // No llamamos a onClose() para permitir reintentar
      }
    },
    [setCode, onClose, onMsg, stopCamera],
  );

  const tick = useCallback(() => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      setLoading(false);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            handleCodeFound(code.data);
            // No detenemos el loop aquí inmediatamente, handleCodeFound decide si cerrar o seguir
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [handleCodeFound]);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setPermissionError(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera API not available. Check HTTPS or device capabilities.',
        );
      }

      // @ts-ignore
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((e: any) => console.error('Error playing video:', e));
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setPermissionError(true);
      setLoading(false);

      let msg = 'No se pudo acceder a la cámara.';
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        msg =
          'Permiso de cámara denegado. Por favor, habilítelo en la configuración del navegador.';
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        msg = 'No se encontró ninguna cámara en este dispositivo.';
      } else if (
        err.name === 'NotReadableError' ||
        err.name === 'TrackStartError'
      ) {
        msg = 'La cámara está siendo usada por otra aplicación.';
      } else if (err.message.includes('HTTPS')) {
        msg = 'El acceso a la cámara requiere una conexión segura (HTTPS).';
      }

      if (onMsg) onMsg('Error de Cámara', msg, 'error');
    }
  }, [tick, onMsg]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        // @ts-ignore
        const img = new window.Image();
        img.onload = () => {
          // @ts-ignore
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height,
            );
            if (code) {
              handleCodeFound(code.data);
            } else {
              if (onMsg)
                onMsg(
                  'Error',
                  'No se encontró un código QR en la imagen.',
                  'error',
                );
              // @ts-ignore
              else window.alert('No se encontró un código QR en la imagen.');
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!open) return null;

  return (
    <ModalFull
      open={open}
      onClose={onClose}
      scrollViewHide={true}
      title="Lector Qr"
    >
      <View style={styles.container}>
        {permissionError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              No se pudo acceder a la cámara.
            </Text>
            <Text style={styles.errorSubText}>
              Por favor, verifique los permisos en el navegador o use la opción
              de subir imagen.
              {'\n'}
              Asegúrese de estar usando HTTPS.
            </Text>
            <View style={{ marginTop: 20 }}>
              <Button onPress={startCamera}>Intentar de nuevo</Button>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {/* We use a React Native View to wrap the HTML elements */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <video
                ref={videoRef}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Overlay Visual para Escaneo QR */}
              {!loading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 10
                }}>
                  {/* Parte Superior Oscura */}
                  <div style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)'}} />
                  
                  {/* Parte Central con Ventana */}
                  <div style={{display: 'flex', height: '280px', width: '100%'}}>
                    <div style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)'}} />
                    
                    {/* Cuadro de Enfoque */}
                    <div style={{
                      width: '280px',
                      height: '280px',
                      border: '2px solid rgba(255,255,255,0.8)',
                      borderRadius: '16px',
                      position: 'relative',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)', // Alternativa para oscurecer todo alrededor
                      backgroundColor: 'transparent'
                    }}>
                      {/* Esquinas para darle estilo de scanner */}
                      <div style={{position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTop: '4px solid #00E096', borderLeft: '4px solid #00E096', borderTopLeftRadius: 16}} />
                      <div style={{position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTop: '4px solid #00E096', borderRight: '4px solid #00E096', borderTopRightRadius: 16}} />
                      <div style={{position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottom: '4px solid #00E096', borderLeft: '4px solid #00E096', borderBottomLeftRadius: 16}} />
                      <div style={{position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottom: '4px solid #00E096', borderRight: '4px solid #00E096', borderBottomRightRadius: 16}} />
                      
                      {/* Línea de escaneo animada (opcional, simple css animation could be added here) */}
                    </div>
                    
                    <div style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)'}} />
                  </div>
                  
                  {/* Parte Inferior Oscura */}
                  <div style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', paddingTop: '20px'}}>
                    <span style={{color: 'white', fontFamily: 'sans-serif', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px'}}>
                      Centra el código QR en el cuadro
                    </span>
                  </div>
                </div>
              )}

              {loading && (
                <Text
                  style={{
                    position: 'absolute',
                    zIndex: 20,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: 10,
                    borderRadius: 8
                  }}
                >
                  Iniciando cámara...
                </Text>
              )}
            </div>
          </View>
        )}

        <View style={styles.controls}>
          <Text style={styles.orText}>O sube una imagen con el código QR</Text>
          <Button onPress={() => fileInputRef.current?.click()}>
            Subir Imagen
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileUpload}
          />
        </View>
      </View>
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  controls: {
    padding: 20,
    backgroundColor: cssVar.cBlack,
    alignItems: 'center',
  },
  orText: {
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular', // Assuming font exists
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: cssVar.cError,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default CameraQr;
