import React, {useState} from 'react';
import {View} from 'react-native';
import {getFullName} from '../../../../mk/utils/strings';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import AccessDetail from './AccessDetail';
import DateAccess from '../DateAccess/DateAccess';
import useApi from '../../../../mk/hooks/useApi';

type Props = {
  data: any;
  loaded: boolean;
};
const Accesses = ({data, loaded}: Props) => {
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const renderItem = (item: any) => {
    return (
      <ItemList
        onPress={() => {
          setOpenDetail({
            open: true,
            id: item?.access_id ? item?.access_id : item.id,
          });
        }}
        key={item.id}
        title={getFullName(item?.visit)}
        subtitle={'Visitó a ' + getFullName(item?.owner)}
        left={<Avatar name={getFullName(item?.visit)} />}
        children={<DateAccess access={item} />}
      />
    );
  };

  return (
    <View style={{paddingHorizontal: 16}}>
      <List
        data={data}
        renderItem={renderItem}
        refreshing={loaded}
        skeletonType="access"
      />
      {openDetail?.open && (
        <AccessDetail
          open={openDetail?.open}
          onClose={() => setOpenDetail({open: false, id: null})}
          id={openDetail?.id}
        />
      )}
    </View>
  );
};

export default Accesses;
