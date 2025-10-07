import React, {Fragment, useRef} from 'react';
import {FlatList, View} from 'react-native';
import {TypeStyles} from '../../../styles/themes';
import useAuth from '../../../hooks/useAuth';
import Skeleton from '../Skeleton/Skeleton';

// Footer component extracted to top-level to satisfy lint rules
const RenderFooterComponent = ({loading, skeletonType, mapSkeletonType}: any) => {
  if (!loading) return null;
  return (
    <View style={{paddingVertical: 4}}>
      <Skeleton type={mapSkeletonType(skeletonType)} />
    </View>
  );
};

interface PropsType {
  data: any;
  renderItem: (item: any, index?: number) => any;
  sepList?: (item: any) => any;
  keyExtractor?: (item: any) => any;
  onRefresh?: any;
  refreshing?: boolean;
  style?: TypeStyles;
  emptyLabel?: React.ReactNode; // Puede ser string, componente o elemento JSX
  typeLoading?: 'loading' | 'skeleton';
  skeletonType?:
    | 'media'
    | 'survey'
    | 'event'
    | 'access'
    | 'list'
    | 'detail';
  onPagination?: any;
  total?: number;
  loading?: boolean;
}

const ListFlat = (props: PropsType) => {
  const {
    data,
    renderItem,
    sepList,
    keyExtractor,
    onRefresh = () => {},
    refreshing = false,
    style,
    emptyLabel = 'No hay datos', // valor por defecto
    typeLoading = 'loading',
    skeletonType = 'media',
    onPagination = undefined,
    total = undefined,
    loading = false,
  } = props;

  const {setStore} = useAuth();
  const scrollOffset = useRef(0);
  const handleScroll = ({nativeEvent}: any) => {
    scrollOffset.current = nativeEvent.contentOffset.y;
    setStore({onScroll: nativeEvent.contentOffset.y});
  };

  const mapSkeletonType = (t: any) => {
    switch (t) {
      case 'survey':
      case 'media':
      case 'list':
        return 'list';
      case 'event':
      case 'detail':
        return 'detail';
      case 'access':
        return 'access';
      default:
        return 'list';
    }
  };

  if (refreshing) {
    return (
      <View style={{paddingTop: 4}}>
        <Skeleton type={mapSkeletonType(skeletonType)} />
      </View>
    );
  }

  // If we're loading and there's no data yet, show the main skeleton (initial load)
  if (loading && (!data || (Array.isArray(data) && data.length === 0))) {
    return (
      <View style={{paddingTop: 4}}>
        <Skeleton type={mapSkeletonType(skeletonType)} />
      </View>
    );
  }

  

  return (
      <FlatList
        // ref={refFlatList}
        id="ListFlatlist"
        testID="ListFlatlist"
        nativeID="ListFlatlist"
        data={data}
        contentContainerStyle={[style, {paddingBottom: 24, paddingHorizontal: 12}]}
        keyExtractor={(item, idx) =>
          keyExtractor ? keyExtractor(item) : `news-index-${idx}`
        }
        renderItem={({item, index}) => (
          <Fragment key={index}>
            {sepList?.(item)}
            {renderItem(item, index)}
          </Fragment>
        )}
  // renderItem memoization removed for now
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
  // children/list footer can be passed via props if needed
        initialNumToRender={5}
        // initialNumToRender={10}
        // windowSize={5}
        maxToRenderPerBatch={5}
        windowSize={21} // Optimiza el tamaño de la ventana de renderizado
        // maxToRenderPerBatch={20}
        // snapToAlignment={undefined}
        // snapToInterval={Dimensions.get("window").height}
        // decelerationRate="normal"
        decelerationRate={0.5}
        onEndReached={onPagination} // Llamado al llegar al final
        onEndReachedThreshold={2} // Disparar cuando quede 50% del contenido
        ListFooterComponent={
          <RenderFooterComponent
            loading={loading}
            skeletonType={skeletonType}
            mapSkeletonType={mapSkeletonType}
          />
        } // Mostrar indicador de carga
        refreshing={refreshing}
        onRefresh={onRefresh} // Llamado al deslizar hacia abajo
        // removeClippedSubviews={false} // Asegura que los elementos no se desmonten fuera de pantalla
        // removeClippedSubviews={true}
        // windowSize={20} // Tamaño de la ventana de renderizado
        legacyImplementation={true}
        updateCellsBatchingPeriod={50}
      />
  );
};

export default ListFlat;
