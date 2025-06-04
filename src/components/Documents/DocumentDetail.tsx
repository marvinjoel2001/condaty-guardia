import React from 'react';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {Linking, Text} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';
import Button from '../../../mk/components/forms/Button/Button';
import {getUrlImages} from '../../../mk/utils/strings';
interface Props {
  open: boolean;
  onClose: () => void;
  item: any;
}

const DocumentDetail = ({open, onClose, item}: Props) => {
  const openDocument = (document: any) => {
    const documentUrl = getUrlImages(
      '/DOC-' +
        document?.id +
        '.' +
        document.ext +
        '?d=' +
        document?.updated_at,
    );
    Linking.openURL(documentUrl).catch(err => {
      console.error('Error al abrir el enlace: ', err);
    });
  };
  return (
    <Modal title="Detalle del documento" open={open} onClose={onClose}>
      <Text style={{color: cssVar.cWhiteV1}}>{item.descrip}</Text>
      <Button
        onPress={() => openDocument(item)}
        styleText={{fontSize: 12}}
        variant="terciary">
        Ver documento
      </Button>
    </Modal>
  );
};

export default DocumentDetail;
