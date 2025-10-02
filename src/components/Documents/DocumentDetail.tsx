import React, {useState} from 'react';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {Text, Alert} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';
import Button from '../../../mk/components/forms/Button/Button';
import {getUrlImages} from '../../../mk/utils/strings';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

interface Props {
  open: boolean;
  onClose: () => void;
  item: any;
}

const DocumentDetail = ({open, onClose, item}: Props) => {
  const [downloading, setDownloading] = useState(false);

  const downloadAndOpen = async (document: any) => {
    try {
      setDownloading(true);

      // Construir la URL del documento
      const documentUrl = getUrlImages(
        '/DOC-' +
          document?.id +
          '.' +
          document.ext +
          '?d=' +
          document?.updated_at,
      );

      const fileExtension = document.ext || 'pdf';

      const fileName = `document_${document.id}.${fileExtension}`;

      const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const exists = await RNFS.exists(localFile);
      if (exists) {
        await RNFS.unlink(localFile);
      }

      // Descargar el archivo
      const downloadResult = await RNFS.downloadFile({
        fromUrl: documentUrl,
        toFile: localFile,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Abrir el archivo con la aplicación nativa
        await FileViewer.open(localFile, {
          showOpenWithDialog: true, // Permite elegir con qué app abrir
          showAppsSuggestions: true,
        });
      } else {
        Alert.alert(
          'Error',
          'No se pudo descargar el documento. Código: ' +
            downloadResult.statusCode,
        );
      }
    } catch (error: any) {
      console.error('Error descargando/abriendo archivo: ', error);

      let errorMessage = 'Ocurrió un error al abrir el documento.';

      if (error.message?.includes('No app')) {
        errorMessage =
          'No hay una aplicación instalada para abrir este tipo de archivo.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal title="Detalle del documento" open={open} onClose={onClose}>
      <Text style={{color: cssVar.cWhiteV1, marginBottom: 16}}>
        {item.descrip}
      </Text>
      <Button
        onPress={() => downloadAndOpen(item)}
        styleText={{fontSize: 12}}
        variant="terciary"
        disabled={downloading}>
        {downloading ? 'Descargando...' : 'Ver documento'}
      </Button>
    </Modal>
  );
};

export default DocumentDetail;
