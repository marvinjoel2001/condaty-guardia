import React, {useEffect, useState} from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import {getFullName} from '../../../../mk/utils/strings';
import useApi from '../../../../mk/hooks/useApi';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import DateAccess from '../DateAccess/DateAccess';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import {Text} from 'react-native';
import {cssVar} from '../../../../mk/styles/themes';
type Props = {
  open: boolean;
  onClose: () => void;
  id: number | null;
};
const OrdersDetail = ({open, onClose, id}: Props) => {
  const [data, setData]: any = useState(null);
  const {execute} = useApi();
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });

  const getInvitation = async () => {
    const {data} = await execute('/others', 'GET', {
      fullType: 'DET',
      section: 'ACT',
      searchBy: id,
    });
    setData(data.data?.[0]);
  };

  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    data.push({
      l: 'Tipo de acceso:',
      v: 'Pedido-' + item?.other_type.name,
    });

    data.push({
      l: 'Descripción:',
      v: item?.descrip,
    });
    data.push({
      l: 'Entregó a:',
      v: getFullName(item?.owner),
    });
    data.push({
      l: 'Guardia de entrada:',
      v: getFullName(item?.access?.guardia),
    });
    if (item?.access.out_guard) {
      data.push({
        l: 'Guardia de salida:',
        v: getFullName(item?.access?.out_guard),
      });
    }
    if (item?.access?.plate) {
      data.push({
        l: 'Placa:',
        v: item?.access?.plate,
      });
    }

    setDetails({data: data});
  };

  useEffect(() => {
    if (id) {
      getInvitation();
    }
  }, [id]);
  useEffect(() => {
    if (data) {
      _onDetail(data);
    }
  }, [data]);

  // const typeLabels: Record<'O' | 'P' | 'I' | 'G', string> = {
  //   O: 'Residente',
  //   P: 'Repartidor',
  //   I: 'Visitante individual',
  //   G: 'Visitante grupal',
  // };

  // const type = typeLabels[data?.type as 'O' | 'P' | 'I' | 'G'] || '';

  // console.log("mi data un OrderDetails", data)
  return (
    <ModalFull title={'Detalle de pedido'} open={open} onClose={onClose}>
      {!data ? (
        <Loading />
      ) : (
        <>
          <ItemInfo type="C" details={details} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginVertical: 10,
              color: cssVar.cWhite,
            }}>
            Repartidor
          </Text>
          <ItemList
            title={getFullName(data?.access?.visit)}
            subtitle={'C.I. ' + data?.access?.visit?.ci}
            left={<Avatar name={getFullName(data?.access?.visit)} />}
            children={<DateAccess access={data?.access} />}
          />
        </>
      )}
    </ModalFull>
  );
};

export default OrdersDetail;
