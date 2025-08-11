import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import {StyleSheet, View, Text, Keyboard} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import HeadDashboardTitle from '../HeadDashboardTitle/HeadDashboardTitle';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import Accesses from './Accesses/Accesses';
import Orders from './Orders/Orders';
import DropdawnAccess from './DropdawnAccess/DropdawnAccess';
import CameraQr from './CameraQr/CameraQr';
import {ThemeContext} from '../../../mk/contexts/ThemeContext';
import useApi from '../../../mk/hooks/useApi';
import {cssVar} from '../../../mk/styles/themes';
import {getFullName} from '../../../mk/utils/strings';
import DataSearch from '../../../mk/components/ui/DataSearch';
import useAuth from '../../../mk/hooks/useAuth';
import EntryQR from './EntryQR/EntryQR';
import CiNomModal from './CiNomModal/CiNomModal';
import {isAndroid} from '../../../mk/utils/utils';
import {useEvent} from '../../../mk/hooks/useEvent';

const Home = () => {
  const {user, store, setStore} = useAuth();
  const [openQr, setOpenQr] = useState(false);
  const [openCiNom, setOpenCiNom] = useState(false);
  const [code, setCode]: any = useState(null);
  const [showEntryQR, setShowEntryQR] = useState(false);
  const [data, setData]: any = useState([]);
  // const [dataID, setDataID] = useState(0);
  const [search, setSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('I');
  const [_typeSearch, set_TypeSearch] = useState('I');
  const {theme} = useContext(ThemeContext);
  const {execute} = useApi();
  const [loaded, setLoaded] = useState(false);

  // const reloadNotif = (type: string) => {
  //   // if (type === 'I' && typeSearch === 'I') {
  //   getAccesses('', '/accesses', 'P');
  //   // }
  //   // if (type === 'P' && typeSearch === 'P') {
  //   //   getAccesses('', '/others', 'L');
  //   // }
  // };

  const onNotif = useCallback(
    (data: any) => {
      if (data?.event === 'confirm' || data?.event === 'in-pedido') {
        // reloadNotif();
        getAccesses('', '/accesses', 'P');
      }
      if (data?.event === 'confirm' && typeSearch !== 'I') {
        setStore({...store, bagePending: true});
      }
      if (data?.event === 'in-pedido' && typeSearch !== 'P') {
        setStore({...store, bageOthers: true});
      }
    },
    [typeSearch],
  );
  useEvent('onNotif', onNotif);

  const onNotifReload = useCallback(
    (data: any) => {
      // console.log('data fnewoijn', data);
      if (data?.modulo === 'access' || data?.modulo === 'others') {
        // reloadNotif(typeSearch);
        getAccesses('', '/accesses', 'P');
      }
      if (
        data?.modulo === 'access' &&
        typeSearch !== 'I' &&
        data?._act != 'new-visit' &&
        data?._act != 'out-visit'
      ) {
        setStore({...store, bagePending: true});
      }
      if (
        data?.modulo === 'others' &&
        typeSearch !== 'P' &&
        data?._act != 'new-visit'
      ) {
        setStore({...store, bageOthers: true});
      }
    },
    [typeSearch],
  );
  useEvent('onReload', onNotifReload);

  const getAccesses = async (
    searchParam: any = '',
    endpoint: string,
    fullType: string,
  ) => {
    setData([]);
    setLoaded(true);
    const {data, reload} = await execute(endpoint, 'GET', {
      perPage: -1,
      page: 1,
      fullType,
      searchBy: searchParam || '',
      // section: endpoint === '/others' ? 'HOME' : '',
    });
    setLoaded(false);
    setData(data?.data || []);
  };

  console.log('data3', data);
  // Actualizar data cuando cambia el tipo de búsqueda
  useEffect(() => {
    setData([]);
    // switch (typeSearch) {
    //   case 'I':
    //     getAccesses('', '/accesses', 'P');
    //     setStore({...store, bagePending: false});
    //     break;
    //   case 'S':
    //     getAccesses('', '/accesses', 'P');
    //     break;
    //   case 'P':
    //     getAccesses('', '/others', 'L');
    //     setStore({...store, bageOthers: false});
    //     break;
    //   default:
    //     console.log('Tipo de búsqueda no válido:', typeSearch);
    //     break;
    // }
    getAccesses('', '/accesses', 'P');
    setStore({...store, bagePending: false});

    set_TypeSearch(typeSearch);
  }, [typeSearch]);

  const customTitle = () => (
    <View>
      <HeadDashboardTitle
        user={user}
        setOpenDropdown={() => {}}
        stop={false}
        theme={theme}
      />
    </View>
  );
  useEffect(() => {
    if (code) {
      setShowEntryQR(true);
    }
  }, [code]);
  const handleEntryQRClose = () => {
    setShowEntryQR(false);
    setCode(null);
  };

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(isAndroid());
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // console.log(data);

  return (
    <>
      <Layout
        title="Home"
        customTitle={customTitle()}
        // refresh={() =>
        //   typeSearch == 'I'
        //     ? getAccesses('', '/accesses', 'P')
        //     : typeSearch == 'A'
        //     ? getAccesses('', '/accesses', 'AD')
        //     : getAccesses('', '/others', 'L')
        // }
        refresh={() => getAccesses('', '/accesses', 'P')}
        // style={openSlide ? {paddingBottom: 40} : {paddingBottom: 30}}
      >
        <TabsButtons
          tabs={[
            {
              value: 'I',
              text: 'Pendiente de ingreso',
              isNew: store?.bagePending,
            },
            {value: 'S', text: 'Pendiente de salida'},
            // {value: 'P', text: 'Pedidos', isNew: store?.bageOthers},
          ]}
          sel={typeSearch}
          setSel={setTypeSearch}
        />

        {/* Buscador */}

        <View style={styles.listContainer}>
          {/* <DataSearch
            setSearch={setSearch}
            name="home"
            value={search}
            style={{marginBottom: 8}}
          /> */}
          {(_typeSearch === 'S' || typeSearch == 'I') && (
            <Accesses
              data={data}
              reload={() => getAccesses(search, '/accesses', 'P')}
              // setDataID={setDataID}
              typeSearch={typeSearch}
              isLoading={loaded}
            />
          )}

          {/* {_typeSearch === 'P' && (
            <Orders
              data={data}
              reload={() => getAccesses(search, '/others', 'L')}
              setDataID={setDataID}
              loaded={loaded}
            />
          )} */}
        </View>
        {openQr && (
          <CameraQr
            open={openQr}
            onClose={() => setOpenQr(false)}
            setCode={setCode}
          />
        )}
        {showEntryQR && (
          <EntryQR
            reload={() => getAccesses('', '/accesses', 'P')}
            code={code}
            open={showEntryQR}
            onClose={handleEntryQRClose}
          />
        )}
        {openCiNom && (
          <CiNomModal
            open={openCiNom}
            onClose={() => setOpenCiNom(false)}
            // setCode={setCode}
            reload={() => getAccesses('', '/accesses', 'P')}
          />
        )}
      </Layout>
      {!isKeyboardVisible && (
        <DropdawnAccess
          onPressQr={() => {
            setOpenQr(true);
            setTypeSearch('I');
          }}
          onPressCiNom={() => setOpenCiNom(true)}
        />
      )}
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',

    paddingBottom: 40,
  },
});
