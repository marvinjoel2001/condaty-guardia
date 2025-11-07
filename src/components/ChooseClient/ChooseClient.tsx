import React from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import useAuth from '../../../mk/hooks/useAuth';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getUrlImages} from '../../../mk/utils/strings';
import {Text} from 'react-native';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {useNavigation} from '@react-navigation/native';
import ListFlat from '../../../mk/components/ui/List/ListFlat';
interface PropsType {
  open: boolean;
  onClose: () => void;
}
const ChooseClient = ({open, onClose}: PropsType) => {
  const {user, getUser} = useAuth();
  const router: any = useNavigation();

  const onSave = async (id: any = null) => {
    if (!id) return;
    await getUser(id);
    router.navigate('Home');
    onClose();
  };

  const renderItemActive = (item: any) => {
    let client = user?.client_id == item.id;
    return (
      <ItemList
        title={item.name}
        onPress={() => {
          onSave(item.id);
        }}
        left={
          <Avatar
            hasImage={1}
            name={item?.name}
            src={getUrlImages(
              '/CLIENT-' + item?.id + '.webp?d=' + item?.updated_at,
            )}
          />
        }
        right={
          client && (
            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: 10,
                padding: 4,
                borderRadius: 4,
                color: cssVar.cSuccess,
                backgroundColor: cssVar.cHoverSuccess,
              }}>
              Sesión actual
            </Text>
          )
        }
      />
    );
  };
  const renderItemPending = (item: any) => {
    let rejected = item?.pivot?.status === 'X';
    return (
      <ItemList
        title={item.name}
        // onPress={() => {
        //   onClose();
        // }}
        left={
          <Avatar
            hasImage={1}
            name={item?.name}
            src={getUrlImages(
              '/CLIENT-' + item?.id + '.webp?d=' + item?.updated_at,
            )}
          />
        }
        right={
          <Text
            style={{
              fontFamily: FONTS.regular,
              fontSize: 10,
              padding: 4,
              borderRadius: 4,
              color: rejected ? cssVar.cError : cssVar.cWarning,
              backgroundColor: rejected
                ? cssVar.cHoverError
                : cssVar.cHoverWarning,
            }}>
            {rejected ? 'Rechazado' : 'Por aprobar'}
          </Text>
        }
      />
    );
  };
  const getActiveClients = () => {
    const activeClients = user?.clients
      .filter(
        (client: any) =>
          client?.pivot?.status === 'P' || client?.pivot?.status === 'A',
      )
      .sort((a: any, b: any) => {
        const isActiveA: any = a.id === user.client_id;
        const isActiveB: any = b.id === user.client_id;
        return isActiveB - isActiveA;
      });
    return activeClients;
  };
  const getPendingClients = () => {
    const pendingClients = user?.clients.filter(
      (client: any) =>
        client?.pivot?.status == 'W' || client?.pivot?.status == 'X',
    );
    return pendingClients;
  };
  return (
    <ModalFull title="Cambiar Condominio" open={open} onClose={onClose}>
      <ListFlat data={getActiveClients()} renderItem={renderItemActive} />
      {getPendingClients().length > 0 && (
        <>
          <Text
            style={{
              fontFamily: FONTS.regular,
              fontSize: 12,
              marginTop: 20,
              color: cssVar.cWhiteV2,
            }}>
            Estos son los condominios que están pendientes de aprobación por el
            administrador y tambien los que fueron rechazados.
          </Text>
          <ListFlat data={getPendingClients()} renderItem={renderItemPending} />
        </>
      )}
    </ModalFull>
  );
};

export default ChooseClient;
