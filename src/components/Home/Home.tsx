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
import VersionChecker from '../../../mk/utils/VersionChecker';

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
        // Función de ordenamiento por updated_at descendente
        const sortByUpdatedAt = (items: any[]) => {
          return items.sort((a: any, b: any) => {
            const fechaA = new Date(a.updated_at).getTime();
            const fechaB = new Date(b.updated_at).getTime();
            return fechaB - fechaA;
          });
        };

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
              accesses: sortByUpdatedAt(
                data?.accesses?.filter(
                  (item: any) => item?.id != dataSocket?.payload?.data?.id,
                )
              ),
            });
          } else {
            // console.log("ENTRO 2");
            setData({
              ...data,
              accesses: sortByUpdatedAt(
                data?.accesses?.map((item: any) =>
                  item?.id == dataSocket?.payload?.data?.id
                    ? dataSocket?.payload?.data
                    : item,
                )
              ),
            });
          }
        } else {
          if (dataSocket?.payload?.type != 'P') {
            // console.log("ENTRO 3");
            setData({
              ...data,
              accesses: sortByUpdatedAt([
                dataSocket?.payload?.data,
                ...(data?.accesses || []),
              ]),
            });
          }
        }

        if (dataOthers) {
          // console.log("ENTRO 5");
          setData({
            ...data,
            others: sortByUpdatedAt(
              data?.others?.map((item: any) =>
                item?.id == dataSocket?.payload?.data?.id
                  ? dataSocket?.payload?.data
                  : item,
              )
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
              others: sortByUpdatedAt(
                data?.others?.filter(
                  (item: any) => item?.id != dataSocket?.payload?.data?.other_id,
                )
              ),
              accesses: sortByUpdatedAt([
                dataSocket?.payload?.data,
                ...(data?.accesses || []),
              ]),
            });
          }
          if (
            !dataSocket?.payload?.data?.in_at &&
            dataSocket?.payload?.type == 'P'
          ) {
            // console.log("ENTRO 7");
            setData({
              ...data,
              others: sortByUpdatedAt([
                dataSocket?.payload?.data,
                ...(data?.others || []),
              ]),
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
        // Ordenar por updated_at descendente (más recientes primero)
        const fechaA = new Date(itemActual.updated_at).getTime();
        const fechaB = new Date(itemSiguiente.updated_at).getTime();
        return fechaB - fechaA;
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

  const reloadAccesses = useCallback(
    () => getAccesses('', '/accesses', 'P'),
    [getAccesses],
  );
  return (
    <>
      <VersionChecker>
        <Layout
          scroll={false}
          title="Home"
          customTitle={
            <HeadDashboardTitle user={user} stop={false} theme={theme} />
          }
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
      </VersionChecker>
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
