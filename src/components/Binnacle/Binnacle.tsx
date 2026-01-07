import React, { useState, useEffect } from 'react';
import Layout from '../../../mk/components/layout/Layout';
import DataSearch from '../../../mk/components/ui/DataSearch';
import ListFlat from '../../../mk/components/ui/List/ListFlat';
import useApi from '../../../mk/hooks/useApi';
import ItemList from '../../../mk/components/ui/ItemList/ItemList';
import IconFloat from '../../../mk/components/ui/IconFLoat/IconFloat';
import BinnacleAdd from './BinnacleAdd';
import BinnacleDetail from './BinnacleDetail';
import { getDateTimeStrMes } from '../../../mk/utils/dates';

const Binnacle = () => {
  const paramsInitial = {
    fullType: 'L',
    perPage: 20,
    page: 1,
    searchBy: '',
  };

  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({ open: false, id: null });
  const [search, setSearch] = useState('');
  const [params, setParams] = useState(paramsInitial);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const {
    data: binnacleData,
    reload: reloadBinnacle,
    loaded,
  } = useApi('/guardnews', 'GET', params);

  useEffect(() => {
    if (binnacleData?.data) {
      if (params.page === 1) {
        setAccumulatedData(binnacleData.data);
      } else {
        setAccumulatedData(prev => [...prev, ...binnacleData.data]);
      }
    }
  }, [binnacleData?.data]);

  useEffect(() => {
    reloadBinnacle(params);
  }, [params]);

  const handleReload = () => {
    setParams(paramsInitial);
    setAccumulatedData([]);
  };

  const novedadList = (novedad: any) => {
    return (
      <ItemList
        onPress={() => setOpenView({ open: true, id: novedad.id })}
        title={novedad.descrip}
        subtitle={getDateTimeStrMes(novedad?.created_at)}
      />
    );
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setAccumulatedData([]);
    if (value == '') {
      setParams(paramsInitial);
      return;
    }
    setParams({
      ...params,
      page: 1,
      searchBy: value,
    });
  };
  return (
    <>
      <Layout title="Bitácora" scroll={false}>
        <DataSearch
          setSearch={onSearch}
          name="Bitácora"
          style={{
            marginTop: 12,

            marginBottom: 4,
          }}
          value={search}
        />
        <ListFlat
          data={accumulatedData}
          renderItem={novedadList}
          refreshing={params.page === 1 && !loaded}
          emptyLabel="No hay datos en la bitácora"
          onRefresh={handleReload}
          loading={!loaded}
          setParams={setParams}
          stopPagination={
            binnacleData?.message?.total == -1 &&
            binnacleData?.data?.length < params.perPage
          }
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
            onClose={() => setOpenView({ open: false, id: null })}
            id={openView?.id}
          />
        )}
      </Layout>
      {!openAdd && <IconFloat onPress={() => setOpenAdd(true)} />}
    </>
  );
};

export default Binnacle;
