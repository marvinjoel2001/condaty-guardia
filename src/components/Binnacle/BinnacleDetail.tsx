import React, {useState, useEffect} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {Image, StyleSheet, Text, View} from 'react-native';
import {getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import Card from '../../../mk/components/ui/Card/Card';
import useApi from '../../../mk/hooks/useApi';
import Br from '../Profile/Br';

type PropsType = {
  open: boolean;
  onClose: () => void;
  id: any;
};

const BinnacleDetail = ({open, onClose, id}: PropsType) => {
  const [details, setDetails] = useState<any>({});
  const [imageError, setImageError] = useState(false);

  const {execute, loaded} = useApi();

  const getBinnacleDetail = async () => {
    const {data} = await execute('/guardnews', 'GET', {
      fullType: 'DET',
      searchBy: id,
    });
    if (data?.success) {
      console.log(data);
      setDetails(data?.data[0]);
    }
  };

  useEffect(() => {
    if (id && open) {
      getBinnacleDetail();
    }
  }, [id, open]);

  const _onClose = () => {
    onClose();
    setDetails({});
    setImageError(false);
  };


  const renderImageSection = () => {
    // Si no tiene imagen, mostrar mensaje
    if (details?.has_image === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>Sin imagen</Text>
        </View>
      );
    }

    // Si hubo error cargando la imagen, mostrar mensaje de error
    if (imageError) {
      return (
        <Text
          style={{
            color: cssVar.cWhiteV1,
            textAlign: 'center',
            marginVertical: 16,
            fontSize: 14,
          }}>
          Sin Imagen
        </Text>
      );
    }

    // Si tiene imagen y no hay error, mostrar la imagen
    return (
      <>
        <Text style={styles.text}>Imagen del reporte</Text>
        <View style={styles.containerImage}>
          <Image
            source={{
              uri: getUrlImages(
                `/GNEW-${details?.id}.webp?d=${details?.updated_at}`,
              ),
            }}
            resizeMode="cover"
            style={{
              flex: 1,
              borderRadius: 8,
              justifyContent: 'center',
              width: '100%',
            }}
            onError={() => setImageError(true)}
          />
        </View>
      </>
    );
  };

  const renderContent = () => {
    if (!loaded) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{color: cssVar.cWhite}}>Cargando...</Text>
        </View>
      );
    }

    return (
      <Card>
        <Text style={styles.text}>Reporte</Text>
        <Text style={{...styles.textV1}}>{details?.descrip}</Text>
        <Br />
        {renderImageSection()}
      </Card>
    );
  };

  return (
    <ModalFull
      open={open}
      title="Detalle de bitácora"
      onClose={_onClose}
      buttonCancel=""
      buttonText="">
      {renderContent()}
    </ModalFull>
  );
};

export default BinnacleDetail;

const styles = StyleSheet.create({
  text: {
    color: cssVar.cWhite,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  textV1: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 12,
  },
  containerImage: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 10,
    height: 180,
    width: '100%',
    backgroundColor: cssVar.cWhiteV2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    padding: 20,
    backgroundColor: cssVar.cBlackV2,
    borderRadius: 8,
  },
  noImageText: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});
