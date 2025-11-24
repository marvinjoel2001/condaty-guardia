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
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { storage } from '../../services/storage/storage.service';
import { uriToBlob } from '../../utils/file';
import Icon from '../../components/ui/Icon/Icon';
import {
  IconGallery,
  IconX,
  IconDoc2 as IconFile,
  IconCamera,
} from '../../../src/icons/IconLibrary';
import { cssVar, FONTS } from '../../styles/themes';
import ImageExpandableModal from '../../components/ui/ImageExpandableModal/ImageExpandableModal'; // ← Ya lo tenías importado

interface Props {
  setFormState: (updater: any) => void;
  formState: any;
  name: string;
  label?: string;
  type?: 'I' | 'D';
  cant?: number;
  required?: boolean;
  ext?: string;
  prefix?: string;
  global?: boolean;
  clientId?: string;
  style?: any;
  variant?: 'V1' | 'V2';
}

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
}) => {
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');

  const currentValues = Array.isArray(formState[name]) ? formState[name] : formState[name] ? [formState[name]] : [];
  const isSingle = cant === 1;
  const allowedExts = (ext || (type === 'I' ? 'jpg,jpeg,png,webp' : 'pdf,doc,docx'))
    .toLowerCase()
    .split(',')
    .map(e => e.trim().replace('.', ''));

  const folder = global ? 'global' : clientId || 'unknown';
  const pref = prefix ? `${prefix}/` : '';

  const getPath = useCallback((filename: string) => {
    const clean = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${folder}/${pref}${Date.now()}_${clean}`;
  }, [folder, pref]);

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
    } else {
      pickDocument();
    }
  }, [currentValues.length, cant, type]);

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const p = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (p !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    launchCamera({ mediaType: 'photo', quality: 0.8 }, handleResponse);
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: type === 'I' ? 'photo' : 'mixed', selectionLimit: cant - currentValues.length },
      handleResponse,
    );
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle();
      handleResponse({ assets: [{ uri: res.uri, fileName: res.name || 'documento' }] });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.error(err);
    }
  };

  const handleResponse = async (response: any) => {
    if (response.didCancel || !response.assets) return;

    setUploading(true);
    const newValues = [...currentValues];

    for (const asset of response.assets) {
      const filename = asset.fileName || `file_${Date.now()}`;
      const fileExt = filename.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExts.includes(fileExt)) {
        Alert.alert('Error', `Formato no permitido: .${fileExt}`);
        continue;
      }

      const path = getPath(filename);

      try {
        const blob = await uriToBlob(asset.uri);
        const uploaded = await storage.upload(blob, path);
        //newValues.push(uploaded.path); // Esta linea de codigo es para guardar la ruta relativa del archivo
        newValues.push(uploaded.url);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo subir el archivo');
      }
    }

    setFormState((prev: any) => ({ ...prev, [name]: isSingle ? [newValues[0] || ''] : newValues }));
    setUploading(false);
  };

  /* Funcion para remover en base a ruta relativa
  const remove = (path: string) => {
    storage.delete(path).catch(() => {});
    const filtered = currentValues.filter((p: string) => p !== path);
    setFormState((prev: any) => ({ ...prev, [name]: isSingle ? '' : filtered }));
  };
  */
  
  const remove = (fullUrl: string) => {
  let path = fullUrl;
  try {
    const urlObj = new URL(fullUrl);
    path = decodeURIComponent(urlObj.pathname.slice(1)); // quita el "/" inicial
  } catch {
    const parts = fullUrl.split('/');
    path = parts.slice(3).join('/'); // asume formato https://dominio.com/path...
  }

  storage.delete(path).catch(() => {});
  
  const filtered = currentValues.filter((url: string) => url !== fullUrl);
  setFormState((prev: any) => ({
    ...prev,
    [name]: isSingle ? '' : filtered,
  }));
};

  // Abrir modal con la imagen
  const openImageModal = (fullUrl: string) => {
    setSelectedImageUri(fullUrl);
    setModalVisible(true);
  };

  // MODO SINGLE
  if (isSingle) {
    const imageUrl = formState[name] ? storage.url(formState[name] as string) : '';
    const containerStyle = variant === 'V2' ? styles.containerV2 : styles.containerV1;
    const labelStyle = variant === 'V2' ? styles.labelV2 : styles.labelV1;

    return (
      <>
        <View style={{ ...containerStyle, ...style }}>
          {formState[name] ? (
            <>
              <TouchableOpacity
                onPress={() => remove(formState[name] as string)}
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
                onPress={() => openImageModal(formState[name] as string)}
                style={{ width: '100%', height: '100%' }}
                disabled={uploading}
              >
                <Image
                  source={{ uri: imageUrl }}
                  resizeMode="contain"
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
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Subiendo...</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity onPress={pickFile} disabled={uploading} style={{ alignItems: 'center' }}>
              {variant === 'V2' ? (
                <Icon name={IconCamera} fillStroke={cssVar.cAccent} color={'transparent'} />
              ) : (
                <Icon name={IconGallery} fillStroke={cssVar.cWhite} color={'transparent'} />
              )}
              <Text style={labelStyle}>{uploading ? 'Subiendo...' : label}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal expandible */}
        <ImageExpandableModal
          visible={modalVisible}
          imageUri={selectedImageUri}
          onClose={() => setModalVisible(false)}
        />
      </>
    );
  }

  // MODO MÚLTIPLE
  return (
    <>
      <View style={{ marginVertical: 12 }}>
        {/* {label && <Text style={{ marginBottom: 8, fontWeight: '600' }}>{label}</Text>} */}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {currentValues.map((path: string, i: number) => {
            const isImage = type === 'I';
            return (
              <View
                key={i}
                style={{
                  position: 'relative',
                  width: 100,
                  height: 100,
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
                  // Tocamos la miniatura → abre modal
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
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 8 }}>
                    <Icon name={IconFile} color={cssVar.cAccent} size={32} />
                    <Text style={{ fontSize: 10, textAlign: 'center' }} numberOfLines={2}>
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
                width: 100,
                height: 100,
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
                  <Text style={{ fontSize: 10, marginTop: 4, color: cssVar.cAccent }}>
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

      {/* Modal expandible */}
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