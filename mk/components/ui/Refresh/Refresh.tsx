import {useState} from 'react';
import {RefreshControl, ScrollView} from 'react-native';
import {cssVar} from '../../../styles/themes';
interface TypeProps {
  children: any;
  reload: any;
  onScroll?: any;
  ref?: any;
}

const Refresh = ({children, reload, onScroll, ref}: TypeProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ScrollView
      ref={ref}
      style={{}}
      onScroll={onScroll}
      refreshControl={
        <RefreshControl
          progressBackgroundColor={cssVar.cBlack}
          colors={[cssVar.cAccent]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={cssVar.cAccent}
        />
      }>
      {children}
    </ScrollView>
  );
};

export default Refresh;
