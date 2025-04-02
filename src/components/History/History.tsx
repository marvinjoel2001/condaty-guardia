import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import useApi from '../../../mk/hooks/useApi';
import Accesses from './Accesses/Accesses';
import Invitations from './Invitations/Invitations';
import {Orders} from './Orders/Orders';

const History = () => {
  const [tab, setTab] = useState('A');
  const [data, setData] = useState([]);
  const {execute} = useApi();
  const getHistory = async (
    searchParam: any = '',
    endpoint: string,
    fullType: string,
  ) => {
    const {data, reload} = await execute(endpoint, 'GET', {
      perPage: -1,
      page: 1,
      fullType,
      section: 'ACT',
    });
    setData(data?.data || []);
  };

  useEffect(() => {
    switch (tab) {
      case 'A':
        getHistory('', '/accesses', 'L');
        setData([]);
        break;
      case 'I':
        getHistory('', '/invitations', 'L');
        setData([]);
        break;
      case 'P':
        getHistory('', '/others', 'L');
        setData([]);
        break;
      default:
        console.log('Tipo de búsqueda no válido:', tab);
        break;
    }
  }, [tab]);
  return (
    <Layout title="Historial">
      <TabsButtons
        tabs={[
          {value: 'A', text: 'Accesos'},
          {value: 'I', text: 'Invitaciones'},
          {value: 'P', text: 'Pedidos'},
        ]}
        sel={tab}
        setSel={setTab}
      />
      {tab === 'A' && <Accesses data={data} />}
      {tab === 'I' && <Invitations data={data} />}
      {tab === 'P' && <Orders data={data} />}
    </Layout>
  );
};

export default History;
