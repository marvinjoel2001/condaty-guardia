import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar} from '../../../../mk/styles/themes';
import Card from '../../../../mk/components/ui/Card/Card';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';

type PropsType = {
  formState: any;
  setFormState: Function;
  handleChange: Function;
  data: any;
};
const KeyQR = ({formState, setFormState, handleChange, data}: PropsType) => {
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });

  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];

    data.push({
      l: 'Propietario:',
      v: getFullName(item.invitation),
    });
    data.push({
      l: 'Estado:',
      v: item.invitation?.status === 'A' ? 'LLAVE VALIDA' : 'LLAVE NO VALIDA',
      sv: {
        color:
          item.invitation?.status !== 'A' ? cssVar.cError : cssVar.cSuccess,
        marginBottom: 3,
      },
    });
    data.push({
      l: 'CI:',
      v: item.invitation?.ci,
    });
    {
      item.invitation?.dpto &&
        data.push({
          l: 'Dpto:',
          v: item.invitation?.dpto[0]?.nro || 'Sin unidad',
        });
    }
    {
      item.invitation?.phone &&
        data.push({
          l: 'Teléfono:',
          v: item.invitation?.phone,
        });
    }

    setDetails({data: data});
  };

  useEffect(() => {
    _onDetail({...data});
  }, [data]);

  return (
    <View style={{marginTop: 20, gap: 20}}>
      {!data?.invitation ? (
        <Text>Cargando...</Text>
      ) : (
        <>
          <Avatar
            h={180}
            fontSize={44}
            w={180}
            name={getFullName(data?.invitation)}
            src={getUrlImages(
              '/OWNER-' +
                data?.invitation?.id +
                '.webp?d=' +
                data?.invitation?.updated_at,
            )}
          />

          <ItemInfo type="C" details={details} />
          {!data?.invitation?.access && (
            <TextArea
              label="Observaciones de entrada"
              placeholder="Ej: El visitante está ingresando con 1 mascota y 2 bicicletas."
              name="obs_in"
              value={formState['obs_in']}
              onChange={value => handleChange('obs_in', value)}
            />
          )}
        </>
      )}
    </View>
  );
};

export default KeyQR;
