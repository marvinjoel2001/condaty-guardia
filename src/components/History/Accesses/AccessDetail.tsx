import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import {
  getDateStrMes,
  getDateTimeStrMes,
  parseWeekDays,
} from '../../../../mk/utils/dates';
import { getFullName, getUrlImages } from '../../../../mk/utils/strings';
import useApi from '../../../../mk/hooks/useApi';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { IconExpand } from '../../../icons/IconLibrary';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import ImageExpandableModal from '../../../../mk/components/ui/ImageExpandableModal';

type Props = {
  open: boolean;
  onClose: () => void;
  id: string | null;
};

const DetailRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: any;
  valueStyle?: object;
}) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'string' && value.trim().toLowerCase() === 'n/a')
  ) {
    return null;
  }

  return (
    <View
      style={styles.detailRow}
      pointerEvents="none"
      onStartShouldSetResponder={() => false}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
      ) : (
        value
      )}
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
  url_image_p?: string[] | any;
}

interface CompanionItemProps {
  companionAccess: any;
  onPress: () => void;
}

const CompanionItem = ({ companionAccess, onPress }: CompanionItemProps) => {
  const person = companionAccess.visit || companionAccess;
  const companionFullName = getFullName(person) || 'N/A';
  const companionCi = person.ci ? `C.I. ${person.ci}` : 'CI no disponible';

  return (
    <ItemList
      title={companionFullName}
      subtitle={companionCi}
      left={
        <Avatar
          hasImage={person?.has_image}
          name={companionFullName}
          src={person.url_avatar ? getUrlImages(person.url_avatar) : undefined}
          w={40}
          h={40}
        />
      }
      right={
        <Icon
          name={IconExpand}
          size={cssVar.sXl}
          color={cssVar.cWhiteV1}
          onPress={onPress}
        />
      }
    />
  );
};

const AccessDetail = ({ open, onClose, id }: Props) => {
  const [accessData, setAccessData] = useState<any>(null);
  const { execute } = useApi();

  const [modalPersonData, setModalPersonData] =
    useState<ModalPersonData | null>(null);
  const [isPersonDetailModalVisible, setIsPersonDetailModalVisible] =
    useState(false);
  const [openExpandImg, setOpenExpandImg] = useState({
    open: false,
    imageUri: '',
  });

  const getAccess = async () => {
    try {
      const { data: apiResponse } = await execute(
        '/accesses',
        'GET',
        {
          fullType: 'DET',
          section: 'ACT',
          searchBy: id,
        },
        false,
        3,
      );
      if (apiResponse?.success) {
        // Support both legacy array and new object response shapes
        const respData = apiResponse?.data;
        const accessItem =
          (respData && (respData.access || respData[0])) || null;
        setAccessData(accessItem);
      } else {
        setAccessData(null);
      }
    } catch (error) {
      setAccessData(null);
    }
  };
  useEffect(() => {
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

  const getStatusForCompanionOrResident = (personData: any) => {
    if (personData.out_at)
      return { text: 'Completado', color: cssVar.cSuccess };
    if (personData.in_at) return { text: 'Por salir', color: cssVar.cSuccess };
    return { text: 'Pendiente', color: cssVar.cWhite };
  };

  const getStatusForTaxiDriver = (mainAccessItem: any) => {
    let text = 'Rechazado';
    let color = cssVar.cError;

    if (mainAccessItem.out_at) {
      text = 'Completado';
      color = cssVar.cSuccess;
    } else if (!mainAccessItem.confirm_at && mainAccessItem.status !== 'X') {
      text = 'Por confirmar';
      color = cssVar.cWarning;
    } else if (mainAccessItem.in_at) {
      text = 'Por salir';
      color = cssVar.cSuccess;
    } else if (mainAccessItem.confirm === 'Y') {
      text = 'Por ingresar';
      color = cssVar.cSuccess;
    } else if (mainAccessItem.status === 'X') {
      text = 'Anulado';
      color = cssVar.cError;
    }

    return { text, color };
  };

  const handleOpenPersonDetailModal = (
    personData: any,
    typeLabel: 'Acompañante' | 'Taxista' | 'Residente',
    mainAccessItem: any,
  ) => {
    let dataForModal: ModalPersonData;

    const personToShow =
      typeLabel === 'Acompañante' ? personData.visit || personData : personData;

    if (typeLabel === 'Acompañante' || typeLabel === 'Residente') {
      const { text, color } = getStatusForCompanionOrResident(personData);

      dataForModal = {
        person: personToShow,
        typeLabel,
        accessInAt: personData.in_at,
        accessOutAt: personData.out_at,
        accessObsIn: personData.obs_in,
        accessObsOut: personData.obs_out,
        statusText: text,
        statusColor: color,
      };
    } else {
      const { text, color } = getStatusForTaxiDriver(mainAccessItem);

      dataForModal = {
        person: personToShow.visit,
        typeLabel: 'Taxista',
        accessInAt: personToShow.in_at,
        accessOutAt: personToShow.out_at,
        accessObsIn: personToShow.obs_in,
        accessObsOut: personToShow.obs_out,
        plate: personToShow.plate,
        statusText: text,
        statusColor: color,
        url_image_p: personToShow.url_image_p,
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
    const companions =
      item.accesses?.filter((acc: any) => acc.taxi !== 'C') || [];

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
      ? 'Por ingresar'
      : item.status === 'X'
      ? 'Anulado'
      : 'Rechazado';

    if (
      statusText === 'Completado' ||
      statusText === 'Dentro del condominio' ||
      statusText === 'Por ingresar'
    )
      statusColor = cssVar.cSuccess;
    if (statusText === 'Anulado' || statusText === 'Rechazado')
      statusColor = cssVar.cError;
    if (statusText === 'Por confirmar') statusColor = cssVar.cWarning;

    let tipoAccesoText = 'Desconocido';
    switch (item.type) {
      case 'P':
        tipoAccesoText = `Pedido - ${
          item.other?.other_type?.name || 'General'
        }`;
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          showsVerticalScrollIndicator
          style={{ flex: 1 }}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.mainCard}>
            <View pointerEvents="none">
              <Text style={styles.sectionTitleNoBorder}>
                Resumen de la visita
              </Text>
            </View>
            <ItemList
              title={mainUserFullName}
              subtitle={
                (mainUserCi ? `C.I. ${mainUserCi}` : '') +
                (mainUserCi && item.plate ? ' • ' : '') +
                (item.plate ? `Placa: ${item.plate}` : '')
              }
              left={
                <Avatar
                  hasImage={mainVisitor?.has_image}
                  name={mainUserFullName}
                  src={
                    mainVisitor?.url_avatar
                      ? getUrlImages(mainVisitor.url_avatar)
                      : undefined
                  }
                  w={40}
                  h={40}
                />
              }
            />
            <View style={styles.detailsGroup}>
              <DetailRow label="Tipo de visita" value={tipoAccesoText} />
              <DetailRow
                label="Estado"
                value={statusText}
                valueStyle={{ color: statusColor, fontFamily: FONTS.semiBold }}
              />
              <DetailRow
                label="Fecha y hora de ingreso"
                value={getDateTimeStrMes(item.in_at)}
              />
              <DetailRow
                label="Fecha y hora de salida"
                value={getDateTimeStrMes(item.out_at)}
              />
              <DetailRow
                label="Guardia de ingreso"
                value={getFullName(item.guardia)}
              />
              <DetailRow
                label="Guardia de salida"
                value={
                  item.out_at
                    ? getFullName(item.out_guard || item.guardia)
                    : null
                }
              />
              <DetailRow label="Observación de ingreso" value={item.obs_in} />
              <DetailRow label="Observación de salida" value={item.obs_out} />
              {companions && companions.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View pointerEvents="none">
                    <Text style={styles.sectionTitle}>
                      Acompañante{companions.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  {companions.map((companionAccess: any, index: number) => (
                    <View
                      key={`companion-wrapper-${companionAccess.id || index}`}
                      style={
                        index > 0 ? styles.additionalCompanionWrapper : null
                      }
                    >
                      <CompanionItem
                        companionAccess={companionAccess}
                        onPress={() =>
                          handleOpenPersonDetailModal(
                            companionAccess,
                            'Acompañante',
                            item,
                          )
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
              {driver && (
                <View style={styles.sectionContainer}>
                  <View pointerEvents="none">
                    <Text style={styles.sectionTitle}>Taxista</Text>
                  </View>
                  <ItemList
                    title={getFullName(driver)}
                    subtitle={
                      (driver.ci ? `C.I. ${driver.ci}` : '') +
                      (driver.ci && driverAccess.plate ? ' • ' : '') +
                      (driverAccess.plate ? `Placa: ${driverAccess.plate}` : '')
                    }
                    left={
                      <Avatar
                        hasImage={driver?.has_image}
                        name={getFullName(driver)}
                        src={getUrlImages(
                          '/VISIT-' +
                            driver?.id +
                            '.webp?d=' +
                            driver?.updated_at,
                        )}
                        w={40}
                        h={40}
                      />
                    }
                    right={
                      <Icon
                        name={IconExpand}
                        size={cssVar.sXl}
                        color={cssVar.cWhiteV1}
                        onPress={() =>
                          handleOpenPersonDetailModal(
                            driverAccess,
                            'Taxista',
                            item,
                          )
                        }
                      />
                    }
                  />
                </View>
              )}
            </View>
          </View>
          <View style={styles.mainCardR}>
            <View pointerEvents="none">
              <Text style={styles.sectionTitleNoBorder}>
                Residente visitado
              </Text>
            </View>
            <ItemList
              title={getFullName(resident)}
              subtitle2={
                [
                  resident?.dpto?.[0]?.nro &&
                    `${resident?.dpto?.[0]?.type?.name || 'Unidad'}: ${
                      resident?.dpto?.[0]?.nro
                    }`,

                  resident?.dpto?.[0]?.description?.trim(),
                ]
                  .filter(Boolean)
                  .join(', ') || 'Sin unidad asignada'
              }
              left={
                <Avatar
                  hasImage={resident?.has_image}
                  name={getFullName(resident)}
                  src={getUrlImages(
                    '/OWNER-' +
                      resident?.id +
                      '.webp?d=' +
                      resident?.updated_at,
                  )}
                  w={40}
                  h={40}
                />
              }
              right={
                <Icon
                  name={IconExpand}
                  size={cssVar.sXl}
                  color={cssVar.cWhiteV1}
                  onPress={() =>
                    handleOpenPersonDetailModal(resident, 'Residente', item)
                  }
                />
              }
            />
          </View>
        </ScrollView>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={{ flex: 1 }}
        onStartShouldSetResponder={() => true}
      >
        <View style={styles.mainCard}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, styles.sectionTitleNoBorder]}>
              Resumen de la visita
            </Text>
            {mainVisitor ? (
              <ItemList
                title={mainUserFullName}
                subtitle={`C.I. ${
                  (item?.type == 'O' ? item?.owner?.ci : item?.visit?.ci) ||
                  '-/-'
                } ${
                  (item?.plate && !driverAccess && '- Placa: ' + item?.plate) ||
                  ''
                } `}
                left={
                  <Avatar
                    hasImage={mainVisitor?.has_image}
                    name={mainUserFullName}
                    src={getUrlImages(
                      '/VISIT-' +
                        mainVisitor?.id +
                        '.webp?d=' +
                        mainVisitor?.updated_at,
                    )}
                    w={40}
                    h={40}
                  />
                }
              />
            ) : null}
            <View style={styles.detailsGroup}>
              <DetailRow label="Tipo de visita" value={tipoAccesoText} />
              <DetailRow
                label="Estado"
                value={statusText}
                valueStyle={{ color: statusColor, fontFamily: FONTS.semiBold }}
              />
              {(item.type === 'G' || item.type === 'I') &&
                item.invitation?.title && (
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

              <DetailRow
                label="Guardia de ingreso"
                value={
                  statusText === 'Rechazado' ? null : getFullName(item.guardia)
                }
              />
              <DetailRow
                label="Guardia de salida"
                value={
                  statusText === 'Rechazado'
                    ? null
                    : item.out_at
                    ? getFullName(item.out_guard || item.guardia)
                    : null
                }
              />
              <DetailRow label="Observación de ingreso" value={item.obs_in} />
              <DetailRow label="Observación de salida" value={item.obs_out} />
              {statusText !== 'Rechazado' && (
                <DetailRow
                  label="Motivo del ingreso"
                  value={item.obs_confirm}
                />
              )}
              {!(item.type === 'I' || item.type === 'G') && (
                <DetailRow
                  label={item.out_at ? 'Visitó a' : 'Visita a'}
                  value={getFullName(resident)}
                />
              )}
              {(item.type === 'I' || item.type === 'G') &&
                item.invitation?.date_event && (
                  <DetailRow
                    label="Fecha de invitación"
                    value={getDateStrMes(item.invitation.date_event)}
                  />
                )}
              {(item.type === 'I' || item.type === 'G') &&
                item.invitation?.obs && (
                  <DetailRow
                    label="Descripción (Invitación)"
                    value={item.invitation.obs}
                  />
                )}
              {statusText === 'Rechazado' && (
                <>
                  <DetailRow
                    label="Fecha de denegación"
                    value={getDateTimeStrMes(item.confirm_at)}
                  />
                  <DetailRow label="Motivo" value={item.obs_confirm} />
                </>
              )}
              <DetailRow
                label="Observación de solicitud"
                value={item.obs_guard}
              />
              {item?.confirm_at && (
                <DetailRow
                  label={
                    item?.confirm == 'Y' ? 'Aprobado por' : 'Rechazado por'
                  }
                  value={
                    <View
                      style={{
                        backgroundColor:
                          item?.rejected_guard_id !== null
                            ? '#F37F3D33'
                            : cssVar.cHoverSuccess,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                      }}
                      pointerEvents="none"
                    >
                      <Text
                        style={{
                          color:
                            item?.rejected_guard_id !== null
                              ? cssVar.cAlertMedio
                              : cssVar.cSuccess,
                        }}
                      >
                        {item?.rejected_guard_id !== null
                          ? 'Guardia'
                          : 'Residente'}
                      </Text>
                    </View>
                  }
                />
              )}

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {item?.url_image_p && (
                  <TouchableOpacity
                    onPress={() =>
                      setOpenExpandImg({
                        open: true,
                        imageUri: item?.url_image_p[0],
                      })
                    }
                  >
                    <Image
                      source={{
                        uri: item?.url_image_p[0],
                      }}
                      width={100}
                      height={100}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                  </TouchableOpacity>
                )}
                {item?.visit?.url_image_a && (
                  <TouchableOpacity
                    onPress={() =>
                      setOpenExpandImg({
                        open: true,
                        imageUri: item?.visit?.url_image_a[0],
                      })
                    }
                  >
                    <Image
                      source={{
                        uri: item?.visit?.url_image_a[0],
                      }}
                      width={100}
                      height={100}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                  </TouchableOpacity>
                )}
                {item?.visit?.url_image_r && (
                  <TouchableOpacity
                    onPress={() =>
                      setOpenExpandImg({
                        open: true,
                        imageUri: item?.visit?.url_image_r[0],
                      })
                    }
                  >
                    <Image
                      source={{
                        uri: item?.visit?.url_image_r[0],
                      }}
                      width={100}
                      height={100}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* {item?.rejected_guard_id !== null && (
                <DetailRow
                  label="  Rechazado por: "
                  value={getFullName(item.guardia)}
                />
              )} */}
            </View>
          </View>

          {companions && companions.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Acompañante{companions.length > 1 ? 's' : ''}
              </Text>
              {companions.map((companionAccess: any, index: number) => (
                <View
                  key={`companion-wrapper-${companionAccess.id || index}`}
                  style={index > 0 ? styles.additionalCompanionWrapper : null}
                >
                  <CompanionItem
                    companionAccess={companionAccess}
                    onPress={() =>
                      handleOpenPersonDetailModal(
                        companionAccess,
                        'Acompañante',
                        item,
                      )
                    }
                  />
                </View>
              ))}
            </View>
          )}
          {driver && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Taxista</Text>
              <ItemList
                title={getFullName(driver)}
                subtitle={
                  (driver.ci ? `C.I. ${driver.ci}` : '') +
                  (driver.ci && driverAccess.plate ? ' • ' : '') +
                  (driverAccess.plate ? `Placa: ${driverAccess.plate}` : '')
                }
                left={
                  <Avatar
                    hasImage={driver?.has_image}
                    name={getFullName(driver)}
                    src={getUrlImages(
                      '/VISIT-' + driver?.id + '.webp?d=' + driver?.updated_at,
                    )}
                    w={40}
                    h={40}
                  />
                }
                right={
                  <Icon
                    name={IconExpand}
                    size={cssVar.sXl}
                    color={cssVar.cWhiteV1}
                    onPress={() =>
                      handleOpenPersonDetailModal(driverAccess, 'Taxista', item)
                    }
                  />
                }
              />
            </View>
          )}
        </View>
        <View style={styles.mainCardR}>
          <Text style={styles.sectionTitleNoBorder}>Residente visitado</Text>
          <ItemList
            title={getFullName(resident)}
            subtitle={[
              `${resident?.dpto?.[0]?.type?.name || 'Unidad'}: ${
                resident?.dpto?.[0]?.nro
              }`,
              resident?.dpto?.[0]?.description,
            ]
              .filter(Boolean)
              .join(', ')}
            left={
              <Avatar
                hasImage={resident?.has_image}
                name={getFullName(resident)}
                src={getUrlImages(
                  '/OWNER-' + resident?.id + '.webp?d=' + resident?.updated_at,
                )}
                w={40}
                h={40}
              />
            }
            right={
              (item.type === 'I' || item.type === 'G' || item.type === 'F') && (
                <Icon
                  name={IconExpand}
                  size={cssVar.sXl}
                  color={cssVar.cWhiteV1}
                  onPress={() =>
                    handleOpenPersonDetailModal(resident, 'Residente', item)
                  }
                />
              )
            }
          />
        </View>
      </ScrollView>
    );
  };

  const renderBody = () => {
    if (!open) return null;
    if (id) return renderContent();

    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>ID no proporcionado.</Text>
      </View>
    );
  };
  return (
    <ModalFull
      title={'Detalle del acceso'}
      open={open}
      onClose={onClose}
      // scrollViewHide
      disableFormPress
    >
      {renderBody()}
      {isPersonDetailModalVisible && modalPersonData && (
        <Modal
          title={
            modalPersonData.typeLabel === 'Residente'
              ? 'Detalle de invitación'
              : `Detalle del ${modalPersonData.typeLabel}`
          }
          open={isPersonDetailModalVisible}
          onClose={handleClosePersonDetailModal}
        >
          <ScrollView
            contentContainerStyle={styles.personDetailModalInnerContent}
          >
            <View style={styles.personDetailModalCardContent}>
              {modalPersonData.typeLabel === 'Residente' && accessData ? (
                <>
                  <ItemList
                    style={{ marginBottom: 12 }}
                    title={getFullName(modalPersonData.person)}
                    subtitle={[
                      `${
                        modalPersonData.person?.dpto?.[0]?.type?.name ||
                        'Unidad'
                      }: ${modalPersonData.person?.dpto?.[0]?.nro}`,
                      modalPersonData.person?.dpto?.[0]?.description,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    left={
                      <Avatar
                        hasImage={modalPersonData.person?.has_image}
                        name={getFullName(modalPersonData.person)}
                        src={getUrlImages(
                          '/OWNER-' +
                            modalPersonData.person?.id +
                            '.webp?d=' +
                            modalPersonData.person?.updated_at,
                        )}
                        w={40}
                        h={40}
                      />
                    }
                  />
                  <View style={styles.detailsGroup}>
                    {accessData.type === 'I' && (
                      <>
                        <DetailRow
                          label="Tipo de invitación"
                          value={
                            accessData.invitation?.type_name || 'QR Individual'
                          }
                        />
                        <DetailRow
                          label="Fecha de invitación"
                          value={getDateStrMes(
                            accessData.invitation?.date_event,
                          )}
                        />
                        <DetailRow
                          label="Descripción"
                          value={accessData.invitation?.obs}
                        />
                      </>
                    )}
                    {accessData.type === 'G' && (
                      <>
                        <DetailRow
                          label="Tipo de invitación"
                          value={
                            accessData.invitation?.type_name || 'QR Grupal'
                          }
                        />
                        <DetailRow
                          label="Evento"
                          value={accessData.invitation?.title}
                        />
                        <DetailRow
                          label="Cantidad de invitados"
                          value={accessData.invitation?.max_companions?.toString()}
                        />
                        <DetailRow
                          label="Descripción"
                          value={accessData.invitation?.obs}
                        />
                      </>
                    )}
                    {accessData.type === 'F' && (
                      <>
                        <DetailRow
                          label="Tipo de invitación"
                          value={
                            accessData.invitation?.type_name || 'QR Frecuente'
                          }
                        />
                        <DetailRow
                          label="Periodo de validez"
                          value={
                            accessData.invitation?.start_date &&
                            accessData.invitation?.end_date
                              ? `${getDateStrMes(
                                  accessData.invitation?.start_date,
                                )} a ${getDateStrMes(
                                  accessData.invitation?.end_date,
                                )}`
                              : undefined
                          }
                        />
                        <DetailRow
                          label="Indicaciones"
                          value={accessData.invitation?.obs}
                        />
                        <View
                          style={{
                            height: 0.5,
                            backgroundColor: cssVar.cWhiteV1,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            color: cssVar.cWhite,
                            fontFamily: FONTS.semiBold,
                            marginBottom: 12,
                          }}
                        >
                          Configuración avanzada
                        </Text>
                        <DetailRow
                          label="Días de acceso"
                          value={
                            accessData.invitation?.weekday
                              ? parseWeekDays(
                                  accessData.invitation?.weekday,
                                ).join(', ')
                              : undefined
                          }
                        />
                        <DetailRow
                          label="Horario permitido"
                          value={
                            accessData.invitation?.start_time &&
                            accessData.invitation?.end_time
                              ? `${accessData.invitation?.start_time.slice(
                                  0,
                                  5,
                                )} - ${accessData.invitation?.end_time.slice(
                                  0,
                                  5,
                                )}`
                              : undefined
                          }
                        />
                        <DetailRow
                          label="Cantidad de accesos"
                          value={accessData.invitation?.max_entries?.toString()}
                        />
                      </>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <ItemList
                    style={{ marginBottom: 12 }}
                    title={getFullName(modalPersonData.person)}
                    subtitle={
                      (modalPersonData.person?.ci
                        ? `C.I. ${modalPersonData.person.ci}`
                        : '') +
                      (modalPersonData.typeLabel === 'Taxista' &&
                      modalPersonData.person?.ci &&
                      modalPersonData.plate
                        ? ' • '
                        : '') +
                      (modalPersonData.typeLabel === 'Taxista' &&
                      modalPersonData.plate
                        ? `Placa: ${modalPersonData.plate}`
                        : '')
                    }
                    left={
                      <Avatar
                        hasImage={modalPersonData.person?.has_image}
                        name={getFullName(modalPersonData.person)}
                        src={getUrlImages(
                          '/OWNER-' +
                            modalPersonData.person?.id +
                            '.webp?d=' +
                            modalPersonData.person?.updated_at,
                        )}
                        w={40}
                        h={40}
                      />
                    }
                  />
                  <View style={styles.detailsGroup}>
                    <DetailRow
                      label="Estado"
                      value={modalPersonData.statusText}
                      valueStyle={{
                        color: modalPersonData.statusColor,
                        fontFamily: FONTS.semiBold,
                      }}
                    />
                    <DetailRow
                      label="Fecha y hora de ingreso"
                      value={getDateTimeStrMes(modalPersonData.accessInAt)}
                    />
                    <DetailRow
                      label="Fecha y hora de salida"
                      value={getDateTimeStrMes(modalPersonData.accessOutAt)}
                    />
                    <DetailRow
                      label="Guardia de ingreso"
                      value={getFullName(accessData?.guardia)}
                    />
                    <DetailRow
                      label="Guardia de salida"
                      value={getFullName(accessData?.out_guard)}
                    />
                    <DetailRow
                      label="Observación de ingreso"
                      value={modalPersonData.accessObsIn}
                    />
                    <DetailRow
                      label="Observación de salida"
                      value={modalPersonData.accessObsOut}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {modalPersonData?.url_image_p && (
                      <TouchableOpacity
                        onPress={() =>
                          setOpenExpandImg({
                            open: true,
                            imageUri: modalPersonData?.url_image_p[0],
                          })
                        }
                      >
                        <Image
                          source={{
                            uri: modalPersonData?.url_image_p[0],
                          }}
                          width={100}
                          height={100}
                          style={{ width: 100, height: 100, borderRadius: 8 }}
                        />
                      </TouchableOpacity>
                    )}
                    {modalPersonData?.person?.url_image_a && (
                      <TouchableOpacity
                        onPress={() =>
                          setOpenExpandImg({
                            open: true,
                            imageUri: modalPersonData?.person?.url_image_a[0],
                          })
                        }
                      >
                        <Image
                          source={{
                            uri: modalPersonData?.person?.url_image_a[0],
                          }}
                          width={100}
                          height={100}
                          style={{ width: 100, height: 100, borderRadius: 8 }}
                        />
                      </TouchableOpacity>
                    )}
                    {modalPersonData?.person?.url_image_r && (
                      <TouchableOpacity
                        onPress={() =>
                          setOpenExpandImg({
                            open: true,
                            imageUri: modalPersonData?.person?.url_image_r[0],
                          })
                        }
                      >
                        <Image
                          source={{
                            uri: modalPersonData?.person?.url_image_r[0],
                          }}
                          width={100}
                          height={100}
                          style={{ width: 100, height: 100, borderRadius: 8 }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </Modal>
      )}
      {openExpandImg.open && (
        <ImageExpandableModal
          visible={openExpandImg.open}
          imageUri={openExpandImg.imageUri}
          onClose={() => setOpenExpandImg({ open: false, imageUri: '' })}
        />
      )}
    </ModalFull>
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
  mainCardR: {
    backgroundColor: cssVar.cBlackV2,
    padding: 12,
    borderRadius: 12,
    gap: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  personInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    marginTop: 12,
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
  personDetailModalCardContent: {},
});

export default AccessDetail;
