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
      l: 'Tipo de acceso',
      v: 'Pedido-' + item?.other_type.name,
    });

    data.push({
      l: 'Descripción',
      v: item?.descrip,
    });
    data.push({
      l: 'Entregó a',
      v: getFullName(item?.owner),
    });
    data.push({
      l: 'Guardia de entrada',
      v: getFullName(item?.access?.guardia),
    });
    if (item?.access.out_guard) {
      data.push({
        l: 'Guardia de salida',
        v: getFullName(item?.access?.out_guard),
      });
    }
    if (item?.access?.plate) {
      data.push({
        l: 'Placa',
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

  return (
    <ModalFull title={'Detalle de pedido'} open={open} onClose={onClose}>
      <ItemInfo type="C" details={details} />
      <ItemList
        title={getFullName(data?.access?.visit)}
        subtitle={'C.I. ' + data?.access?.visit?.ci}
        left={<Avatar name={getFullName(data?.access?.visit)} />}
        children={<DateAccess access={data?.access} />}
      />
    </ModalFull>
  );
};

export default OrdersDetail;
