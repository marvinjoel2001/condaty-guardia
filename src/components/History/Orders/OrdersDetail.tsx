import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import useApi from '../../../../mk/hooks/useApi';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconExpand} from '../../../icons/IconLibrary';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import ModalAccessExpand from '../../Home/Accesses/ModalAccessExpand';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';

type Props = {
  open: boolean;
  onClose: () => void;
  id: number | null;
};
const statusOrder: any = {
  C: {text: 'Completado', color: cssVar.cSuccess},
  S: {text: 'Por salir', color: cssVar.cPrimary},
  I: {text: 'Por ingresar', color: cssVar.cWarning},
  X: {text: 'Anulado', color: cssVar.cError},
};

const OrdersDetail = ({open, onClose, id}: Props) => {
  const [orderData, setOrderData] = useState<any>(null);
  const {execute} = useApi();
  const [openDetail, setOpenDetail]: any = useState({
    open: false,
    id: null,
    type: '',
    invitation: null,
  });

  useEffect(() => {
    const getOrderDetails = async () => {
      if (!id) {
        setOrderData(null); // Si el id se vuelve null dentro de un ciclo, limpiar.
        return;
      }
      try {
        const {data: apiResponse} = await execute('/others', 'GET', {
          fullType: 'DET',
          section: 'ACT',
          searchBy: id, // 'id' de las props/clausura del useEffect
        });
        if (open) {
          setOrderData(apiResponse.data?.[0] || null);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        if (open) {
          // Solo limpiar si sigue abierto
          setOrderData(null);
        }
      }
    };

    if (id) {
      // Si hay un ID, intenta obtener los detalles.
      setOrderData(null); // ESTE ES EL PUNTO CLAVE: Limpiar datos anteriores para mostrar Loading para el nuevo ID.
      getOrderDetails();
    } else {
      setOrderData(null); // Asegurar que los datos estén limpios.
    }
  }, [id]);

  useEffect(() => {
    if (!open) {
      setOrderData(null);
    }
  }, [open]);

  const getStatus = () => {
    if (orderData?.access?.out_at) {
      return 'C';
    }
    if (orderData?.access?.in_at) {
      return 'S';
    }
    return 'I';
  };
  const renderContent = () => {
    if (!orderData) {
      return <Loading />;
    }

    const item = orderData;
    const accessInfo = item.access;

    return (
      <View>
        <Card>
          <Text style={styles.cardTitle}>Resumen de la visita</Text>
          <ItemList
            title={getFullName(accessInfo?.visit)}
            style={{marginBottom: 12}}
            subtitle={
              'C.I: ' +
              accessInfo?.visit?.ci +
              (accessInfo.plate ? ' - Placa: ' + accessInfo.plate : '')
            }
            left={
              <Avatar
                name={getFullName(accessInfo?.visit)}
                src={getUrlImages(
                  '/VISIT-' +
                    accessInfo?.visit?.id +
                    '.webp?d=' +
                    accessInfo?.visit?.updated_at,
                )}
              />
            }
          />
          <KeyValue
            keys="Tipo de pedido"
            value={item.other_type?.name || 'No especificado'}
          />
          <KeyValue
            keys="Estado"
            value={statusOrder[getStatus()]?.text || 'No especificado'}
            colorValue={statusOrder[getStatus()]?.color || cssVar.cPrimary}
          />
          <KeyValue
            keys="Fecha y hora de ingreso"
            value={getDateTimeStrMes(accessInfo?.in_at)}
          />
          <KeyValue
            keys="Fecha y hora de salida"
            value={getDateTimeStrMes(accessInfo?.out_at || '-/-')}
          />
          {/* {accessInfo?.plate && (
            <KeyValue
              keys="Placa (Vehículo Entrega)"
              value={accessInfo.plate}
            />
          )} */}
          <KeyValue
            keys="Guardia de entrada"
            value={getFullName(accessInfo?.guardia) || '-/-'}
          />
          {accessInfo?.out_at && (
            <KeyValue
              keys="Guardia de salida"
              value={
                getFullName(accessInfo?.out_guard || accessInfo?.guardia) ||
                '-/-'
              }
            />
          )}
          {accessInfo?.in_at && (
            <KeyValue
              keys="Observación de entrada"
              value={accessInfo?.obs_in || '-/-'}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.repartidorGeneralTitle}>Residente visitado</Text>
          <ItemList
            title={getFullName(item?.owner)}
            subtitle={item?.owner?.ci}
            left={
              <Avatar
                name={getFullName(item?.owner)}
                src={getUrlImages(
                  '/OWNER-' +
                    item?.owner?.id +
                    '.webp?d=' +
                    item?.owner?.updated_at,
                )}
                w={40}
                h={40}
              />
            }
            right={
              <Icon
                name={IconExpand}
                size={20}
                color={cssVar.cWhiteV1}
                onPress={() =>
                  setOpenDetail({
                    open: true,
                    id: item?.id,
                    type: 'P',
                    invitation: {
                      owner: item.owner,
                      type: accessInfo?.type,
                      descrip: item.descrip,
                      other_type: item.other_type,
                      created_at: item.created_at,
                    },
                  })
                }
              />
            }
          />
        </Card>
      </View>
    );
  };

  return (
    <ModalFull title={'Detalle de pedido'} open={open} onClose={onClose}>
      {open && id ? (
        renderContent()
      ) : open && !id ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>ID no proporcionado.</Text>
        </View>
      ) : null}
      {openDetail.open && (
        <ModalAccessExpand
          open={openDetail.open}
          type={openDetail.type}
          invitation={openDetail.invitation}
          id={openDetail.id}
          onClose={() =>
            setOpenDetail({open: false, id: null, type: '', invitation: null})
          }
        />
      )}
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: cssVar.spL,

    alignItems: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: cssVar.cBlackV2,
    padding: cssVar.spM,
    paddingHorizontal: cssVar.spL,
    borderRadius: cssVar.bRadius,
    marginTop: cssVar.spM,
    maxWidth: '100%',
    alignSelf: 'center',
    gap: cssVar.spS,
  },
  cardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    marginBottom: cssVar.spM,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    paddingVertical: cssVar.spS / 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: cssVar.cBlackV3,
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
    color: cssVar.cWhiteV1,
    flexBasis: '45%',
    marginRight: cssVar.spS,
  },
  detailValue: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
    textAlign: 'right',
    flexBasis: '55%',
  },
  separator: {
    height: 1,
    backgroundColor: cssVar.cBlackV3,
    alignSelf: 'stretch',
    marginVertical: cssVar.spM,
  },
  repartidorGeneralTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    marginBottom: cssVar.spS,
  },
  repartidorCard: {
    backgroundColor: cssVar.cBlackV3,
    borderRadius: cssVar.bRadiusS,
    marginBottom: cssVar.spS,
    paddingHorizontal: cssVar.spM,
    paddingVertical: cssVar.spS,
    borderWidth: 1,
    borderColor: cssVar.cBlackV2,
  },
  repartidorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repartidorInfo: {
    flex: 1,
    marginLeft: cssVar.spM,
  },
  repartidorName: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
  },
  repartidorCi: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sS,
    color: cssVar.cWhiteV1,
  },
  repartidorDetails: {
    marginTop: cssVar.spM,
    paddingTop: cssVar.spS,
    borderTopWidth: 0.5,
    borderTopColor: cssVar.cBlackV1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: cssVar.spL,
  },
  noDataText: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
    color: cssVar.cWhiteV1,
  },
});

export default OrdersDetail;
