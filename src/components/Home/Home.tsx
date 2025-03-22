import {StyleSheet, Text, View} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import React, {useContext, useEffect, useState} from 'react';
import useAuth from '../../../mk/hooks/useAuth';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {useNavigation} from '@react-navigation/native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {
  IconDelivery,
  IconGenericQr,
  IconNoQr,
  IconOther,
  IconTaxi,
} from '../../icons/IconLibrary';
import DropdawnAccess from './DropdawnAccess/DropdawnAccess';
import CameraQr from './CameraQr/CameraQr';
import HeadDashboardTitle from '../HeadDashboardTitle/HeadDashboardTitle';
import {ThemeContext} from '../../../mk/contexts/ThemeContext';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import Accesses from './Accesses/Accesses';
import ItemListDate from './Accesses/shares/ItemListDate';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';

import useApi from '../../../mk/hooks/useApi';
import DetOrders from './Orders/DetOrders';
import Orders from './Orders/Orders';


const Home = () => {
  const [formstate, setFormState]: any = useState({});
  const [openSlide, setOpenSlide] = useState(true);
  const [apiPendientes, setApiPendientes] = useState<any>(null);
  const [typeSearch, setTypeSearch] = useState('I');
  const navigate: any = useNavigation();
  const {logout, user} = useAuth();
  const [openCamera, setOpenCamera] = useState(false);
  const [openCiNom, setOpenCiNom] = useState(false);
  const [setOpenDropdown] = useState(false);
  let stop = false;
  const {theme} = useContext(ThemeContext);
  const {execute, loaded , reload} = useApi();
  const [data, setData] = useState([]);
  const [dataID,setDataID] = useState(0);

  const getAccesses = async ( search: any = '',endpoint:string, fullType:string  ) => {
    const {data} = await execute(
      endpoint,
      'GET',
      {
        fullType,
        searchBy: search || '',
        section: endpoint === '/others'? 'HOME' : ''
      },
      //  false,3
    );
    setData(data?.data || []);
  };

  const customTitle = () => {
    return (
      <View>
        <HeadDashboardTitle
          user={user}
          setOpenDropdown={setOpenDropdown}
          stop={stop}
          theme={theme}
        />
      </View>
    );
  };

  useEffect(() => {
    switch (typeSearch) {
      case 'I':
        getAccesses('','/accesses','P');
        break;
      case 'A':
        getAccesses('','/accesses','AD');
        break;
      case 'P':
        getAccesses('','/others','L');
        break;
      default:
        console.log('typeSercg no valido', typeSearch);
        break;
    }
  }, [typeSearch]);

  //  useEffect(()=>{
  //   console.log(dataID,'did')
  //    const fetchData = async () => {
  //      await getAccesses(dataID);
  //    };
  //    fetchData();
     
  
  //  },[dataID])
  return (
    <>
      <Layout
        title="Home"
        customTitle={customTitle()}
        style={openSlide ? {paddingBottom: 40} : {paddingBottom: 30}}>
        <TabsButtons
          tabs={[
            {value: 'I', text: 'Pendientes'},
            {value: 'A', text: 'Accesos'},
            {value: 'P', text: 'Pedidos'},
          ]}
          sel={typeSearch}
          setSel={setTypeSearch}
          contentContainerStyles={styles.contentContainerTab}
          style={{
            justifyContent: 'center',
            flex: 1,
            alignContent: 'center',
          }}
        />
        {/* {typeSearch === "I" && apiPendientes?.data && (
          <Accesses
            parametros={paramsAccesos}
            api={{
              ...apiPendientes,
              loaded: apiAccesos.loaded,
              reload: apiAccesos.reload,
            }}
            screenParams={screenParams}
            lista={apiAccesos?.data?.data}
            isHome={true}
            edit={true}
          />
        )} */}
      <View style={styles.listContainer}>
        {typeSearch === 'A' || typeSearch === 'I' && <Accesses data={data} reload={reload} setDataID={setDataID} />}
        {typeSearch === 'P' && <Orders data={data} reload={reload} setDataID={setDataID} />}
      </View>
        {openCamera && (
          <CameraQr open={openCamera} onClose={() => setOpenCamera(false)} />
        )}
      </Layout>
      <DropdawnAccess
        onPressQr={() => setOpenCamera(true)}
        onPressCiNom={() => {}}
      />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  contentContainerTab: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  title: {
    color: cssVar.cWhite,
    textAlign: 'center',
  },
  client: {
    color: cssVar.cWhiteV2,
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: cssVar.spL,
  },
});
