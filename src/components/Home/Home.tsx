import React, { useEffect, useState, useContext, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import HeadDashboardTitle from '../HeadDashboardTitle/HeadDashboardTitle';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import Accesses from './Accesses/Accesses';
import Orders from './Orders/Orders';
import DropdawnAccess from './DropdawnAccess/DropdawnAccess';
import CameraQr from './CameraQr/CameraQr';

import { ThemeContext } from '../../../mk/contexts/ThemeContext';
import useApi from '../../../mk/hooks/useApi';
import { cssVar } from '../../../mk/styles/themes';
import { getFullName } from '../../../mk/utils/strings';
import DataSearch from '../../../mk/components/ui/DataSearch';
import useAuth from '../../../mk/hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  const [openSlide, setOpenSlide] = useState(true);
  const [data, setData]:any = useState([]);
  const [dataID, setDataID] = useState(0);
  const [search, setSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('I');
  const { theme } = useContext(ThemeContext);
  const { execute, loaded, reload } = useApi();

  // Función que obtiene la data según el tipo de búsqueda
  const getAccesses = async (searchParam: any = '', endpoint: string, fullType: string) => {
    const { data } = await execute(
      endpoint,
      'GET',
      {
        fullType,
        searchBy: searchParam || '',
        section: endpoint === '/others' ? 'HOME' : ''
      }
    );
    setData(data?.data || []);
  };

  // Actualizar data cuando cambia el tipo de búsqueda
  useEffect(() => {
    switch (typeSearch) {
      case 'I':
        getAccesses('', '/accesses', 'P');
        break;
      case 'A':
        getAccesses('', '/accesses', 'AD');
        break;
      case 'P':
        getAccesses('', '/others', 'L');
        break;
      default:
        console.log('Tipo de búsqueda no válido:', typeSearch);
        break;
    }
  }, [typeSearch]);

  // Filtrar la data según el término de búsqueda
  const filteredData = useMemo(() => {
    return data.filter((item:any) => {
      // Consideramos que puede venir en item.owner o item.visit
      const ownerName = item?.owner ? getFullName(item.owner).toLowerCase() : '';
      const visitName = item?.visit ? getFullName(item.visit).toLowerCase() : '';
      return ownerName.includes(search.toLowerCase()) || visitName.includes(search.toLowerCase());
    });
  }, [data, search]);

  const customTitle = () => (
    <View>
      <HeadDashboardTitle user={user} setOpenDropdown={() => {}} stop={false} theme={theme} />
    </View>
  );

  return (
    <>
      <Layout
        title="Home"
        customTitle={customTitle()}
        style={openSlide ? { paddingBottom: 40 } : { paddingBottom: 30 }}>
        <TabsButtons
          tabs={[
            { value: 'I', text: 'Pendientes' },
            { value: 'A', text: 'Accesos' },
            { value: 'P', text: 'Pedidos' },
          ]}
          sel={typeSearch}
          setSel={setTypeSearch}
          contentContainerStyles={styles.contentContainerTab}
          style={{ justifyContent: 'center', flex: 1, alignContent: 'center' }}
        />

        {/* Buscador */}

        <View style={styles.listContainer}>
        <DataSearch setSearch={setSearch} name="home" value={search} style={{marginBottom:8}}/>
          {(typeSearch === 'A' || typeSearch === 'I') && (
            <Accesses data={filteredData} reload={reload} setDataID={setDataID} />
          )}
          {typeSearch === 'P' && (
            <Orders data={filteredData} reload={reload} setDataID={setDataID} />
          )}
        </View>
      </Layout>
      <DropdawnAccess onPressQr={() => {}} onPressCiNom={() => {}} />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  contentContainerTab: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: cssVar.spL,
  },
});
