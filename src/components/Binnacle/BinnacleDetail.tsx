import React, {useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {Image, Text, View} from 'react-native';
import {getDateTimeStrMes} from '../../../mk/utils/dates';
import {getUrlImages} from '../../../mk/utils/strings';
import {cssVar} from '../../../mk/styles/themes';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
type PropsType = {
  open: boolean;
  onClose: () => void;
  item: any;
};

const BinnacleDetail = ({open, onClose, item}: PropsType) => {
  // console.log(item,'ssss')
  const [imageError, setImageError] = useState(false);
  const RowData = ({title, value}: any) => {
    return (
      <View style={{flexDirection: 'row', gap: 5}}>
        <Text
          style={{
            color: cssVar.cWhite,
            textAlign: 'right',
            width: '50%',
          }}>
          {title}
        </Text>
        <Text
          style={{
            color: cssVar.cWhiteV1,
            width: '50%',
          }}>
          {value}
        </Text>
      </View>
    );
  };

  return (
    <ModalFull
      open={open}
      title="Detalle de bitácora"
      onClose={onClose}
      buttonCancel=""
      buttonText="">
      <View style={{padding: 16}}>
        {/* <Card> */}
        <View
          style={{
            justifyContent: 'center',
          }}>
          <RowData
            title="Fecha"
            value={getDateTimeStrMes(item.created_at, true)}
          />
          <RowData title="Descripción" value={item.descrip} />
        </View>

        <>
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
              <Text
                style={{
                  color: cssVar.cWhite,
                }}>
                Imagen:
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  marginTop: 16,
                  borderRadius: 10,
                }}>
                <Image
                  source={{
                    uri: getUrlImages(
                      `/GNEW-${item?.id}.webp?d=${item?.updated_at}`,
                    ),
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    justifyContent: 'center',
                    width: 300,
                    height: 350,
                  }}
                  onError={() => setImageError(true)}
                />
                {/* <Avatar
            src={ getUrlImages(
                `/GNEW-${item?.id}.webp?d=${item?.updated_at}`,
              )}
              w={300}
              h={350}
            style={{ flex:1,borderRadius:8,justifyContent:'center'}}
            circle={false}
            onError={() => setImageError(true)}
            resizeMode="cover"
          /> */}
              </View>
            </>
          )}
        </>
      </View>
    </ModalFull>
  );
};

export default BinnacleDetail;
