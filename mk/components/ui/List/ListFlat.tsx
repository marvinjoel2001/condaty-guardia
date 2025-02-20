import React, {Fragment, useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import {TypeStyles, cssVar} from '../../../styles/themes';
import useAuth from '../../../hooks/useAuth';
// import Loading from '../../../../src/components/Animations/Loading';

interface PropsType {
  data: any;
  renderItem: (item: any, index?: number) => any;
  children?: any;
  sepList?: (item: any) => any;
  keyExtractor?: (item: any) => any;
  onRefresh?: any;
  refreshing?: boolean;
  style?: TypeStyles;
  emptyLabel?: React.ReactNode; // Puede ser string, componente o elemento JSX
  typeLoading?: 'loading' | 'skeleton';
  skeletonType?: 'media' | 'survey' | 'event';
  onPagination?: any;
  total?: number;
  loading?: boolean;
}

const ListFlat = (props: PropsType) => {
  const {
    data,
    children,
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

  const {setStore, store} = useAuth();
  const refFlatList = useRef(null);

  const scrollOffset = useRef(0);

  const handleScroll = ({nativeEvent}: any) => {
    scrollOffset.current = nativeEvent.contentOffset.y;
    setStore({onScroll: nativeEvent.contentOffset.y});
  };

  // useEffect(() => {
  //   setStore({onFlatRef: refFlatList});
  // }, [refFlatList]);

  if (refreshing) {
    return (
      <View style={{paddingTop: 100}}>
        {/* <Loading
          type={typeLoading}
          skeletonType={skeletonType}
          title="Cargando..."
        /> */}
        <Text>Cargando..</Text>
      </View>
    );
  }
  // console.log(total, data.length, loading);
  const RenderFooter = () => {
    if (!loading) return null;
    return (
      // <ActivityIndicator
      //   size="large"
      //   color={cssVar.cPrimary}
      //   style={{margin: 10}}
      // />
      <View>
        {/* <Loading
          type={typeLoading}
          skeletonType={skeletonType}
          title="Cargando..."
        /> */}
        <Text>Cargando...</Text>
      </View>
    );
  };
  // const MemoizedRenderItem = React.memo(({item, index}: any) => (
  //   <>
  //     {sepList && sepList(item)}
  //     {renderItem(item, index)}
  //   </>
  // ));

  return (
    <>
      <FlatList
        // ref={refFlatList}
        id="ListFlatlist"
        testID="ListFlatlist"
        nativeID="ListFlatlist"
        data={data}
        contentContainerStyle={[style, {paddingBottom: 60, paddingTop: 50}]}
        keyExtractor={(item, idx) => `news-index-${idx}`}
        renderItem={({item, index}) => (
          <Fragment key={index}>
            {sepList && sepList(item)}
            {renderItem(item, index)}
          </Fragment>
        )}
        // renderItem={({item, index}) => (
        //   <MemoizedRenderItem item={item} index={index} />
        // )}
        // refreshControl={
        //   <RefreshControl
        //     progressBackgroundColor={cssVar.cBlack}
        //     colors={[cssVar.cAccent]}
        //     refreshing={refreshing}
        //     onRefresh={() => {
        //       onRefresh();
        //     }}
        //     tintColor={cssVar.cAccent}
        //   />
        // }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={style}
        // ListFooterComponent={children}
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
        ListFooterComponent={<RenderFooter />} // Mostrar indicador de carga
        refreshing={refreshing}
        onRefresh={onRefresh} // Llamado al deslizar hacia abajo
        // removeClippedSubviews={false} // Asegura que los elementos no se desmonten fuera de pantalla
        // removeClippedSubviews={true}
        // windowSize={20} // Tamaño de la ventana de renderizado
        legacyImplementation={true}
        updateCellsBatchingPeriod={50}
      />
    </>
  );
};

export default ListFlat;
