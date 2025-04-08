import React, {useState} from 'react';
import {Text, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconDownload,
  IconGroupsQr,
  IconSingleQr,
} from '../../../icons/IconLibrary';
import {cssVar} from '../../../../mk/styles/themes';
import InvitationDetail from './InvitationDetail';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import {openLink} from '../../../../mk/utils/utils';

type Props = {
  data: any;
  loaded: boolean;
};

const Invitations = ({data, loaded}: Props) => {
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const {execute} = useApi();
  const [search, setSearch] = useState('');

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
    if (search && search !== '') {
      if (
        !getFullName(item?.visit)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        !getFullName(item?.owner).toLowerCase().includes(search.toLowerCase())
      ) {
        return null;
      }
    }
    return (
      <ItemList
        onPress={() => setOpenDetail({open: true, id: item.id})}
        title={title(item)}
        subtitle={subtitle(item)}
        left={left(item)}
      />
    );
  };

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const onExport = async () => {
    const {data: file} = await execute('/invitations', 'GET', {
      perPage: -1,
      page: 1,
      fullType: 'L',
      section: 'ACT',
      _export: 'pdf',
    });
    if (file?.success == true) {
      openLink(getUrlImages('/' + file?.data.path));
    }
  };

  return (
    <View style={{paddingHorizontal: 16}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}>
        <DataSearch
          setSearch={(value: string) => onSearch(value)}
          name="invitations"
          value={search}
          style={{flex: 1}}
        />
        <Icon
          name={IconDownload}
          onPress={onExport}
          fillStroke={cssVar.cWhiteV2}
          color={'transparent'}
        />
      </View>
      <List data={data} renderItem={renderItem} refreshing={loaded} />
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
