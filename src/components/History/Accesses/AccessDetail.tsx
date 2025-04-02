import React, {useEffect, useState} from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import {getDateStrMes, getDateTimeStrMes} from '../../../../mk/utils/dates';
import {getFullName} from '../../../../mk/utils/strings';
import useApi from '../../../../mk/hooks/useApi';
import {Text, View} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {cssVar} from '../../../../mk/styles/themes';
import DateAccess from '../DateAccess/DateAccess';
import Skeleton from '../../../../mk/components/ui/Skeleton/Skeleton';
import Loading from '../../../../mk/components/ui/Loading/Loading';
type Props = {
  open: boolean;
  onClose: () => void;
  id: string | null;
};
const AccessDetail = ({open, onClose, id}: Props) => {
  const [data, setData]: any = useState(null);
  const {execute} = useApi();
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });

  const getAccess = async () => {
    const {data} = await execute('/accesses', 'GET', {
      fullType: 'DET',
      section: 'ACT',
      searchBy: id,
    });
    setData(data.data?.[0]);
  };
  useEffect(() => {
    if (id) {
      getAccess();
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      _onDetail(data);
    }
  }, [data]);
  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    if (item?.type == 'O') {
      data.push({
        l: 'Tipo de acceso',
        v: 'QR Llave Virtual',
      });
      data.push({
        l: 'Fecha de ingreso',
        v: getDateTimeStrMes(item?.in_at),
      });
      data.push({
        l: 'Residente',
        v: getFullName(item.owner),
      });
      data.push({
        l: 'Guardia de entrada',
        v: getFullName(item.guardia),
      });
    } else {
      let v = item?.out_at
        ? 'Completado'
        : !item?.confirm_at
        ? 'Por confirmar'
        : item?.in_at
        ? 'Por Salir'
        : item?.confirm == 'Y'
        ? 'Por Entrar'
        : 'Denegado';
      data.push({
        l: 'Estado',
        v: v,
        sv: {
          color: v == 'Denegado' ? cssVar.cError : cssVar.cWhite,
        },
      });

      data.push({
        l: 'Tipo de acceso',
        v:
          item?.type == 'P'
            ? 'Pedido-' + item?.other?.other_type.name
            : item?.type == 'I'
            ? 'QR Individual'
            : item?.type == 'C'
            ? 'Sin QR'
            : item?.type == 'G'
            ? 'QR Grupal'
            : 'QR Llave Virtual',
      });
      if (item?.type === 'I' || item?.type === 'G') {
        if (item.type === 'G') {
          data.push({l: 'Evento', v: item.invitation?.title});
        }
        data.push({
          l: 'Fecha de invitación',
          v: getDateStrMes(item.invitation?.date_event),
        });

        item.invitation?.obs &&
          data.push({l: 'Descripción', v: item.invitation?.obs});
      }
      if (item?.type == 'P') {
        data.push({l: 'Conductor', v: getFullName(item.visit)});
      } else {
        // data.push({l: "Visitante", v: item?.visit?.name});
      }

      if (item?.plate && !item.taxi) data.push({l: 'Placa', v: item.plate});

      if (item?.in_at && item.out_at) {
        data.push({l: 'Visitó a', v: getFullName(item?.owner)});
      } else {
        data.push({l: 'Visita a', v: getFullName(item?.owner)});
      }

      if (v == 'Denegado') {
        data.push({
          l: 'Fecha de denegación',
          v: getDateStrMes(item?.confirm_at),
        });
        data.push({l: 'Motivo', v: item?.obs_confirm});
      }

      if (item?.out_at) {
        data.push({l: 'Guardia de entrada', v: getFullName(item?.guardia)});
        item?.out_guard &&
          item?.guardia?.id != item?.out_guard?.id &&
          data.push({
            l: 'Guardia de salida',
            v: getFullName(item?.out_guard),
          });
        (item?.obs_in ||
          item?.obs_out ||
          item?.obs_confirm ||
          item?.obs_guard) &&
          item?.obs_guard;
        item?.obs_guard &&
          data.push({l: 'Obs. de solicitud', v: item?.obs_guard});
        item?.obs_in && data.push({l: 'Obs. de entrada', v: item?.obs_in});
        item?.obs_out && data.push({l: 'Obs. de salida', v: item?.obs_out});
      } else {
        (item?.obs_in || item?.obs_out || item?.obs_confirm) && item?.obs_in
          ? data.push({l: 'Obs. de entrada', v: item?.obs_in})
          : item?.obs_out
          ? data.push({l: 'Obs. de salida', v: item?.obs_out})
          : '';
      }
    }
    setDetails({data: data});
  };

  return (
    <ModalFull title={'Detalle de acceso'} open={open} onClose={onClose}>
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
            Visitante
          </Text>
          <ItemList
            title={getFullName(data?.visit)}
            subtitle={'C.I. ' + data?.visit?.ci}
            left={<Avatar name={getFullName(data?.visit)} />}
            children={<DateAccess access={data} />}
          />
          {data?.accesses?.length > 0 && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginVertical: 10,
                color: cssVar.cWhite,
              }}>
              Acompañantes
            </Text>
          )}
          {data?.accesses?.map((item: any, index: number) => {
            return (
              <ItemList
                key={index}
                title={getFullName(item?.visit)}
                left={<Avatar name={getFullName(item?.visit)} />}
                subtitle={'C.I.' + item?.visit?.ci}
                children={<DateAccess access={item} />}
              />
            );
          })}
        </>
      )}
    </ModalFull>
  );
};

export default AccessDetail;
