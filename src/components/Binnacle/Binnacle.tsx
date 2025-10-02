import React, {useState, useEffect} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import DataSearch from '../../../mk/components/ui/DataSearch';
import ListFlat from '../../../mk/components/ui/List/ListFlat';
import useApi from '../../../mk/hooks/useApi';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import IconFloat from '../../../mk/components/ui/IconFLoat/IconFloat';
import BinnacleAdd from './BinnacleAdd';
import BinnacleDetail from './BinnacleDetail';
import { getDateTimeStrMes} from '../../../mk/utils/dates';

const Binnacle = () => {
  const paramsInitial = {
    fullType: 'L',
    perPage: 20,
    page: 1,
  };

  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({open: false, id: null});
  const [search, setSearch] = useState('');
  const [params, setParams] = useState(paramsInitial);

  const {
    data: binnacleData,
    reload: reloadBinnacle,
    loaded,
  } = useApi('/guardnews', 'GET', params, 3);

  // Cargar cada vez que cambian los parámetros (evita acumulaciones y duplicados)
  useEffect(() => {
    reloadBinnacle(params);
  }, [params]);

  const onPagination = () => {
    const total = binnacleData?.message?.total || 0;
    const currentLength = binnacleData?.data?.length || 0;
    const maxPage = Math.ceil(total / params.perPage);

    if (currentLength >= total || params.page >= maxPage || !loaded) {
      return;
    }

    setParams(prev => ({
      ...prev,
      perPage: prev.perPage + 20, // solo incrementa perPage y recarga via useEffect
    }));
  };

  const handleReload = () => {
    setParams(paramsInitial); // useEffect recargará automáticamente
  };

  const novedadList = (novedad: any) => {
    if (
      search != '' &&
      (novedad.descrip + '').toLowerCase().indexOf(search.toLowerCase()) == -1
    )
      return null;
    return (
      <ItemList
        onPress={() => setOpenView({open: true, id: novedad.id})}
        title={novedad.descrip}
        subtitle={getDateTimeStrMes(novedad?.created_at)}
      />
    );
  };

  const onSearch = (search: string) => {
    setSearch(search);
  };

  return (
    <>
      <Layout title="Bitácora" scroll={false} style={{paddingHorizontal: 0}}>
        <DataSearch
          setSearch={onSearch}
          name="Bitácora"
          style={{
            marginTop: 12,
            marginHorizontal: 12,
            marginBottom: 4,
          }}
          value={search}
        />
        <ListFlat
          data={binnacleData?.data}
          renderItem={novedadList}
          skeletonType="survey"
          refreshing={!loaded && params.perPage === 20}
          emptyLabel="No hay datos en la bitácora"
          onRefresh={handleReload}
          loading={!loaded && params.perPage > 20}
          onPagination={onPagination}
          total={binnacleData?.message?.total || 0}

        />

        {openAdd && (
          <BinnacleAdd
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            reload={handleReload}
          />
        )}
        {openView.open && (
          <BinnacleDetail
            open={openView.open}
            onClose={() => setOpenView({open: false, id: null})}
            id={openView?.id}
          />
        )}
      </Layout>
      {!openAdd && <IconFloat onPress={() => setOpenAdd(true)} />}
    </>
  );
};

export default Binnacle;
