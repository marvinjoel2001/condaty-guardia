import React, {useEffect, useState} from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import {Text, View} from 'react-native';
import useApi from '../../../../mk/hooks/useApi';
import {cssVar} from '../../../../mk/styles/themes';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {getDateStrMes} from '../../../../mk/utils/dates';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import DateAccess from '../DateAccess/DateAccess';
import Loading from '../../../../mk/components/ui/Loading/Loading';

type Props = {
  open: boolean;
  onClose: () => void;
  id: string | null;
};

const InvitationDetail = ({open, onClose, id}: Props) => {
  const [data, setData]: any = useState(null);
  const {execute} = useApi();
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });

  const getInvitation = async () => {
    const {data} = await execute('/invitations', 'GET', {
      fullType: 'DET',
      section: 'ACT',
      searchBy: id,
    });
    setData(data.data?.[0]);
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

  const enteredGuests =
    data?.guests?.filter((guest: any) => guest.access !== null) || [];
  const notEnteredGuests =
    data?.guests?.filter((guest: any) => guest.access === null) || [];

  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    data.push({
      l: 'Tipo de acceso:',
      v: item?.type === 'G' ? 'QR Grupal' : 'QR Individual',
    });
    if (item?.type === 'G') {
      data.push({
        l: 'Evento:',
        v: item?.title,
      });
    }
    data.push({
      l: 'Fecha de invitación:',
      v: getDateStrMes(item?.date_event),
    });
    data.push({
      l: item?.type === 'G' ? 'Visitaron a:' : 'Visitó a:',
      v: getFullName(item?.owner),
    });
    if (item?.type === 'I') {
      if (item?.access[0]?.plate) {
        data.push({
          l: 'Placa:',
          v: item?.access[0]?.plate,
        });
      }
      data.push({
        l: item?.access[0]?.out_guard
          ? 'Guardia de entrada:'
          : 'Guardia de entrada y salida:',
        v: getFullName(item?.access[0]?.guardia),
      });
      if (item?.access[0]?.out_guard) {
        data.push({
          l: 'Guardia de salida:',
          v: getFullName(item?.access[0]?.out_guard),
        });
      }
      if (item?.access[0]?.obs_in) {
        data.push({
          l: 'Observación de entrada:',
          v: item?.access[0]?.obs_in,
        });
      }
      if (item?.access[0]?.obs_out) {
        data.push({
          l: 'Observación de salida:',
          v: item?.access[0]?.obs_out,
        });
      }
    }

    setDetails({data: data});
  };
  return (
    <ModalFull title={'Detalle de invitación'} open={open} onClose={onClose}>
      {!data ? (
        <Loading />
      ) : (
        <>
          <ItemInfo type="C" details={details} />
          {data?.type == 'G' && (
            <View style={{padding: 10}}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  color: cssVar.cWhite,
                }}>
                Invitados que ingresaron:
              </Text>
              {enteredGuests.map((guest: any, index: any) => (
                <ItemList
                  key={index}
                  left={<Avatar name={getFullName(guest.visit)} hasImage={0} />}
                  title={getFullName(guest.visit)}
                  subtitle={`CI: ${guest.visit.ci}`}
                  children={<DateAccess access={guest?.access} />}
                />
              ))}
              {notEnteredGuests.length > 0 && (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginVertical: 10,
                    color: cssVar.cWhite,
                  }}>
                  Invitados pendientes de ingreso:
                </Text>
              )}
              {notEnteredGuests.map((guest: any, index: any) => (
                <ItemList
                  key={index}
                  left={<Avatar name={getFullName(guest.visit)} hasImage={0} />}
                  title={getFullName(guest.visit)}
                  subtitle={`CI: ${guest.visit.ci}`}
                  //   children={
                  //     <View style={{marginTop: 10}}>
                  //       <Text>Fecha de invitación: {guest.in_at}</Text>
                  //       <Text>Fecha de vencimiento: {guest.out_at}</Text>
                  //     </View>
                  //   }
                />
              ))}
            </View>
          )}
          {data?.type == 'I' && (
            <View style={{padding: 10}}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  color: cssVar.cWhite,
                }}>
                Invitado que ingresó:
              </Text>
              <ItemList
                left={<Avatar name={getFullName(data?.visit)} hasImage={0} />}
                title={getFullName(data?.visit)}
                subtitle={`CI: ${data?.visit?.ci}`}
                children={<DateAccess access={data.access[0]} />}
              />
            </View>
          )}
        </>
      )}
    </ModalFull>
  );
};

export default InvitationDetail;
