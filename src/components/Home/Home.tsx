import React, {useEffect, useState, useContext, useCallback} from 'react';
import {StyleSheet, View, Keyboard} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import HeadDashboardTitle from '../HeadDashboardTitle/HeadDashboardTitle';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import Accesses from './Accesses/Accesses';
import DropdawnAccess from './DropdawnAccess/DropdawnAccess';
import CameraQr from './CameraQr/CameraQr';
import {ThemeContext} from '../../../mk/contexts/ThemeContext';
import useApi from '../../../mk/hooks/useApi';
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
  const [typeSearch, setTypeSearch] = useState('I');
  const [_typeSearch, set_TypeSearch] = useState('I');
  const {theme} = useContext(ThemeContext);
  const {execute} = useApi();
  const [loaded, setLoaded] = useState(false);

  const onNotif = useCallback(
    (dataSocket: any) => {
      if (dataSocket?.event == 'accessTrans') {
        const dataAcess = data?.accesses?.find(
          (item: any) => item?.id == dataSocket?.payload?.data?.id,
        );
        const dataOthers = data?.others?.find(
          (item: any) => item?.id == dataSocket?.payload?.data?.id,
        );
        if (dataAcess) {
          if (dataSocket?.payload?.data?.status == 'O') {
            // console.log("ENTRO 1");
            setData({
              ...data,
              accesses: data?.accesses?.filter(
                (item: any) => item?.id != dataSocket?.payload?.data?.id,
              ),
            });
          } else {
            // console.log("ENTRO 2");
            setData({
              ...data,
              accesses: data?.accesses?.map((item: any) =>
                item?.id == dataSocket?.payload?.data?.id
                  ? dataSocket?.payload?.data
                  : item,
              ),
            });
          }
        } else {
          if (dataSocket?.payload?.type != 'P') {
            // console.log("ENTRO 3");

            setData({
              ...data,
              accesses: [dataSocket?.payload?.data, ...(data?.accesses || [])],
            });
          }
        }

        if (dataOthers) {
          // console.log("ENTRO 5");
          setData({
            ...data,
            others: data?.others?.map((item: any) =>
              item?.id == dataSocket?.payload?.data?.id
                ? dataSocket?.payload?.data
                : item,
            ),
          });
        } else {
          // console.log("ENTRO 6");
          if (
            dataSocket?.payload?.data?.status != 'O' &&
            dataSocket?.payload?.type == 'P'
          ) {
            // console.log("ENTRO 6,5");

            setData({
              ...data,
              others: data?.others?.filter(
                (item: any) => item?.id != dataSocket?.payload?.data?.other_id,
              ),
              accesses: [dataSocket?.payload?.data, ...(data?.accesses || [])],
            });
          }
          if (
            !dataSocket?.payload?.data?.in_at &&
            dataSocket?.payload?.type == 'P'
          ) {
            // console.log("ENTRO 7");
            setData({
              ...data,
              others: [dataSocket?.payload?.data, ...(data?.others || [])],
            });
          }
        }
      }
    },
    [typeSearch, data],
  );

  useEvent('onNotif', onNotif);

  const onNotifReload = useCallback(
    (data: any) => {
      // if (data?.modulo === 'access' || data?.modulo === 'others') {
      //   getAccesses('', '/accesses', 'P');
      // }
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
    const {data} = await execute(endpoint, 'GET', {
      perPage: -1,
      page: 1,
      fullType,
      searchBy: searchParam || '',
    });
    setLoaded(false);
    
    // Función de ordenamiento
    const sortAccesses = (items: any[]) => {
      return items.sort((itemActual: any, itemSiguiente: any) => {
        // 1. Prioridad: sin confirm_at (esperando confirmación) van primero
        const itemActualTieneConfirmacion = itemActual.confirm_at != null;
        const itemSiguienteTieneConfirmacion = itemSiguiente.confirm_at != null;
        
        // Si el item actual NO tiene confirmación pero el siguiente SÍ, el actual va primero
        if (!itemActualTieneConfirmacion && itemSiguienteTieneConfirmacion) return -1;
        // Si el item actual SÍ tiene confirmación pero el siguiente NO, el siguiente va primero
        if (itemActualTieneConfirmacion && !itemSiguienteTieneConfirmacion) return 1;
        
        // 2. Prioridad: sin in_at (no han ingresado) van primero
        const itemActualTieneIngreso = itemActual.in_at != null;
        const itemSiguienteTieneIngreso = itemSiguiente.in_at != null;
        
        // Si el item actual NO tiene ingreso pero el siguiente SÍ, el actual va primero
        if (!itemActualTieneIngreso && itemSiguienteTieneIngreso) return -1;
        // Si el item actual SÍ tiene ingreso pero el siguiente NO, el siguiente va primero
        if (itemActualTieneIngreso && !itemSiguienteTieneIngreso) return 1;
        
        // 3. Ordenar por id descendente (más recientes primero)
        return itemSiguiente.id - itemActual.id;
      });
    };
    
    // Ordenar los datos
    const sortedData = {
      accesses: sortAccesses([...(data?.data?.accesses || [])]),
      others: sortAccesses([...(data?.data?.others || [])]),
      residents: data?.data?.residents || [],
    };
    
    setData(sortedData);
  };
  useEffect(() => {
    setData([]);
    getAccesses('', '/accesses', 'P');
    setStore({...store, bagePending: false});

    set_TypeSearch(typeSearch);
  }, [typeSearch]);

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

  const reloadAccesses = useCallback(() => getAccesses('', '/accesses', 'P'), [getAccesses]);
  return (
    <>
      <Layout
        scroll={false}
        title="Home"
        customTitle={<HeadDashboardTitle user={user} stop={false} theme={theme} />}
        refresh={reloadAccesses}>
        <TabsButtons
          tabs={[
            {
              value: 'I',
              text: 'Pendiente de ingreso',
              isNew: store?.bagePending,
            },
            {value: 'S', text: 'Pendiente de salida'},
          ]}
          sel={typeSearch}
          setSel={setTypeSearch}
        />
        <View style={styles.listContainer}>
          {(_typeSearch === 'S' || _typeSearch == 'I') && (
            <Accesses
              data={data}
              reload={reloadAccesses}
              typeSearch={_typeSearch}
              isLoading={loaded}
            />
          )}
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
            data={data?.residents}
            onClose={() => setOpenCiNom(false)}
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
