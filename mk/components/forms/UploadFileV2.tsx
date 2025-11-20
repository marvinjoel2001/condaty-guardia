// mk/components/forms/UploadFile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { storage } from '../../services/storage/storage.service';
import { uriToBlob } from '../../utils/file';
import Icon from '../../components/ui/Icon/Icon';
import { IconGallery, IconX, IconDoc2 as IconFile } from '../../../src/icons/IconLibrary';
import { cssVar } from '../../styles/themes';

interface Props {
  name: string;
  value: string | string[];
  // URL(s) ya guardadas
  onChange: (value: string | string[]) => void;
  label?: string;
  type?: 'I' | 'D';           // Imagen o Documento
  cant?: number;             // máximo archivos (default 1)
  required?: boolean;
  ext?: string;              // ej: "jpg,png,pdf"
  prefix?: string;           // ej: "incidents/2025"
  global?: boolean;          // true → carpeta "global", false → clientId
  clientId?: string;         // obligatorio si global=false
}

const UploadFile: React.FC<Props> = ({
  name,
  value,
  onChange,
  label = 'Subir archivo',
  type = 'I',
  cant = 1,
  required = false,
  ext,
  prefix = '',
  global = false,
  clientId,
}) => {
  const [uploading, setUploading] = useState(false);

  const currentValues = Array.isArray(value) ? value : value ? [value] : [];
  const allowedExts = (ext || (type === 'I' ? 'jpg,jpeg,png,webp' : 'pdf,pdf,doc,docx'))
    .toLowerCase()
    .split(',')
    .map(e => e.trim().replace('.', ''));

  const getFolder = () => (global ? 'global' : clientId || 'unknown');

  const getPath = (filename: string) => {
    const folder = getFolder();
    const pref = prefix ? `${prefix}/` : '';
    return `${folder}/${pref}${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  };

  const pickFile = () => {
    if (currentValues.length >= cant) {
      Alert.alert('Límite', `Máximo ${cant} archivo(s)`);
      return;
    }

    if (type === 'I') {
      Alert.alert('Seleccionar', '', [
        { text: 'Cámara', onPress: openCamera },
        { text: 'Galería', onPress: openGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else {
      pickDocument();
    }
  };

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const p = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (p !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    launchCamera({ mediaType: 'photo', quality: 0.8 }, handlePickerResponse);
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: type === 'I' ? 'photo' : 'mixed', selectionLimit: cant - currentValues.length },
      handlePickerResponse,
    );
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle();
      handlePickerResponse({ assets: [{ uri: res.uri, fileName: res.name }] });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.error(err);
    }
  };

  const handlePickerResponse = async (response: any) => {
    if (response.didCancel || !response.assets) return;

    setUploading(true);
    const newPaths: string[] = [...currentValues];

    for (const asset of response.assets) {
      const filename = asset.fileName || `file_${Date.now()}`;
      const ext = filename.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExts.includes(ext)) {
        Alert.alert('Error', `Extensión no permitida: .${ext}`);
        continue;
      }

      const path = getPath(filename);

      try {
        const blob = await uriToBlob(asset.uri);
        const uploaded = await storage.upload(blob, path);
        newPaths.push(uploaded.path);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo subir el archivo');
      }
    }

    onChange(cant === 1 ? newPaths[0] || '' : newPaths);
    setUploading(false);
  };

  const remove = (path: string) => {
    storage.delete(path).catch(() => {});
    const filtered = currentValues.filter(p => p !== path);
    onChange(cant === 1 ? '' : filtered);
  };

  return (
    <View style={{ marginVertical: 12 }}>
      {label && <Text style={{ marginBottom: 8, fontWeight: '600' }}>{label}</Text>}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {currentValues.map((path, i) => {
          const url = storage.url(path);
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
              }}>
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
                }}>
                <Icon name={IconX} color="#fff" size={16} />
              </TouchableOpacity>

              {isImage ? (
                <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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
            }}>
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
  );
};

export default UploadFile;