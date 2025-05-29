import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import useApi from '../../../../mk/hooks/useApi';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { IconArrowDown, IconArrowUp } from '../../../icons/IconLibrary';

type Props = {
  open: boolean;
  onClose: () => void;
  id: number | null;
};

const DetailRow = ({label, value, valueStyle}: {label: string; value: string | undefined | null; valueStyle?: object}) => {
  let displayValue = value;
  if (value === undefined || value === null || value === '') {
    displayValue = '-/-';
  }
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{displayValue}</Text>
    </View>
  );
};

interface RepartidorItemProps {
  deliveryAccessData: any;
}

const RepartidorItem = ({ deliveryAccessData }: RepartidorItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const repartidor = deliveryAccessData?.visit;

  if (!repartidor && !deliveryAccessData) {
    return (
        <View style={styles.repartidorCard}>
            <Text style={styles.repartidorName}>Datos del repartidor no disponibles.</Text>
        </View>
    );
  }
  
  const repartidorFullName = getFullName(repartidor) || 'Nombre no disponible';
  const repartidorCi = repartidor?.ci ? `C.I. ${repartidor.ci}` : 'CI no disponible';

  return (
    <View style={styles.repartidorCard}>
      <TouchableOpacity style={styles.repartidorHeader} onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
        <Avatar
          name={repartidorFullName}
          src={repartidor?.url_avatar ? getUrlImages(repartidor.url_avatar) : undefined}
          w={40}
          h={40}
          fontSize={cssVar.sM}

        />
        <View style={styles.repartidorInfo}>
          <Text style={styles.repartidorName}>{repartidorFullName}</Text>
          <Text style={styles.repartidorCi}>{repartidorCi}</Text>
        </View>
        <Icon name={isExpanded ? IconArrowUp : IconArrowDown} size={20} color={cssVar.cWhiteV1} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.repartidorDetails}>
          <DetailRow label="Hora y fecha de ingreso" value={getDateTimeStrMes(deliveryAccessData?.in_at)} />
          <DetailRow label="Hora y fecha de salida" value={getDateTimeStrMes(deliveryAccessData?.out_at)} />
          <DetailRow label="Observación de ingreso (Rep.)" value={deliveryAccessData?.obs_in} />
          <DetailRow label="Observación de salida (Rep.)" value={deliveryAccessData?.obs_out} />
        </View>
      )}
    </View>
  );
};


const OrdersDetail = ({open, onClose, id}: Props) => {
  const [orderData, setOrderData] = useState<any>(null);
  const {execute} = useApi();

  // LÓGICA DE CARGA DE DATOS EXACTAMENTE COMO EL "ANTIGUO AccessDetail"
  useEffect(() => {
    const getOrderDetails = async () => {
      // No se establece orderData a null aquí al inicio de getOrderDetails.
      // El estado de carga se maneja mostrando <Loading /> cuando orderData es null.
      if (!id) { // Protección adicional, aunque el useEffect ya lo verifica.
        setOrderData(null); // Si el id se vuelve null dentro de un ciclo, limpiar.
        return;
      }
      try {
        const {data: apiResponse} = await execute('/others', 'GET', {
          fullType: 'DET',
          section: 'ACT',
          searchBy: id, // 'id' de las props/clausura del useEffect
        });
        // Solo actualizar si el modal sigue abierto.
        // La comprobación de si 'id' sigue siendo el mismo es implícita
        // porque este efecto solo se re-ejecuta si 'id' cambia.
        if (open) { 
            setOrderData(apiResponse.data?.[0] || null);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        if (open) { // Solo limpiar si sigue abierto
            setOrderData(null);
        }
      }
    };

    if (id) { // Si hay un ID, intenta obtener los detalles.
      setOrderData(null); // ESTE ES EL PUNTO CLAVE: Limpiar datos anteriores para mostrar Loading para el nuevo ID.
      getOrderDetails();
    } else { // Si no hay ID (es null o undefined)
      setOrderData(null); // Asegurar que los datos estén limpios.
    }
  }, [id]); // <<--- DEPENDENCIA ÚNICA: 'id', como en el "antiguo componente" que funcionaba.

  // Efecto adicional para limpiar cuando el modal se cierra explícitamente.
  useEffect(() => {
    if (!open) {
      setOrderData(null);
    }
  }, [open]);
  // FIN DE LA LÓGICA DE CARGA DE DATOS

  const renderContent = () => {
    if (!orderData) {
      return <Loading />;
    }

    const item = orderData;
    const accessInfo = item.access;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalle del pedido</Text>

          <DetailRow label="Tipo de pedido" value={item.other_type?.name || 'No especificado'} />
          <DetailRow label="Descripción" value={item.descrip} />
          <DetailRow label="Entregó a" value={getFullName(item.owner)} />
          
          {accessInfo?.plate && (
            <DetailRow label="Placa (Vehículo Entrega)" value={accessInfo.plate} />
          )}

          <DetailRow label="Guardia de entrada" value={getFullName(accessInfo?.guardia)} />
          {accessInfo?.out_guard && ( // Mostrar solo si existe out_guard
            <DetailRow label="Guardia de salida" value={getFullName(accessInfo.out_guard)} />
          )}
          
          {(accessInfo?.visit || accessInfo) && <View style={styles.separator} />} 
          
          {(accessInfo?.visit || accessInfo) && (
            <>
              <Text style={styles.repartidorGeneralTitle}>Repartidor</Text>
              <RepartidorItem deliveryAccessData={accessInfo} />
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <ModalFull title={'Detalle de pedido'} open={open} onClose={onClose}>
      {(open && id) ? renderContent() : (open && !id ? <View style={styles.noDataContainer}><Text style={styles.noDataText}>ID no proporcionado.</Text></View> : null) }
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
  }
});

export default OrdersDetail;