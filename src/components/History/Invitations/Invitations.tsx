import React, {useState} from 'react';
import {Text, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName} from '../../../../mk/utils/strings';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconGroupsQr, IconSingleQr} from '../../../icons/IconLibrary';
import {cssVar} from '../../../../mk/styles/themes';
import InvitationDetail from './InvitationDetail';

type Props = {
  data: any;
};

const Invitations = ({data}: Props) => {
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const left = (item: any) => {
    let name = IconSingleQr;
    if (item.type == 'G') name = IconGroupsQr;
    return (
      <View
        style={{
          backgroundColor: cssVar.cWhite,
          padding: 8,
          borderRadius: '100%',
        }}>
        <Icon name={name} color={'transparent'} fillStroke={cssVar.cBlack} />
      </View>
    );
  };

  const title = (item: any) => {
    let title = `${getFullName(item.visit)}`;
    if (item.type == 'G') title = `Evento: ${item?.title}`;
    return <Text>{title}</Text>;
  };
  const subtitle = (item: any) => {
    let subtitle = `Invitado por: ${getFullName(item.owner)}`;
    if (item.type == 'G') subtitle = `Creado por: ${getFullName(item.owner)}`;
    return <Text>{subtitle}</Text>;
  };
  const renderItem = (item: any) => {
    return (
      <ItemList
        onPress={() => setOpenDetail({open: true, id: item.id})}
        title={title(item)}
        subtitle={subtitle(item)}
        left={left(item)}
      />
    );
  };
  return (
    <View style={{paddingHorizontal: 16}}>
      <List data={data} renderItem={renderItem} />
      {openDetail?.open && (
        <InvitationDetail
          open={openDetail.open}
          onClose={() => setOpenDetail({open: false, id: null})}
          id={openDetail?.id}
        />
      )}
    </View>
  );
};

export default Invitations;
