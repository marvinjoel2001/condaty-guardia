import {Fragment} from 'react';
import {Text, View, ScrollView, Dimensions, Platform} from 'react-native';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
// import Loading from '../../../../src/components/Animations/Loading';
import React from 'react';
import Skeleton from '../Skeleton/Skeleton';

interface PropsType {
  data: any;
  renderItem: (item: any) => any;
  children?: any;
  sepList?: (item: any) => any;
  keyExtractor?: (item: any) => any;
  onRefresh?: any;
  refreshing?: boolean;
  style?: TypeStyles;
  emptyLabel?: React.ReactNode; // Puede ser string, componente o elemento JSX
  // typeLoading?: 'access' | 'list'|"detail";
  skeletonType?: 'access' | 'list' | 'detail';
}

const List = (props: PropsType) => {
  const {
    data,
    children,
    renderItem,
    sepList,
    keyExtractor,
    onRefresh,
    refreshing,
    style,
    emptyLabel = 'No hay datos', // valor por defecto
    // typeLoading = '',
    skeletonType = 'list',
  } = props;

  const screen = Dimensions.get('window');

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  if (refreshing) {
    return (
      // <Loading
      //   type={typeLoading}
      //   skeletonType={skeletonType}
      //   title="Cargando..."
      // />
      <Skeleton
        type={skeletonType}
        // skeletonType={skeletonType}
      />
    );
  }

  if (!data || !data?.length || data.length === 0) {
    return typeof emptyLabel === 'string' ? (
      <View style={{...theme.emptyLabel, height: screen.height - 400}}>
        <Text style={theme.emptyLabelText}>{emptyLabel}</Text>
      </View>
    ) : (
      <View
        style={{
          ...theme.emptyLabel,
          height:
            Platform.OS == 'ios' ? screen.height - 250 : screen.height - 170,
        }}>
        {emptyLabel}
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        ...style,
      }}
      onScroll={({nativeEvent}) => {
        if (isCloseToBottom(nativeEvent)) {
          if (onRefresh) onRefresh();
        }
      }}
      scrollEventThrottle={400}>
      {data?.map((item: any, idx: number) => (
        <Fragment key={keyExtractor ? keyExtractor(item) : item.id || idx}>
          {sepList && sepList(item)}
          {renderItem(item)}
        </Fragment>
      ))}
      {children}
    </ScrollView>
  );
};

export default List;

const theme: ThemeType = {
  emptyLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLabelText: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.semiBold,
    textAlign: 'left',
    fontSize: cssVar.sM,
  },
};
