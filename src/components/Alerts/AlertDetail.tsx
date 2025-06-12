import React, {useEffect, useState} from 'react';
import useApi from '../../../mk/hooks/useApi';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {ActivityIndicator, StyleSheet, Text, View, ScrollView} from 'react-native';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {formatToDayDDMMYYYYHHMM, getDateTimeAgo, getDateTimeStrMes} from '../../../mk/utils/dates';
import Button from '../../../mk/components/forms/Button/Button';
import {levelAlerts, statusColor, statusColorPanic} from './Alerts';
import KeyValue from '../../../mk/components/ui/KeyValue';
import LineDetail from '../Home/Accesses/shares/LineDetail';
import {
  IconAlert,
  IconAmbulance,
  IconFlame,
  IconTheft,
  IconClock,
} from '../../icons/IconLibrary';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';

type PropsType = {
  id: any;
  open: boolean;
  onClose: () => void;
};

const AlertDetail = ({id, open, onClose}: PropsType) => {
  const [details, setDetails]: any = useState({});

  const {execute, loaded} = useApi();

  const getAlert = async () => {
    const {data} = await execute('/alerts', 'GET', {
      fullType: 'DET',
      searchBy: id,
    });
    if (data?.success) {
      setDetails(data?.data?.data);
    }
  };
  useEffect(() => {
    getAlert();
  }, []);
  const _onClose = () => {
    onClose();
    setDetails({});
  };
  const renderAlertPanic = () => {
    let icon: any;

    switch (details?.type) {
      case 'F':
        icon = IconFlame;
        break;
      case 'E':
        icon = IconAmbulance;
        break;
      case 'T':
        icon = IconTheft;
        break;
      case 'O':
        icon = IconAlert;
        break;
      default:
    }
    return (
      <View
        style={{
          ...styles.alertPanic,
          backgroundColor: statusColorPanic[details?.type]?.background,
          borderColor: statusColorPanic[details?.type]?.border,
        }}>
        <Icon name={icon} color={cssVar.cWhite} />
        <Text
          style={{
            ...styles.text,
            color: cssVar.cWhite,
            marginTop: 8,
          }}>
          {details?.descrip}
        </Text>
      </View>
    );
  };

  const onSaveAttend = async () => {
    const {data} = await execute('/attend', 'POST', {
      id: details?.id,
    });
    if (data?.success == true) {
      _onClose();
    }
  };

  const renderContent = () => {
    if (!loaded) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{color: cssVar.cWhite}}>Cargando...</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainCard}>
          {details?.level == 4 ? (
            <>
              <View >
                <Text style={styles.sectionTitle}>Tipo de emergencia</Text>
                {renderAlertPanic()}
              </View>
              <View style={styles.divider} />
              <View style={styles.informantContainer}>
                <Text style={styles.sectionTitle}>Informante</Text>
                <ItemList
                  title={getFullName(details?.owner)}
                  subtitle={
                    details?.owner?.dpto?.[0]?.nro +
                    ', ' +
                    details?.owner?.dpto?.[0]?.description
                  }
                  left={
                    <Avatar
                      src={getUrlImages(
                        '/OWNER-' +
                          details?.owner?.id +
                          '.webp?d=' +
                          details?.updated_at,
                      )}
                      name={getFullName(details?.owner)}
                    />
                  }
                />
              </View>
              
              <KeyValue
                keys="Fecha del reporte:"
                value={
                  <Text style={{fontSize: 14,
                    color: cssVar.cWhite,
                    fontFamily: FONTS.medium,
                  }}>
                    {formatToDayDDMMYYYYHHMM(details?.created_at, true)}
                  </Text>}
              />
              <View style={styles.divider} />
              
            
              {!details?.date_at ? (
                <View style={styles.pendingContainer}>
                  <View style={{ padding: 8 }}>
                    <Icon name={IconClock} size={40} color={cssVar.cError} viewBox="0 0 32 32"/>
                  </View>
                  <Text style={styles.pendingText}>Pendiente de atención</Text>
                </View>
              ) : (
                <View style={styles.attendedContainer}>
                  <Text style={styles.sectionTitle}>Atendida por</Text>
                  <ItemList
                    title={getFullName(
                      details?.gua_attend || details?.adm_attend,
                    )}
                    subtitle={
                      details?.gua_attend
                        ? 'Guardia -' + getDateTimeStrMes(details?.date_at, true)
                        : 'Administrador -' +
                          getDateTimeStrMes(details?.date_at, true)
                    }
                    left={
                      <Avatar
                        src={
                          details?.gua_attend
                            ? getUrlImages(
                                '/GUARD-' +
                                  details?.gua_attend?.id +
                                  '.webp?d=' +
                                  details?.updated_at,
                              )
                            : getUrlImages(
                                '/ADM-' +
                                  details?.adm_attend?.id +
                                  '.webp?d=' +
                                  details?.updated_at,
                              )
                        }
                        name={getFullName(
                          details?.gua_attend || details?.adm_attend,
                        )}
                      />
                    }
                  />
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.text}>{details?.descrip}</Text>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Informante</Text>
                <ItemList
                  title={getFullName(details?.guardia)}
                  subtitle={
                    'Guardia' 
                  
                     
                    
                  }
                  left={
                    <Avatar
                      src={getUrlImages(
                        '/GUARD-' +
                          details?.guardia?.id +
                          '.webp?d=' +
                          details?.updated_at,
                      )}
                      name={getFullName(details?.guardia)}
                    />
                  }
                />
                
                <KeyValue
                  style={{fontSize: 14}}
                  keys="Fecha del reporte:"
                  value={
                    <Text style={{fontSize: 14,
                      color: cssVar.cWhite,
                      fontFamily: FONTS.medium,
                    }}>
                      {formatToDayDDMMYYYYHHMM(details?.created_at, true)}
                    </Text>
                  }
                />
                {details?.level !== 4 && (
                  <KeyValue
                    style={{fontSize: 14}}
                    keys="Nivel de alerta:"
                    value={
                      <Text
                        style={{
                          color: statusColor[details?.level]?.color,
                          fontSize: 14,
                          fontFamily: FONTS.medium,
                        }}>
                        {levelAlerts[details?.level]}
                      </Text>
                    }
                  />
                )}
                
                {details?.date_at && (
                  <View style={styles.attendedContainer}>
                    <Text style={styles.sectionTitle}>Atendida por</Text>
                    <ItemList
                      title={getFullName(
                        details?.gua_attend || details?.adm_attend,
                      )}
                      subtitle={
                        details?.gua_attend
                          ? 'Guardia -' + getDateTimeStrMes(details?.date_at, true)
                          : 'Administrador -' +
                            getDateTimeStrMes(details?.date_at, true)
                      }
                      left={
                        <Avatar
                          src={
                            details?.gua_attend
                              ? getUrlImages(
                                  '/GUARD-' +
                                    details?.gua_attend?.id +
                                    '.webp?d=' +
                                    details?.updated_at,
                                )
                              : getUrlImages(
                                  '/ADM-' +
                                    details?.adm_attend?.id +
                                    '.webp?d=' +
                                    details?.updated_at,
                                )
                          }
                          name={getFullName(
                            details?.gua_attend || details?.adm_attend,
                          )}
                        />
                      }
                    />
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <ModalFull
      title="Detalle de alerta"
      open={open}
      onClose={_onClose}
      buttonText={!details?.date_at && details?.level == 4 ? "Atender" : ""}
      onSave={onSaveAttend}>
      {renderContent()}
    </ModalFull>
  );
};

export default AlertDetail;

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
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sL,
    color: cssVar.cWhite,
    marginBottom: cssVar.spS,
  },
  text: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  alertPanic: {
    borderWidth: 1,
    padding: 8,
    width: 168,
    borderRadius: 8,
    marginTop: 12,
    marginVertical: 12,
  },
  divider: {
    height: 0.5,
    backgroundColor: cssVar.cWhiteV1,
    marginVertical: 12,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: cssVar.spL,
  },
  noAttendantText: {
    opacity: 0.6,
    marginTop: 8,
  },

  informantContainer: {
    marginBottom: cssVar.spM,
  },
  detailsContainer: {
    marginBottom: cssVar.spM,
  },
  pendingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: cssVar.spL,
    minHeight: 80,
  },
  pendingText: {
    color: cssVar.cError,
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
    marginTop: cssVar.spS,
  },
  attendedContainer: {
    marginTop: cssVar.spS,
  },
  alertLevelContainer: {
    marginBottom: cssVar.spS,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
