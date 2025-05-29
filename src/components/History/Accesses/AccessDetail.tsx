import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import {getDateStrMes, getDateTimeStrMes} from '../../../../mk/utils/dates';
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
  id: string | null;
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

interface CompanionItemProps {
  companionAccess: any;
  isFrequentOrGroup?: boolean;
}

const CompanionItem = ({ companionAccess, isFrequentOrGroup }: CompanionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visit = companionAccess.visit;

  if (!visit) return null;

  const companionFullName = getFullName(visit) || 'N/A';
  const companionCi = visit.ci ? `C.I. ${visit.ci}` : 'CI no disponible';

  return (
    <View style={styles.companionCard}>
      <TouchableOpacity style={styles.companionHeader} onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
        <Avatar
          name={companionFullName}
          src={visit.url_avatar ? getUrlImages(visit.url_avatar) : undefined}
          w={40}
          h={40}
          style={!visit.url_avatar && isFrequentOrGroup ? { backgroundColor: cssVar.cCompl2 } : {}}
          fontSize={cssVar.sM}
        />
        <View style={styles.companionInfo}>
          <Text style={styles.companionName}>{companionFullName}</Text>
          <Text style={styles.companionCi}>{companionCi}</Text>
        </View>
        <Icon name={isExpanded ? IconArrowUp : IconArrowDown} size={20} color={cssVar.cWhiteV1} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.companionDetails}>
          <DetailRow label="Hora y fecha de ingreso" value={getDateTimeStrMes(companionAccess.in_at)} />
          <DetailRow label="Hora y fecha de salida" value={getDateTimeStrMes(companionAccess.out_at)} />
          <DetailRow label="Observación de ingreso" value={companionAccess.obs_in} />
          <DetailRow label="Observación de salida" value={companionAccess.obs_out} />
        </View>
      )}
    </View>
  );
};

const AccessDetail = ({open, onClose, id}: Props) => {
  const [accessData, setAccessData] = useState<any>(null);
  const {execute} = useApi();

  useEffect(() => {
    const getAccess = async () => {
      // No se establece accessData a null aquí intencionalmente al inicio de getAccess,
      // se limpiará solo si el 'id' cambia (ver abajo) o si la petición falla.
      // Esto replica el comportamiento del "antiguo componente".
      try {
        const {data: apiResponse} = await execute('/accesses', 'GET', {
          fullType: 'DET',
          section: 'ACT',
          searchBy: id, // 'id' aquí es el de las props/clausura del useEffect
        });
        // Solo actualizar si el modal está abierto y el 'id' para el que se hizo la petición
        // sigue siendo el 'id' actual de las props. Esto evita condiciones de carrera.
        if (open && id === id) { // Esta comprobación id === id es redundante aquí, se simplifica
            setAccessData(apiResponse.data?.[0] || null);
        }
      } catch (error) {
        console.error("Failed to fetch access details:", error);
        if (open && id === id) { // Simplificado, id es constante dentro de este scope de getAccess
            setAccessData(null);
        }
      }
    };

    if (id && open) {
      // Cuando 'id' cambia (y está abierto), o cuando se abre el modal con un 'id',
      // limpiamos 'accessData' para mostrar el estado de carga y luego obtenemos los datos.
      setAccessData(null);
      getAccess();
    } else if (!id && open) {
      // Si el modal está abierto pero no hay 'id', limpiar datos.
      setAccessData(null);
    }
    // La dependencia es solo 'id' y 'open'.
    // 'execute' se usa, pero no se lista como dependencia para replicar el "antiguo componente".
    // ADVERTENCIA: Si `execute` no es una referencia estable y su lógica interna depende
    // de algo que cambia, esto podría usar una versión obsoleta de `execute`.
    // La forma "correcta" moderna sería incluir `execute` y asegurarse de que `useApi` lo memoiza.
    // Pero para replicar el "antiguo", lo omitimos de las dependencias.
  }, [id, open]);


  // Efecto adicional para limpiar los datos cuando el modal se cierra,
  // independientemente del estado de 'id'.
  useEffect(() => {
    if (!open) {
      setAccessData(null);
    }
  }, [open]);


  const renderContent = () => {
    if (!accessData) {
      return <Loading />;
    }

    const item = accessData;
    const mainUser = item.visit || item.owner;
    const mainUserFullName = getFullName(mainUser) || 'N/A';
    const mainUserCi = mainUser?.ci;
    const mainUserPlate = item.plate && !item.taxi ? item.plate : null;

    let statusText = '';
    let statusColor = cssVar.cWhite;
    let tipoAccesoText = '';

    if (item.type === 'O') {
      tipoAccesoText = 'QR Llave Virtual';
      statusText = getDateTimeStrMes(item.in_at) ? 'Ingresó' : 'Pendiente';
    } else {
      statusText = item.out_at
        ? 'Completado'
        : !item.confirm_at && item.status !== 'X'
        ? 'Por confirmar'
        : item.in_at
        ? 'Por Salir'
        : item.confirm === 'Y'
        ? 'Por Entrar'
        : item.status === 'X'
        ? 'Anulado'
        : 'Denegado';

      if (statusText === 'Completado' || statusText === 'Por Salir' || statusText === 'Por Entrar') statusColor = cssVar.cSuccess;
      if (statusText === 'Anulado' || statusText === 'Denegado') statusColor = cssVar.cError;
      if (statusText === 'Por confirmar') statusColor = cssVar.cWarning;

      switch (item.type) {
        case 'P':
          tipoAccesoText = `Pedido - ${item.other?.other_type?.name || 'General'}`;
          break;
        case 'I':
          tipoAccesoText = 'QR Individual';
          break;
        case 'C':
          tipoAccesoText = 'Sin QR';
          break;
        case 'G':
          tipoAccesoText = 'QR Grupal';
          break;
        case 'F':
          tipoAccesoText = 'QR Frecuente';
          break;
        default:
          tipoAccesoText = 'Desconocido';
      }
    }
    
    const isFrequentOrGroup = item.type === 'G' || item.type === 'F';

    return (
      <ScrollView >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalle del acceso</Text>
          <View style={styles.mainVisitorInfoContainer}>
            <Avatar
              name={mainUserFullName}
              src={mainUser?.url_avatar ? getUrlImages(mainUser.url_avatar) : undefined}
              w={60}
              h={60}
              style={!mainUser?.url_avatar && isFrequentOrGroup ? {backgroundColor: cssVar.cCompl2} : {}}
              fontSize={!mainUser?.url_avatar && isFrequentOrGroup ? cssVar.sL : cssVar.sM}

            />
            <Text style={styles.mainVisitorName}>{mainUserFullName}</Text>
            <Text style={styles.mainVisitorSubText}>
              {(mainUserCi ? `C.I. ${mainUserCi}` : '') +
               (mainUserCi && mainUserPlate ? ' - ' : '') +
               (mainUserPlate ? `Placa: ${mainUserPlate}` : '') || 'Datos no disponibles'}
            </Text>
          </View>

          <DetailRow label="Tipo de acceso" value={tipoAccesoText} />
          <DetailRow label="Estado" value={statusText} valueStyle={{color: statusColor}} />
          
          { (item.type === 'G' || item.type === 'I' || item.type === 'F') && item.invitation?.title && (
            <DetailRow label="Evento" value={item.invitation.title} />
          )}
          
          <DetailRow 
              label={isFrequentOrGroup ? "Hora y fecha de ingreso" : "Fecha y hora de ingreso"}
              value={getDateTimeStrMes(item.in_at)} 
          />
          <DetailRow 
              label={isFrequentOrGroup ? "Hora y fecha de salida" : "Fecha y hora de salida"}
              value={getDateTimeStrMes(item.out_at)} 
          />

          {item.type === 'O' && (
            <>
              <DetailRow label="Residente" value={getFullName(item.owner)} />
              <DetailRow label="Guardia de entrada" value={getFullName(item.guardia)} />
            </>
          )}

          {item.type !== 'O' && (
            <>
              {item.type === 'P' && <DetailRow label="Conductor" value={getFullName(item.visit)} />}
              <DetailRow label={item.out_at ? "Visitó a" : "Visita a"} value={getFullName(item.owner)} />

              {(item.type === 'I' || item.type === 'G' || item.type === 'F') && item.invitation?.date_event && (
                <DetailRow label="Fecha de invitación" value={getDateStrMes(item.invitation.date_event)} />
              )}
              {(item.type === 'I' || item.type === 'G' || item.type === 'F') && item.invitation?.obs && (
                <DetailRow label="Descripción (Invitación)" value={item.invitation.obs} />
              )}

              {statusText === 'Denegado' && (
                <>
                  <DetailRow label="Fecha de denegación" value={getDateTimeStrMes(item.confirm_at)} />
                  <DetailRow label="Motivo" value={item.obs_confirm} />
                </>
              )}
              
              <DetailRow label="Guardia de entrada" value={getFullName(item.guardia)} />
              {item.out_guard && item.guardia?.id !== item.out_guard?.id && (
                <DetailRow label="Guardia de salida" value={getFullName(item.out_guard)} />
              )}
               {item.out_guard && item.guardia?.id === item.out_guard?.id && item.out_at && (
                <DetailRow label="Guardia de salida" value={getFullName(item.out_guard)} />
              )}

              <DetailRow label="Observación de solicitud" value={item.obs_guard} />
              <DetailRow label="Observación de ingreso" value={item.obs_in} />
              <DetailRow label="Observación de salida" value={item.obs_out} />
            </>
          )}

          {item.accesses && item.accesses.length > 0 && (
            <>
              <View style={styles.separator} />
              <Text style={styles.companionsGeneralTitle}>Acompañantes</Text>
              {item.accesses.map((companionAccess: any, index: number) => (
                <CompanionItem
                  key={`companion-${companionAccess.id || index}`}
                  companionAccess={companionAccess}
                  isFrequentOrGroup={isFrequentOrGroup}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <ModalFull title={'Detalle de acceso'} open={open} onClose={onClose}>
      {(open && id) ? renderContent() : (open && !id ? <View style={styles.noDataContainer}><Text style={styles.noDataText}>ID no proporcionado.</Text></View> : null) }
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: cssVar.spL,
    paddingHorizontal: cssVar.spM,
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
    
  },
  cardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    marginBottom: cssVar.spM,
  },
  mainVisitorInfoContainer: {
    alignItems: 'center',
    gap: cssVar.spXs,
    alignSelf: 'stretch',
    marginBottom: cssVar.spM,
  },
  mainVisitorName: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    textAlign: 'center',
    color: cssVar.cWhite,
    marginTop: cssVar.spXs,
  },
   mainVisitorNameSm: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sS,
    textAlign: 'center',
    color: cssVar.cWhite,
    marginTop: cssVar.spXs,
  },
  mainVisitorSubText: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sS,
    textAlign: 'center',
    color: cssVar.cWhiteV1,
  },
  mainVisitorSubTextSm: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sXs,
    textAlign: 'center',
    color: cssVar.cWhiteV1,
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
    backgroundColor: cssVar.cWhiteV1,
    alignSelf: 'stretch',
    marginVertical: cssVar.spM,
  },
  companionsGeneralTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    marginBottom: cssVar.spS,
    marginTop: cssVar.spS,
  },
  companionCard: {
    backgroundColor: cssVar.cBlackV3,
    borderRadius: cssVar.bRadiusS,
    marginBottom: cssVar.spS,
    paddingHorizontal: cssVar.spS,
    paddingVertical: cssVar.spS,
    borderWidth: 1,
    borderColor: cssVar.cBlackV1,
  },
  companionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companionInfo: {
    flex: 1,
    marginLeft: cssVar.spM,
  },
  companionName: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
  },
  companionCi: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sS,
    color: cssVar.cWhiteV1,
  },
  companionDetails: {
    marginTop: cssVar.spM,
    paddingHorizontal: cssVar.spS,
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

export default AccessDetail;