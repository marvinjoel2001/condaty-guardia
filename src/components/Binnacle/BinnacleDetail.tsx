import React, {useState, useEffect} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {StyleSheet, Text, View} from 'react-native';
import {getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import Card from '../../../mk/components/ui/Card/Card';
import useApi from '../../../mk/hooks/useApi';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
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
    if (Number(details?.has_image) === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>Sin imagen</Text>
        </View>
      );
    }

    if (imageError) {
      return (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No se encontró la imagen</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.text}>Imagen del reporte</Text>
        <View style={styles.imageContainer}>
          {Number(details?.has_image) === 0 ? null : (
            <Avatar
              hasImage={1}
              expandable={true}
              src={getUrlImages(
                `/GNEW-${details?.id}.webp?d=${details?.updated_at}`,
              )}
              name="Imagen del reporte"
              w={750}
              h={180}
              circle={false}
              error={() => setImageError(true)}
              style={styles.avatarImage}
            />
          )}
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
  imageContainer: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: cssVar.cWhiteV2,
    height: 180,
    width: '100%',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
