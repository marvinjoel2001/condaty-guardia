import React, {useEffect, useState} from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import {View} from 'react-native';
import {Text} from 'react-native';
import Card from '../../../../mk/components/ui/Card/Card';
import {cssVar} from '../../../../mk/styles/themes';
import LineDetail from './shares/LineDetail';
import useApi from '../../../../mk/hooks/useApi';

const DetAccesses = ({id, open, close, reload}: any) => {
  const {execute, waiting} = useApi();
  const [data, setData]: any = useState(null);

  useEffect(() => {
    const getData = async (id: number) => {
      const {data} = await execute('/accesses', 'GET', {
        fullType: 'DET',
        searchBy: id,
      });
      if (data.success) {
        setData(data?.data?.length > 0 ? data?.data[0] : null);
      }
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  //study case
  //
  const dummy = (e: string) => {
    console.log('dummy', e);
  };

  const getStatus = () => {
    if (data?.out_at) return 'C';
    if (data?.in_at && !data?.out_at) return 'I';

    return '';
  };
  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Detalle'}
      onSave={dummy}
      // buttonExtra={'extra'}
      buttonCancel={getStatus() == 'C' ? '' : 'cancelar'}
      buttonText={getStatus() == 'C' ? '' : 'Grabar'}>
      <Card>
        <LineDetail label="Estado" value="Juan Perez" />
        <LineDetail label="Tipo" value="Entrada" />
        <LineDetail label="Fecha" value="2021-01-01" />
        <LineDetail label="Hora" value="10:00" />
        <LineDetail label="Placa" value="ABC123" />
        <Text style={{color: 'white'}}>{JSON.stringify(data.status)}</Text>
      </Card>
    </ModalFull>
  );
};

export default DetAccesses;
