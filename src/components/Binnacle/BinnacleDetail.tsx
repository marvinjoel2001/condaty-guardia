import React, {useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {Image, StyleSheet, Text, View} from 'react-native';
import {getDateTimeStrMes} from '../../../mk/utils/dates';
import {getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import Card from '../../../mk/components/ui/Card/Card';
type PropsType = {
  open: boolean;
  onClose: () => void;
  item: any;
};

const BinnacleDetail = ({open, onClose, item}: PropsType) => {
  // console.log(item,'ssss')
  const [imageError, setImageError] = useState(false);
  const Br = () => {
    return (
      <View
        style={{
          marginVertical: 16,
          backgroundColor: cssVar.cWhiteV1,
          height: 0.5,
        }}
      />
    );
  };

  return (
    <ModalFull
      open={open}
      title="Detalle de bitácora"
      onClose={onClose}
      buttonCancel=""
      buttonText="">
      <Card>
        <Text style={styles.text}>Reporte</Text>
        <Text style={{...styles.textV1}}>{item?.descrip}</Text>
        <Br />
        {imageError ? (
          <Text
            style={{
              color: cssVar.cWhiteV1,
              textAlign: 'center',
              marginVertical: 16,
              fontSize: 14,
            }}>
            No se encontró la imagen
          </Text>
        ) : (
          <>
            <Text style={styles.text}>Imagen del reporte</Text>
            <View style={styles.containerImage}>
              <Image
                source={{
                  uri: getUrlImages(
                    `/GNEW-${item?.id}.webp?d=${item?.updated_at}`,
                  ),
                }}
                resizeMode="contain"
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
        )}
      </Card>
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
});
