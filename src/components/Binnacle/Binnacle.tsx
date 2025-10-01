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
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({open: false, item: null});
  const [search, setSearch] = useState('');
  const [params, setParams] = useState({
    fullType: 'L',
    perPage: 20,
    page: 1,
  });
  const [allData, setAllData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const {data, reload, loaded, execute} = useApi(
    '/guardnews',
    'GET',
    params,
    3,
  );


  useEffect(() => {
    if (data && loaded) {
      if (params.perPage === 20) {
        setAllData(data.data || []);
        setTotalItems(data.message?.total || 0);
      } else {
        // Carga de páginas adicionales (cuando perPage > 20)
        setAllData(prevData => [...prevData, ...(data.data || [])]);
      }
    }
  }, [data, loaded, params.perPage]);

  const onPagination = () => {
    if (allData.length >= totalItems) {
      console.log('No more data to load');
      return;
    }

    console.log('🚀 Loading next page...');
    setParams(prevParams => ({
      ...prevParams,
      perPage: prevParams.perPage + 20,
    }));
  };

  const handleReload = () => {
    setParams({
      fullType: 'L',
      perPage: 20,
      page: 1,
    });
    setAllData([]);
    setTotalItems(0);
  };

  const novedadList = (novedad: any) => {
    if (
      search != '' &&
      (novedad.descrip + '').toLowerCase().indexOf(search.toLowerCase()) == -1
    )
      return null;
    return (
      <ItemList
        onPress={() => setOpenView({open: true, item: novedad})}
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
          style={{marginVertical: 6}}
          value={search}
        />
        <ListFlat
          data={allData}
          renderItem={novedadList}
          skeletonType="survey"
          refreshing={!loaded && params.perPage === 20}
          emptyLabel="No hay datos en la bitácora"
          onRefresh={handleReload}
          loading={!loaded && params.perPage > 20}
          onPagination={onPagination}
          total={totalItems}

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
            onClose={() => setOpenView({open: false, item: null})}
            item={openView?.item}
          />
        )}
      </Layout>
      {!openAdd && <IconFloat onPress={() => setOpenAdd(true)} />}
    </>
  );
};

export default Binnacle;
