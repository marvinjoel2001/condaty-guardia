import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import useApi from '../../../mk/hooks/useApi';
import Accesses from './Accesses/Accesses';
import {Orders} from './Orders/Orders';
import QR from './QR/QR';
import WithoutQR from './WithoutQR/WithoutQR';

const History = () => {
  const [tab, setTab] = useState('A');

  return (
    <Layout title="Historial" scroll={false}>
      <TabsButtons
        style={{marginVertical: 12}}
        tabs={[
          {value: 'A', text: 'Accesos'},
          {value: 'Q', text: 'QR'},
          {value: 'WQ', text: 'Sin QR'},
          {value: 'P', text: 'Pedidos'},
        ]}
        sel={tab}
        setSel={setTab}
      />

      {tab === 'A' && <Accesses />}
      {tab === 'Q' && <QR />}
      {tab === 'WQ' && <WithoutQR />}
      {tab === 'P' && <Orders />}
    </Layout>
  );
};

export default History;
