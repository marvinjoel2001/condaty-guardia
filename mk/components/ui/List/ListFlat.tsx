import React, {memo, useCallback, useRef} from 'react';
import {FlatList, RefreshControl, View, Text, Dimensions, Platform} from 'react-native';
import {cssVar, TypeStyles, FONTS} from '../../../styles/themes';
import useAuth from '../../../hooks/useAuth';
import Skeleton, {PropsTypeSkeleton} from '../Skeleton/Skeleton';

// Memoiza el footer para evitar re-renders innecesarios
const RenderFooterComponent = memo(
  ({
    loading,
    skeletonType,
  }: {
    loading: boolean;
    skeletonType: PropsTypeSkeleton['type'];
  }) => {
    if (!loading) return null;
    return (
      <View style={{paddingVertical: 4}}>
        <Skeleton type={skeletonType} />
      </View>
    );
  },
);

RenderFooterComponent.displayName = 'RenderFooterComponent';

interface PropsType {
  data: any[];
  renderItem: (item: any, index?: number) => any;
  sepList?: (item: any) => any;
  keyExtractor?: (item: any, index: number) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
  style?: TypeStyles;
  emptyLabel?: React.ReactNode;
  typeLoading?: 'loading' | 'skeleton';
  skeletonType?: PropsTypeSkeleton['type'];
  onPagination?: () => void;
  total?: number;
  loading?: boolean;
}

const ListFlat = memo((props: PropsType) => {
  const {
    data,
    renderItem,
    sepList,
    keyExtractor,
    onRefresh,
    refreshing = false,
    style,
    skeletonType = 'list',
    emptyLabel,
    onPagination,
    loading = false,
  } = props;

  const {setStore} = useAuth();
  const scrollOffsetRef = useRef(0);

  // Memoiza el handler de scroll
  const handleScroll = useCallback(
    ({nativeEvent}: any) => {
      const offset = nativeEvent.contentOffset.y;
      scrollOffsetRef.current = offset;
      setStore({onScroll: offset});
    },
    [setStore],
  );

  // Memoiza el keyExtractor
  const getItemKey = useCallback(
    (item: any, index: number) =>
      keyExtractor ? keyExtractor(item, index) : `item-${index}`,
    [keyExtractor],
  );

  // Memoiza el renderItem
  const renderItemMemo = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const separator = sepList?.(item);
      const content = renderItem(item, index);

      if (separator) {
        return (
          <>
            {separator}
            {content}
          </>
        );
      }
      return content;
    },
    [renderItem, sepList],
  );

  // Memoiza el RefreshControl
  const refreshControl = useCallback(
    () => (
      <RefreshControl
        progressBackgroundColor={cssVar.cBlack}
        colors={[cssVar.cAccent]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={cssVar.cAccent}
      />
    ),
    [refreshing, onRefresh],
  );

  // Estados de carga inicial
  if (refreshing && (!data || data.length === 0)) {
    return (
      <View style={{paddingTop: 4}}>
        <Skeleton type={skeletonType} />
      </View>
    );
  }

  if (loading && (!data || data.length === 0)) {
    return (
      <View style={{paddingTop: 4}}>
        <Skeleton type={skeletonType} />
      </View>
    );
  }

  const screen = Dimensions.get('window');

  // If there's no data, render the emptyLabel similarly to List.tsx
  if (!data || !data?.length || data.length === 0) {
    return typeof emptyLabel === 'string' ? (
      <View style={{justifyContent: 'center', alignItems: 'center', height: screen.height - 400}}>
        <Text style={{color: cssVar.cWhiteV1, fontFamily: FONTS.semiBold, textAlign: 'left', fontSize: cssVar.sM}}>{emptyLabel}</Text>
      </View>
    ) : (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: Platform.OS == 'ios' ? screen.height - 250 : screen.height - 170,
        }}>
        {emptyLabel}
      </View>
    );
  }

  return (
    <FlatList
      testID="ListFlatlist"
      data={data}
      contentContainerStyle={[style, {paddingBottom: 24}]}
      keyExtractor={getItemKey}
      renderItem={renderItemMemo}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      initialNumToRender={30}
      maxToRenderPerBatch={50}
      windowSize={20}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      onEndReached={onPagination}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        <RenderFooterComponent loading={loading} skeletonType={skeletonType} />
      }
      refreshControl={refreshControl()}
      ListEmptyComponent={() =>
        emptyLabel ? (
          <View style={{padding: 16, alignItems: 'center'}}>
            {typeof emptyLabel === 'string' ? (
              <Text style={{color: cssVar.cWhiteV1}}>{emptyLabel}</Text>
            ) : (
              emptyLabel
            )}
          </View>
        ) : null
      }
      getItemLayout={undefined} // Añade esto si tus items tienen altura fija
    />
  );
});

ListFlat.displayName = 'ListFlat';

export default ListFlat;
