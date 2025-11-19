import React, {memo, useCallback, useRef} from 'react';
import {FlatList, RefreshControl, View, Text, StyleSheet} from 'react-native';
import {cssVar, TypeStyles, FONTS} from '../../../styles/themes';
import useAuth from '../../../hooks/useAuth';
import Skeleton, {PropsTypeSkeleton} from '../Skeleton/Skeleton';

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
  emptyLabel?: React.ReactNode | string;
  typeLoading?: 'loading' | 'skeleton';
  skeletonType?: PropsTypeSkeleton['type'];
  onPagination?: () => void;
  total?: number;
  loading?: boolean;
  removeClippedSubviews?: boolean;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  iconEmpty?: React.ReactNode;
  stopPagination?: boolean;
  setParams?: (params: any) => void;
  enablePagination?: boolean;
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
    emptyLabel = 'No hay datos',
    // onPagination,
    loading = false,
    removeClippedSubviews = false,
    initialNumToRender = 10,
    windowSize = 5,
    maxToRenderPerBatch = 10,
    iconEmpty,
    stopPagination = false,
    setParams,
    enablePagination = true,
    // getItemLayout,
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

  const ListHeaderComponent =
    loading && data?.length === 0 ? <Skeleton type={skeletonType} /> : null;

  // Permitir que el paddingBottom de style sobrescriba el valor por defecto
  const mergedContentContainerStyle = [
    {paddingBottom: 24},
    style && (typeof style === 'object' ? style : {}),
  ];
  const onPagination = () => {
    if (loading || stopPagination) {
      return;
    }
    setParams?.((prev: any) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };
  return (
    <FlatList
      testID="ListFlatlist"
      data={data}
      style={style as any}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={mergedContentContainerStyle}
      keyExtractor={getItemKey}
      renderItem={renderItemMemo}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      updateCellsBatchingPeriod={30}
      onEndReached={enablePagination ? onPagination : undefined}
      onEndReachedThreshold={0.8}
      ListFooterComponent={
        <RenderFooterComponent loading={loading} skeletonType={skeletonType} />
      }
      refreshControl={onRefresh ? refreshControl() : undefined}
      ListEmptyComponent={() =>
        data?.length === 0 ? (
          <View style={styles.emptyLabelContainer}>
            {iconEmpty && iconEmpty}
            <Text style={styles.emptyLabelText}>{emptyLabel}</Text>
          </View>
        ) : null
      }
    />
  );
});

ListFlat.displayName = 'ListFlat';

export default ListFlat;

const styles = StyleSheet.create({
  emptyLabelContainer: {
    paddingHorizontal: 16,
    marginTop: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLabelText: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    fontSize: cssVar.sM,
  },
});
