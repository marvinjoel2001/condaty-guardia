// mk/components/forms/UploadFile.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { storage } from '../../services/storage';
import { uriToBlob } from '../../utils/file';
import configApp from '../../../src/config/config';
import useApi from '../../hooks/useApi';
import Icon from '../../components/ui/Icon/Icon';
import {
  IconGallery,
  IconX,
  IconDoc2 as IconFile,
  IconCamera,
} from '../../../src/icons/IconLibrary';
import { cssVar, FONTS } from '../../styles/themes';
import ImageExpandableModal from '../../components/ui/ImageExpandableModal/ImageExpandableModal';
import ImageResizer from '@bam.tech/react-native-image-resizer';

interface Props {
  setFormState: (updater: any) => void;
  formState: any;
  name: string;
  label?: string;
  type?: 'I' | 'D' | 'A';
  cant?: number;
  required?: boolean;
  ext?: string;
  prefix?: string;
  global?: boolean;
  clientId?: string;
  style?: any;
  variant?: 'V1' | 'V2';
  onUploadStateChange?: (isUploading: boolean) => void;
}
const quality = 0.7;

const UploadFile: React.FC<Props> = ({
  setFormState,
  formState,
  name,
  label = 'Subir archivo',
  type = 'I',
  cant = 1,
  required = false,
  ext,
  prefix = '',
  global = false,
  clientId,
  style,
  variant = 'V1',
  onUploadStateChange,
}) => {
  const { setWaiting } = useApi();
  const { width: screenWidth } = useWindowDimensions();
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');

  const currentValues = Array.isArray(formState[name])
    ? formState[name]
    : formState[name]
    ? [formState[name]]
    : [];
  const isSingle = cant === 1;

  // Determinar extensiones permitidas según el tipo
  let defaultExts = '';
  if (type === 'I') {
    defaultExts = 'jpg,jpeg,png,webp';
  } else if (type === 'D') {
    defaultExts = 'pdf,doc,docx,xls,xlsx,csv,txt';
  } else if (type === 'A') {
    defaultExts = '*'; // Acepta todo
  }
  const allowedExts = ext
    ? ext
        .toLowerCase()
        .split(',')
        .map(e => e.trim().replace('.', ''))
    : defaultExts === '*'
    ? ['*']
    : defaultExts.split(',').map(e => e.trim().replace('.', ''));
  const folder = global ? 'global' : clientId || 'unknown';
  const pref = prefix ? `${prefix}/` : '';
  const getPath = useCallback(
    (filename: string) => {
      const clean = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      return `${folder}/${pref}${Date.now()}_${clean}`;
    },
    [folder, pref],
  );
  const pickFile = useCallback(() => {
    if (currentValues.length >= cant) {
      Alert.alert('Límite alcanzado', `Máximo ${cant} archivo(s)`);
      return;
    }
    if (type === 'I') {
      Alert.alert('Seleccionar imagen', '', [
        { text: 'Cámara', onPress: openCamera },
        { text: 'Galería', onPress: openGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else if (type === 'A') {
      Alert.alert('Seleccionar archivo', '', [
        { text: 'Cámara', onPress: openCamera },
        { text: 'Galería', onPress: openGallery },
        { text: 'Documento', onPress: pickDocument },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else {
      pickDocument();
    }
  }, [currentValues.length, cant, type]);
  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const p = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (p !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    launchCamera({ mediaType: 'photo', quality }, handleResponse);
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: type === 'I' || type === 'A' ? 'photo' : 'mixed',
        selectionLimit: cant - currentValues.length,
        quality, // ← Añadido para comprimir un poco desde el picker
      },
      handleResponse,
    );
  };
  const pickDocument = async () => {
    try {
      const [asset] = await pick();
      if (asset) {
        handleResponse({
          assets: [{ uri: asset.uri, fileName: asset.name || 'documento' }],
        });
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        return;
      }
      console.error(err);
    }
  };
  const handleResponse = async (response: any) => {
    if (response.didCancel || !response.assets) return;
    setUploading(true);
    onUploadStateChange?.(true);
    setWaiting(1, 'upload-files');
    const newValues = [...currentValues];
    for (const asset of response.assets) {
      let filename = asset.fileName || `file_${Date.now()}`;
      let fileExt = filename.split('.').pop()?.toLowerCase();

      // Validación de extensión
      if (
        !allowedExts.includes('*') &&
        (!fileExt || !allowedExts.includes(fileExt))
      ) {
        Alert.alert('Error', `Formato no permitido: .${fileExt}`);
        continue;
      }

      let uploadUri = asset.uri;
      let uploadType = asset.type || 'image/jpeg';
      let uploadName = filename;

      // Detectar si es imagen
      const imageExts = [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'bmp',
        'heic',
        'heif',
      ];
      const isImageAsset =
        asset.type?.startsWith('image/') ||
        (fileExt && imageExts.includes(fileExt));

      let originalSize = 0;

      if (isImageAsset) {
        // Tamaño original (para log)
        try {
          const originalBlob = await uriToBlob(asset.uri);
          originalSize = originalBlob.size;
          console.log(
            `📏 Tamaño ORIGINAL de "${filename}": ${(
              originalSize / 1024
            ).toFixed(2)} KB`,
          );
        } catch (err) {
          console.warn('No se pudo obtener tamaño original', err);
        }

        // Compresión y redimensión
        try {
          const format = Platform.OS === 'android' ? 'WEBP' : 'JPEG';
          const resized = await ImageResizer.createResizedImage(
            asset.uri,
            1200, // ancho máximo
            1200, // alto máximo
            format,
            quality * 100, // calidad (0-100)
            0, // rotación
            undefined, // carpeta de salida (cache temporal)
            false, // mantener metadata
            {
              mode: 'contain',
              onlyScaleDown: true,
            },
          );

          uploadUri = resized.uri;
          uploadType = format === 'WEBP' ? 'image/webp' : 'image/jpeg';
          uploadName =
            resized.name || `resized_${Date.now()}.${format.toLowerCase()}`;

          console.log(
            `📏 Tamaño COMPRIMIDO de "${filename}": ${(
              resized.size / 1024
            ).toFixed(2)} KB`,
          );

          if (originalSize > 0) {
            const reduction = (
              ((originalSize - resized.size) / originalSize) *
              100
            ).toFixed(2);
            console.log(`📉 Reducción: ${reduction}%`);
          }
        } catch (err) {
          console.warn('Fallo al comprimir imagen, se usa original', err);
          // Si falla la compresión, seguimos con la original
        }
      }

      const path = getPath(uploadName);

      try {
        const fileToUpload =
          (configApp as any).storageStrategy === 'cloudinary'
            ? {
                uri: uploadUri,
                type: uploadType,
                name: uploadName,
              }
            : await uriToBlob(uploadUri);

        const uploaded = await storage.upload(fileToUpload, path);
        newValues.push(uploaded.url);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo subir el archivo');
      }
    }
    setFormState((prev: any) => ({
      ...prev,
      [name]: isSingle ? [newValues[0] || ''] : newValues,
    }));
    setUploading(false);
    onUploadStateChange?.(false);
    setWaiting(-1, 'upload-files');
  };
  const remove = (fullUrl: string) => {
    if (!fullUrl || typeof fullUrl !== 'string') return;
    let path = fullUrl;

    if (fullUrl.includes('cloudinary.com')) {
      const match = fullUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (match && match[1]) {
        path = match[1];
      }
    } else {
      try {
        const urlObj = new URL(fullUrl);
        path = decodeURIComponent(urlObj.pathname.slice(1));
      } catch {
        if (fullUrl.includes('/')) {
          const parts = fullUrl.split('/');
          path = parts.slice(3).join('/');
        }
      }
    }

    storage.delete({ path, url: fullUrl, name: '' }).catch(() => {});

    const filtered = currentValues.filter((url: string) => url !== fullUrl);
    setFormState((prev: any) => ({
      ...prev,
      [name]: isSingle ? '' : filtered,
    }));
  };

  const openImageModal = (fullUrl: string) => {
    setSelectedImageUri(fullUrl);
    setModalVisible(true);
  };

  // MODO SINGLE
  if (isSingle) {
    const singleValue = Array.isArray(formState[name])
      ? formState[name][0]
      : formState[name];
    const imageUrl = singleValue
      ? typeof singleValue === 'string' && singleValue.startsWith('http')
        ? singleValue
        : storage.url(singleValue as string)
      : '';
    const containerStyle =
      variant === 'V2' ? styles.containerV2 : styles.containerV1;
    const labelStyle = variant === 'V2' ? styles.labelV2 : styles.labelV1;

    return (
      <>
        <View style={{ ...containerStyle, ...style }}>
          {singleValue ? (
            <>
              <TouchableOpacity
                onPress={() => remove(singleValue as string)}
                activeOpacity={0.9}
                style={{
                  position: 'absolute',
                  zIndex: 2,
                  right: 4,
                  top: 2,
                  backgroundColor: cssVar.cBlackV1,
                  padding: 4,
                  borderRadius: 8,
                }}
              >
                <Icon name={IconX} color={cssVar.cWhiteV1} size={16} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => openImageModal(singleValue as string)}
                style={{ width: '100%', height: '100%' }}
                disabled={uploading}
              >
                <Image
                  source={{ uri: imageUrl }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                />
              </TouchableOpacity>

              {uploading && (
                <View style={StyleSheet.absoluteFillObject}>
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      Subiendo...
                    </Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity
              onPress={pickFile}
              disabled={uploading}
              style={{ alignItems: 'center' }}
            >
              {variant === 'V2' ? (
                <Icon
                  name={IconCamera}
                  fillStroke={cssVar.cAccent}
                  color={'transparent'}
                />
              ) : (
                <Icon
                  name={IconGallery}
                  fillStroke={cssVar.cWhite}
                  color={'transparent'}
                />
              )}
              <Text style={labelStyle}>
                {uploading ? 'Subiendo...' : label}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ImageExpandableModal
          visible={modalVisible}
          imageUri={selectedImageUri}
          onClose={() => setModalVisible(false)}
        />
      </>
    );
  }

  // MODO MÚLTIPLE
  const GAP = 12;
  const ITEMS_PER_ROW = 3;
  const CONTAINER_PADDING = 32;
  const containerWidth = screenWidth - CONTAINER_PADDING;
  const ITEM_SIZE =
    (containerWidth - GAP * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

  return (
    <>
      <View style={{ marginVertical: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
          {currentValues.map((path: string, i: number) => {
            const fileExt = path.split('.').pop()?.toLowerCase();
            const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
            const isImage =
              type === 'I' ||
              (type === 'A' && fileExt && imageExts.includes(fileExt));
            return (
              <View
                key={i}
                style={{
                  position: 'relative',
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#f8f8f8',
                }}
              >
                <TouchableOpacity
                  onPress={() => remove(path)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    zIndex: 10,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 20,
                    padding: 4,
                  }}
                >
                  <Icon name={IconX} color="#fff" size={16} />
                </TouchableOpacity>

                {isImage ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openImageModal(path)}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <Image
                      source={{ uri: path }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 8,
                    }}
                  >
                    <Icon name={IconFile} color={cssVar.cAccent} size={32} />
                    <Text
                      style={{ fontSize: 10, textAlign: 'center' }}
                      numberOfLines={2}
                    >
                      {path.split('/').pop()}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {currentValues.length < cant && (
            <TouchableOpacity
              onPress={pickFile}
              disabled={uploading}
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                borderRadius: 8,
                backgroundColor: cssVar.cWhiteV2,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: cssVar.cAccent,
                borderStyle: 'dashed',
              }}
            >
              {uploading ? (
                <Text>Subiendo...</Text>
              ) : (
                <>
                  <Icon name={IconGallery} color={cssVar.cAccent} size={32} />
                  <Text
                    style={{
                      fontSize: 10,
                      marginTop: 4,
                      color: cssVar.cAccent,
                    }}
                  >
                    {label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {required && currentValues.length === 0 && (
          <Text style={{ color: 'red', marginTop: 6 }}>Campo obligatorio</Text>
        )}
      </View>

      <ImageExpandableModal
        visible={modalVisible}
        imageUri={selectedImageUri}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default React.memo(UploadFile);

const styles: any = StyleSheet.create({
  containerV1: {
    width: '100%',
    height: 180,
    backgroundColor: cssVar.cWhiteV2,
    borderRadius: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  containerV2: {
    borderWidth: 2,
    borderColor: '#414141',
    borderStyle: 'dashed',
    height: 100,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelV1: {
    color: cssVar.cAccent,
    textDecorationLine: 'underline',
    fontSize: 12,
    marginTop: 8,
  },
  labelV2: {
    color: cssVar.cWhiteV1,
    fontSize: 14,
    fontFamily: FONTS?.regular,
    marginTop: 8,
  },
});
