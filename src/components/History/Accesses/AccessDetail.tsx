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
  isFrequentOrGroup?: boolean;
  onPress: () => void;
}

const CompanionItem = ({ companionAccess, isFrequentOrGroup, onPress }: CompanionItemProps) => {
  const visit = companionAccess.visit;

  if (!visit) return null;

  const companionFullName = getFullName(visit) || 'N/A';
  const companionCi = visit.ci ? `C.I. ${visit.ci}` : 'CI no disponible';


  return (
    <TouchableOpacity style={styles.personBlock} onPress={onPress} activeOpacity={0.7}>
      <Avatar
        name={companionFullName}
        src={visit.url_avatar ? getUrlImages(visit.url_avatar) : undefined}
        w={40}
        h={40}
        fontSize={cssVar.sL}
        circle={false}
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

  const handleOpenPersonDetailModal = (personData: any, typeLabel: 'Acompañante' | 'Taxista', mainAccessItem: any) => {
    let dataForModal: ModalPersonData;
    let statusTextForModal = '';
    let statusColorForModal = cssVar.cWhite;

    if (typeLabel === 'Acompañante') {
      statusTextForModal = personData.out_at ? 'Completado' : personData.in_at ? 'Dentro' : 'Pendiente';
      if (statusTextForModal === 'Completado' || statusTextForModal === 'Dentro') statusColorForModal = cssVar.cSuccess;

      dataForModal = {
        person: personData.visit,
        typeLabel: 'Acompañante',
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
        person: personData, 
        typeLabel: 'Taxista',
        accessInAt: mainAccessItem.in_at,
        accessOutAt: mainAccessItem.out_at,
        accessObsIn: mainAccessItem.obs_in, 
        accessObsOut: mainAccessItem.obs_out, 
        plate: mainAccessItem.plate,
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
    const mainUser = item.visit || item.owner;
    const mainUserFullName = getFullName(mainUser) || 'N/A';
    const mainUserCi = mainUser?.ci;
    const mainUserPlate = item.plate && !item.taxi ? item.plate : null;
    const taxiUser = item.taxi ? item.visit : null;

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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainCard}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, styles.sectionTitleNoBorder]}>Resumen</Text>
            <View style={styles.personBlock}>
              <Avatar
                name={mainUserFullName}
                src={mainUser?.url_avatar ? getUrlImages(mainUser.url_avatar) : undefined}
                w={40}
                h={40}

                fontSize={cssVar.sL}
               
              />
              <View style={styles.personInfoContainer}>
                <Text style={styles.personName}>{mainUserFullName}</Text>
                <Text style={styles.personSubDetail}>
                  {(mainUserCi ? `C.I. ${mainUserCi}` : '') +
                  (mainUserCi && mainUserPlate && !taxiUser ? ' • ' : '') +
                  (mainUserPlate && !taxiUser ? `Placa: ${mainUserPlate}` : '') || (mainUserCi ? '' : 'Datos no disponibles')}
                </Text>
              </View>
            </View>
            <View style={styles.detailsGroup}>
              <DetailRow label="Tipo de visita" value={tipoAccesoText} />
              <DetailRow label="Estado" value={statusText} valueStyle={{color: statusColor, fontFamily: FONTS.semiBold}} />
              { (item.type === 'G' || item.type === 'I' || item.type === 'F') && item.invitation?.title && (
                <DetailRow label="Evento" value={item.invitation.title} />
              )}
              <DetailRow
                  label="Fecha y hora de ingreso"
                  value={getDateTimeStrMes(item.in_at)}
              />
              <DetailRow
                  label="Fecha y hora de salida"
                  value={getDateTimeStrMes(item.out_at)}
              />
              <DetailRow label="Guardia de ingreso" value={getFullName(item.guardia)} />
              <DetailRow label="Guardia de salida" value={getFullName(item.out_guard)} />
              <DetailRow label="Observación de ingreso" value={item.obs_in} />
              <DetailRow label="Observación de salida" value={item.obs_out} />

              {item.type === 'O' && (
                <>
                  <DetailRow label="Residente" value={getFullName(item.owner)} />
                </>
              )}
              {item.type !== 'O' && (
                <>
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
                  <DetailRow label="Observación de solicitud" value={item.obs_guard} />
                </>
              )}
            </View>
          </View>

          {taxiUser && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Taxista</Text>
              <TouchableOpacity onPress={() => handleOpenPersonDetailModal(taxiUser, 'Taxista', item)} activeOpacity={0.7}>
                <View style={styles.personBlock}>
                  <Avatar
                      name={getFullName(taxiUser)}
                      src={taxiUser.url_avatar ? getUrlImages(taxiUser.url_avatar) : undefined}
                      w={40}
                      h={40}
                      fontSize={cssVar.sL}
              
                    />
                    <View style={styles.personInfoContainer}>
                      <Text style={styles.personName}>{getFullName(taxiUser)}</Text>
                      <Text style={styles.personSubDetail}>
                          {(taxiUser.ci ? `C.I. ${taxiUser.ci}` : '') +
                           (taxiUser.ci && item.plate ? ' • ' : '') +
                           (item.plate ? `Placa: ${item.plate}` : '') || 'Datos no disponibles'}
                      </Text>
                    </View>
                    <Icon name={IconExpand} size={cssVar.sXl} color={cssVar.cWhiteV1} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {item.accesses && item.accesses.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Acompañante{item.accesses.length > 1 ? 's' : ''}</Text>
              {item.accesses.map((companionAccess: any, index: number) => (
                <View key={`companion-wrapper-${companionAccess.id || index}`} style={index > 0 ? styles.additionalCompanionWrapper : null}>
                  <CompanionItem
                    companionAccess={companionAccess}
                    isFrequentOrGroup={isFrequentOrGroup}
                    onPress={() => handleOpenPersonDetailModal(companionAccess, 'Acompañante', item)}
                  />
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
      <ModalFull title={'Detalle de la visita'} open={open} onClose={onClose}>
        {(open && id) ? renderContent() : (open && !id ? <View style={styles.noDataContainer}><Text style={styles.noDataText}>ID no proporcionado.</Text></View> : null) }
      </ModalFull>

      {isPersonDetailModalVisible && modalPersonData && (
        <Modal 
          title={modalPersonData.typeLabel === 'Acompañante' ? 'Detalle del Acompañante' : 'Detalle del Taxista'} 
          open={isPersonDetailModalVisible} 
          onClose={handleClosePersonDetailModal}
        >
          {/* El ScrollView y el contenido principal, sin el encabezado manual */}
          <ScrollView contentContainerStyle={styles.personDetailModalInnerContent}>
            <View style={styles.personDetailModalCardContent}>
              <View style={styles.personBlock}>
                <Avatar
                  name={getFullName(modalPersonData.person)}
                  src={modalPersonData.person?.url_avatar ? getUrlImages(modalPersonData.person.url_avatar) : undefined}
                  w={40}
                  h={40}
                  fontSize={cssVar.sL}
                 
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
    paddingBottom: cssVar.spXxl,
  },
  mainCard: {
    flex: 1,
    backgroundColor: cssVar.cBlackV2,
    padding: cssVar.spM,
    borderRadius: cssVar.bRadiusL,
    marginTop: cssVar.spM,
  },
  sectionContainer: {
    marginBottom: cssVar.spL,
  
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    borderTopWidth: 0.5,
    borderTopColor: cssVar.cWhiteV1,
    paddingTop: cssVar.spS,
    marginTop: cssVar.spS,
  },
  sectionTitleNoBorder: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  personBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cssVar.cWhiteV2,
    padding: cssVar.spS,
    borderRadius: cssVar.bRadiusS,
    gap: cssVar.spS,
  },
  personAvatar: {
    borderRadius: cssVar.bRadiusS,
  },
  personAvatarText: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cBlack,
  },
  personInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
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
    gap: cssVar.spM,
    
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
    marginRight: cssVar.spS,
  },
  detailValue: {
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    color: cssVar.cWhite,
    textAlign: 'right',
    flex: 1.5,
  },
  companionItemContainer: {
    gap: cssVar.spS,
  },
  companionDetails: {
    marginTop: cssVar.spS,
    flexDirection: 'column',
    gap: cssVar.spS,
    paddingLeft: cssVar.spS,
    paddingBottom: cssVar.spS,
    borderTopWidth: 1,
    borderTopColor: cssVar.cBlackV3,
  },
  additionalCompanionWrapper: {
    marginTop: cssVar.spM,
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
  personDetailModalScroll: {
    flexGrow: 1,
    justifyContent: 'center', 
    padding: cssVar.spM,
  },
  personDetailModalCard: {
    backgroundColor: cssVar.cBlack, 
    borderRadius: cssVar.bRadiusL,
    padding: cssVar.spL,
    maxHeight: '90%', 
  },
  personDetailModalInnerContent: { // Nuevo estilo para el contentContainerStyle del ScrollView interno
    paddingVertical: cssVar.spS, // Un poco de padding si es necesario, Modal ya podría tenerlo
  },
  personDetailModalCardContent: { // Nuevo estilo para el View que envuelve el contenido principal del modal
    // backgroundColor: cssVar.cBlack, // El Modal ya tiene este fondo en su theme.container
    // borderRadius: cssVar.bRadiusL, // El Modal ya tiene esto
    // padding: cssVar.spL, // El Modal theme.body ya tiene paddingHorizontal y Vertical
    // No es necesario repetir estilos que el componente Modal ya aplica.
    // Solo se necesitarían estilos adicionales si quieres algo específico aquí.
    // Por ahora, lo dejamos vacío o con ajustes mínimos si son necesarios.
  },
});

export default AccessDetail;