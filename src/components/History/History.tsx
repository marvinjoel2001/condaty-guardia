import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import useApi from '../../../mk/hooks/useApi';
import Accesses from './Accesses/Accesses';
import Invitations from './Invitations/Invitations';
import {Orders} from './Orders/Orders';
import {useFocusEffect} from '@react-navigation/native';

const History = () => {
  const [tab, setTab] = useState('A');
  const [_tab, set_tab] = useState('A');
  const [data, setData]: any = useState([]);
  const {execute} = useApi();
  const [loaded, setLoaded] = useState(false);

  const getHistory = async (
    searchParam: any = '',
    endpoint: string,
    fullType: string,
  ) => {
    setLoaded(true);
    setData([]);
    try {
      const {data} = await execute(endpoint, 'GET', {
        perPage: -1,
        page: 1,
        fullType,
        section: 'ACT',
      });
      setData(data?.data || []);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoaded(false);
    }
  };

  useEffect(() => {
    switch (tab) {
      case 'A':
        getHistory('', '/accesses', 'L');
        break;
      case 'I':
        getHistory('', '/invitations', 'L');
        break;
      case 'P':
        getHistory('', '/others', 'L');
        break;
      default:
        console.log('Tipo de búsqueda no válido:', tab);
        break;
    }
    set_tab(tab);
  }, [tab]);
  return (
    <Layout
      title="Historial"
      refresh={() =>
        tab == 'A'
          ? getHistory('', '/accesses', 'L')
          : tab == 'I'
          ? getHistory('', '/invitations', 'L')
          : tab == 'P'
          ? getHistory('', '/others', 'L')
          : console.log('Tipo de búsqueda no válido:', tab)
      }>
      <TabsButtons
        tabs={[
          {value: 'A', text: 'Accesos'},
          {value: 'I', text: 'Invitaciones'},
          {value: 'P', text: 'Pedidos'},
        ]}
        sel={tab}
        setSel={setTab}
      />

      {_tab === 'A' && <Accesses data={data} loaded={loaded} />}
      {_tab === 'I' && <Invitations data={data} loaded={loaded} />}
      {_tab === 'P' && <Orders data={data} loaded={loaded} />}
    </Layout>
  );
};

export default History;
