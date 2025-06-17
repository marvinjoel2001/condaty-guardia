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
import { IconExpand, IconX } from '../../../icons/IconLibrary';
import Modal from '../../../../mk/components/ui/Modal/Modal';

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

interface ModalPersonData {
  person: any;
  typeLabel: string;
  accessInAt?: string | null;
  accessOutAt?: string | null;
  accessObsIn?: string | null;
  accessObsOut?: string | null;
  plate?: string | null;
  statusText?: string;
  statusColor?: string;
}

interface CompanionItemProps {
  companionAccess: any;
  onPress: () => void;
}

const CompanionItem = ({ companionAccess, onPress }: CompanionItemProps) => {
  const person = companionAccess.visit || companionAccess;

  if (!person || !person.id) return null;

  const companionFullName = getFullName(person) || 'N/A';
  const companionCi = person.ci ? `C.I. ${person.ci}` : 'CI no disponible';

  return (
    <TouchableOpacity style={styles.personBlock} onPress={onPress} activeOpacity={0.7}>
      <Avatar
        name={companionFullName}
        src={person.url_avatar ? getUrlImages(person.url_avatar) : undefined}
        w={40}
        h={40}
        fontSize={cssVar.sL}
        circle={true}
      />
      <View style={styles.personInfoContainer}>
        <Text style={styles.personName}>{companionFullName}</Text>
        <Text style={styles.personSubDetail}>{companionCi}</Text>
      </View>
      <Icon name={IconExpand} size={cssVar.sXl} color={cssVar.cWhiteV1} />
    </TouchableOpacity>
  );
};

const AccessDetail = ({open, onClose, id}: Props) => {
  const [accessData, setAccessData] = useState<any>(null);
  const {execute} = useApi();

  const [modalPersonData, setModalPersonData] = useState<ModalPersonData | null>(null);
  const [isPersonDetailModalVisible, setIsPersonDetailModalVisible] = useState(false);

  useEffect(() => {
    const getAccess = async () => {
      try {
        const {data: apiResponse} = await execute('/accesses', 'GET', {
          fullType: 'DET',
          section: 'ACT',
          searchBy: id,
        });
        if (open && id === id) {
            setAccessData(apiResponse.data?.[0] || null);
        }
      } catch (error) {
        console.error("Failed to fetch access details:", error);
        if (open && id === id) {
            setAccessData(null);
        }
      }
    };

    if (id && open) {
      setAccessData(null);
      getAccess();
    } else if (!id && open) {
      setAccessData(null);
    }
  }, [id, open]);


  useEffect(() => {
    if (!open) {
      setAccessData(null);
      setIsPersonDetailModalVisible(false);
      setModalPersonData(null);
    }
  }, [open]);

  const handleOpenPersonDetailModal = (personData: any, typeLabel: 'Acompañante' | 'Taxista' | 'Residente', mainAccessItem: any) => {
    let dataForModal: ModalPersonData;
    let statusTextForModal = '';
    let statusColorForModal = cssVar.cWhite;
    
    const personToShow = typeLabel === 'Acompañante' ? (personData.visit || personData) : personData;
    const isDriver = typeLabel === 'Taxista';

    if (typeLabel === 'Acompañante' || typeLabel === 'Residente') {
      statusTextForModal = personData.out_at ? 'Completado' : personData.in_at ? 'Dentro' : 'Pendiente';
      if (statusTextForModal === 'Completado' || statusTextForModal === 'Dentro') statusColorForModal = cssVar.cSuccess;

      dataForModal = {
        person: personToShow,
        typeLabel: typeLabel,
        accessInAt: personData.in_at,
        accessOutAt: personData.out_at,
        accessObsIn: personData.obs_in,
        accessObsOut: personData.obs_out,
        statusText: statusTextForModal,
        statusColor: statusColorForModal,
      };
    } else { // Taxista
      statusTextForModal = mainAccessItem.out_at
        ? 'Completado'
        : !mainAccessItem.confirm_at && mainAccessItem.status !== 'X'
        ? 'Por confirmar'
        : mainAccessItem.in_at
        ? 'Por Salir'
        : mainAccessItem.confirm === 'Y'
        ? 'Por Entrar'
        : mainAccessItem.status === 'X'
        ? 'Anulado'
        : 'Denegado';
      
      if (statusTextForModal === 'Completado' || statusTextForModal === 'Por Salir' || statusTextForModal === 'Por Entrar') statusColorForModal = cssVar.cSuccess;
      if (statusTextForModal === 'Anulado' || statusTextForModal === 'Denegado') statusColorForModal = cssVar.cError;
      if (statusTextForModal === 'Por confirmar') statusColorForModal = cssVar.cWarning;

      dataForModal = {
        person: personToShow.visit,
        typeLabel: 'Taxista',
        accessInAt: personToShow.in_at,
        accessOutAt: personToShow.out_at,
        accessObsIn: personToShow.obs_in, 
        accessObsOut: personToShow.obs_out, 
        plate: personToShow.plate,
        statusText: statusTextForModal,
        statusColor: statusColorForModal,
      };
    }
    setModalPersonData(dataForModal);
    setIsPersonDetailModalVisible(true);
  };

  const handleClosePersonDetailModal = () => {
    setIsPersonDetailModalVisible(false);
    setModalPersonData(null);
  };

  const renderContent = () => {
    if (!accessData) {
      return <Loading />;
    }

    const item = accessData;
    const resident = item.owner;
    const mainVisitor = item.visit;
    const driverAccess = item.accesses?.find((acc: any) => acc.taxi === 'C');
    const driver = driverAccess ? driverAccess.visit : null;
    const companions = item.accesses?.filter((acc: any) => acc.taxi !== 'C') || [];

    const mainUserFullName = getFullName(mainVisitor) || 'N/A';
    const mainUserCi = mainVisitor?.ci;

    let statusText = ''; 
    let statusColor = cssVar.cWhite;

    statusText = item.out_at
      ? 'Completado'
      : !item.confirm_at && item.status !== 'X'
      ? 'Por confirmar'
      : item.in_at
      ? 'Dentro del condominio'
      : item.confirm === 'Y'
      ? 'Por Entrar'
      : item.status === 'X'
      ? 'Anulado'
      : 'Denegado';

    if (statusText === 'Completado' || statusText === 'Dentro del condominio' || statusText === 'Por Entrar') statusColor = cssVar.cSuccess;
    if (statusText === 'Anulado' || statusText === 'Denegado') statusColor = cssVar.cError;
    if (statusText === 'Por confirmar') statusColor = cssVar.cWarning;
    
    let tipoAccesoText = 'Desconocido';
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
        case 'O':
          tipoAccesoText = 'QR Llave Virtual';
          break;
      }
    
    if (item.type === 'F') {
      return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.mainCard}>
            <Text style={styles.sectionTitleNoBorder}>Resumen de la visita</Text>
            <View style={styles.personBlock}>
              <Avatar name={mainUserFullName} src={mainVisitor?.url_avatar ? getUrlImages(mainVisitor.url_avatar) : undefined} w={40} h={40} />
              <View style={styles.personInfoContainer}>
                <Text style={styles.personName}>{mainUserFullName}</Text>
                <Text style={styles.personSubDetail}>
                  {(mainUserCi ? `C.I. ${mainUserCi}` : '') + (mainUserCi && item.plate ? ' • ' : '') + (item.plate ? `Placa: ${item.plate}` : '')}
                </Text>
              </View>
            </View>
            <View style={styles.detailsGroup}>
              <DetailRow label="Tipo de visita" value={tipoAccesoText} />
              <DetailRow label="Estado" value={statusText} valueStyle={{color: statusColor, fontFamily: FONTS.semiBold}} />
              <DetailRow label="Fecha y hora de ingreso" value={getDateTimeStrMes(item.in_at)} />
              <DetailRow label="Fecha y hora de salida" value={getDateTimeStrMes(item.out_at)} />
              <DetailRow label="Guardia de ingreso" value={getFullName(item.guardia)} />
              <DetailRow label="Guardia de salida" value={getFullName(item.out_guard)} />
              <DetailRow label="Observación de ingreso" value={item.obs_in} />
              <DetailRow label="Observación de salida" value={item.obs_out} />
            </View>
          </View>
          <View style={styles.mainCard}>
            <Text style={styles.sectionTitleNoBorder}>Residente visitado</Text>
            <TouchableOpacity onPress={() => handleOpenPersonDetailModal(resident, 'Residente', item)} activeOpacity={0.7}>
              <View style={styles.personBlock}>
                <Avatar name={getFullName(resident)} src={getUrlImages('/OWNER-' + resident?.id + '.webp?d=' + resident?.updated_at)} w={40} h={40} />
                <View style={styles.personInfoContainer}>
                  <Text style={styles.personName}>{getFullName(resident)}</Text>
                  <Text style={styles.personSubDetail}>Unidad: {resident?.dpto?.[0]?.nro}, {resident?.dpto?.[0]?.description}</Text>
                </View>
                <Icon name={IconExpand} size={cssVar.sXl} color={cssVar.cWhiteV1} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainCard}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, styles.sectionTitleNoBorder]}>Visitante Principal</Text>
            {mainVisitor ? (
              <View style={styles.personBlock}>
                <Avatar name={mainUserFullName} src={mainVisitor?.url_avatar ? getUrlImages(mainVisitor.url_avatar) : undefined} w={40} h={40} />
                <View style={styles.personInfoContainer}>
                  <Text style={styles.personName}>{mainUserFullName}</Text>
                  <Text style={styles.personSubDetail}>{(mainUserCi ? `C.I. ${mainUserCi}` : '')}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.detailsGroup}>
              <DetailRow label="Tipo de visita" value={tipoAccesoText} />
              <DetailRow label="Estado" value={statusText} valueStyle={{color: statusColor, fontFamily: FONTS.semiBold}} />
              {(item.type === 'G' || item.type === 'I') && item.invitation?.title && <DetailRow label="Evento" value={item.invitation.title} />}
              <DetailRow label="Fecha y hora de ingreso" value={getDateTimeStrMes(item.in_at)} />
              <DetailRow label="Fecha y hora de salida" value={getDateTimeStrMes(item.out_at)} />
              <DetailRow label="Guardia de ingreso" value={getFullName(item.guardia)} />
              <DetailRow label="Guardia de salida" value={getFullName(item.out_guard)} />
              <DetailRow label="Observación de ingreso" value={item.obs_in} />
              <DetailRow label="Observación de salida" value={item.obs_out} />
              <DetailRow label={item.out_at ? "Visitó a" : "Visita a"} value={getFullName(resident)} />
              {(item.type === 'I' || item.type === 'G') && item.invitation?.date_event && <DetailRow label="Fecha de invitación" value={getDateStrMes(item.invitation.date_event)} />}
              {(item.type === 'I' || item.type === 'G') && item.invitation?.obs && <DetailRow label="Descripción (Invitación)" value={item.invitation.obs} />}
              {statusText === 'Denegado' && (<><DetailRow label="Fecha de denegación" value={getDateTimeStrMes(item.confirm_at)} /><DetailRow label="Motivo" value={item.obs_confirm} /></>)}
              <DetailRow label="Observación de solicitud" value={item.obs_guard} />
            </View>
          </View>
          {driver && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Taxista</Text>
              <TouchableOpacity onPress={() => handleOpenPersonDetailModal(driverAccess, 'Taxista', item)} activeOpacity={0.7}>
                <View style={styles.personBlock}>
                  <Avatar name={getFullName(driver)} src={driver?.url_avatar ? getUrlImages(driver.url_avatar) : undefined} w={40} h={40} />
                  <View style={styles.personInfoContainer}>
                    <Text style={styles.personName}>{getFullName(driver)}</Text>
                    <Text style={styles.personSubDetail}>{(driver.ci ? `C.I. ${driver.ci}` : '') + (driver.ci && driverAccess.plate ? ' • ' : '') + (driverAccess.plate ? `Placa: ${driverAccess.plate}` : '')}</Text>
                  </View>
                  <Icon name={IconExpand} size={cssVar.sXl} color={cssVar.cWhiteV1} />
                </View>
              </TouchableOpacity>
            </View>
          )}
          {companions && companions.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Acompañante{companions.length > 1 ? 's' : ''}</Text>
              {companions.map((companionAccess: any, index: number) => (
                <View key={`companion-wrapper-${companionAccess.id || index}`} style={index > 0 ? styles.additionalCompanionWrapper : null}>
                  <CompanionItem companionAccess={companionAccess} onPress={() => handleOpenPersonDetailModal(companionAccess, 'Acompañante', item)} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <ModalFull title={'Detalle del acceso'} open={open} onClose={onClose}>
        {(open && id) ? renderContent() : (open && !id ? <View style={styles.noDataContainer}><Text style={styles.noDataText}>ID no proporcionado.</Text></View> : null) }
      </ModalFull>

      {isPersonDetailModalVisible && modalPersonData && (
        <Modal 
          title={`Detalle del ${modalPersonData.typeLabel}`} 
          open={isPersonDetailModalVisible} 
          onClose={handleClosePersonDetailModal}
        >
          <ScrollView contentContainerStyle={styles.personDetailModalInnerContent}>
            <View style={styles.personDetailModalCardContent}>
              <View style={styles.personBlock}>
                <Avatar
                  name={getFullName(modalPersonData.person)}
                  src={modalPersonData.person?.url_avatar ? getUrlImages(modalPersonData.person.url_avatar) : undefined}
                  w={40}
                  h={40}
                />
                <View style={styles.personInfoContainer}>
                  <Text style={styles.personName}>{getFullName(modalPersonData.person)}</Text>
                  <Text style={styles.personSubDetail}>
                    {(modalPersonData.person?.ci ? `C.I. ${modalPersonData.person.ci}` : '') +
                     (modalPersonData.typeLabel === 'Taxista' && modalPersonData.person?.ci && modalPersonData.plate ? ' • ' : '') +
                     (modalPersonData.typeLabel === 'Taxista' && modalPersonData.plate ? `Placa: ${modalPersonData.plate}`: '')
                    }
                  </Text>
                </View>
              </View>
              <View style={styles.detailsGroup}>
                <DetailRow label="Estado" value={modalPersonData.statusText} valueStyle={{color: modalPersonData.statusColor, fontFamily: FONTS.semiBold}} />
                <DetailRow label="Fecha y hora de ingreso" value={getDateTimeStrMes(modalPersonData.accessInAt)} />
                <DetailRow label="Fecha y hora de salida" value={getDateTimeStrMes(modalPersonData.accessOutAt)} />
                <DetailRow label="Guardia de ingreso" value={getFullName(accessData?.guardia)} />
                <DetailRow label="Guardia de salida" value={getFullName(accessData?.out_guard)} />
                <DetailRow label="Observación de ingreso" value={modalPersonData.accessObsIn} />
                <DetailRow label="Observación de salida" value={modalPersonData.accessObsOut} />
              </View>
            </View>
          </ScrollView>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 12,
    gap: 16,
  },
  mainCard: {
    backgroundColor: cssVar.cBlackV2,
    padding: 12,
    borderRadius: 12,
    gap: 16,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    borderTopWidth: 0.5,
    borderTopColor: cssVar.cWhiteV1,
    paddingTop: 12,
    marginTop: 4,
  },
  sectionTitleNoBorder: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  personBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cssVar.cBlackV3,
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  personInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  personName: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
  },
  personSubDetail: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
    color: cssVar.cWhiteV1,
  },
  detailsGroup: {
    flexDirection: 'column',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
    color: cssVar.cWhiteV1,
    flex: 1,
    marginRight: 8,
  },
  detailValue: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
    textAlign: 'right',
    flex: 1.5,
  },
  additionalCompanionWrapper: {
    marginTop: 12,
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
  personDetailModalInnerContent: {
    paddingVertical: cssVar.spS,
  },
  personDetailModalCardContent: {
  },
});

export default AccessDetail;