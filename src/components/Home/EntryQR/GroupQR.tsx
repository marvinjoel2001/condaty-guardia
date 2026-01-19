import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import { getFullName, getUrlImages } from '../../../../mk/utils/strings';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import List from '../../../../mk/components/ui/List/List';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconArrowLeft,
  IconX,
  IconSimpleAdd,
} from '../../../icons/IconLibrary';
import { TextArea } from '../../../../mk/components/forms/TextArea/TextArea';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import { getDateStrMes } from '../../../../mk/utils/dates';
import ExistVisitModal from '../CiNomModal/ExistVisitModal';
import { AccompaniedAdd } from './AccompaniedAdd';
import SectionIncomeType from '../CiNomModal/SectionIncomeType';

type PropsType = {
  setFormState: any;
  formState: any;
  openSelected: any;
  setOpenSelected: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
};
const Br = () => (
  <View
    style={{ height: 0.5, backgroundColor: cssVar.cWhiteV1, marginVertical: 8 }}
  />
);

const colorStatus = {
  C: { color: cssVar.cWhite, background: cssVar.cHoverCompl1 },
  I: { color: cssVar.cBlack, background: cssVar.cAccent },
  O: { color: cssVar.cBlack, background: cssVar.cWarning },
};
const statusText = {
  C: 'Completado',
  I: 'Dejar ingresar',
  O: 'Dejar salir',
};

const OwnerInvitationInfoDisplay = ({
  invitationData,
}: {
  invitationData: any;
}) => {
  if (!invitationData || !invitationData.owner) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Visita a:</Text>
      <ItemList
        title={getFullName(invitationData.owner)}
        subtitle={[
          invitationData?.owner?.dpto?.[0]?.nro &&
            `Unidad: ${invitationData.owner.dpto[0].nro}`,

          invitationData?.owner?.dpto?.[0]?.description?.trim(),
        ]
          .filter(Boolean)
          .join(', ')}
        left={
          <Avatar
            hasImage={invitationData?.owner?.has_image}
            src={getUrlImages(
              '/OWNER-' +
                invitationData?.owner?.id +
                '.webp?d=' +
                invitationData?.owner?.updated_at,
            )}
            name={getFullName(invitationData.owner)}
            w={40}
            h={40}
            style={styles.avatarImage}
          />
        }
      />
      {invitationData?.status == 'X' && (
        <KeyValue keys="Estado" value="Anulado" colorValue={cssVar.cError} />
      )}
      <KeyValue keys="Nombre del evento" value={invitationData.title} />
      <KeyValue
        keys="Cantidad de invitados"
        value={invitationData.guests?.length?.toString() || '0'}
      />
      <KeyValue
        keys="Fecha de invitación"
        value={getDateStrMes(invitationData.created_at)}
      />
    </View>
  );
};

const GroupQR = ({
  setFormState,
  formState,
  handleChange,
  data,
  errors,
  setErrors,
  openSelected,
  setOpenSelected,
}: PropsType) => {
  const [tab, setTab] = useState('P');
  const [selectedVisit, setSelectedVisit]: any = useState(null);
  const [openAcom, setOpenAcom] = useState(false);
  const [editAcom, setEditAcom] = useState(false);
  const [openExistVisit, setOpenExistVisit] = useState(false);
  const [isMain, setIsMain] = useState(false);
  const [formStateA, setFormStateA] = useState({});

  const getStatus = (item: any) => {
    if (item?.access?.out_at) {
      return 'C';
    }
    if (item?.access?.in_at) {
      return 'O';
    }
    return 'I';
  };

  const visitList = (item: any) => {
    return (
      <ItemList
        onPress={() => {
          formState.acompanantes = [];
          setSelectedVisit(item);
          setFormState((prev: any) => ({
            ...prev,
            name: item.visit.name,
            middle_name: item.visit.middle_name,
            last_name: item.visit.last_name,
            mother_last_name: item.visit.mother_last_name,
            ci: item.visit.ci,
            visit_id: item.visit_id,
            access_id: item.access_id,
            obs_in: item.access?.obs_in || '',
            obs_out: item.access?.obs_out || '',
            plate: item.access?.plate || '',
            ci_anverso: item.visit?.url_image_a?.[0] || '',
            ci_reverso: item.visit?.url_image_r?.[0] || '',
          }));
          if (data?.status !== 'X' && !item.access?.out_at) {
            setOpenSelected(item);
            if (item.access?.type) {
              setTab(item.access.type);
            } else {
              setTab('P');
            }
          }
        }}
        title={getFullName(item.visit) || getFullName(item)}
        subtitle={item.visit?.ci ? 'C.I. ' + item.visit?.ci : 'C.I. -/-'}
        right={
          data?.status !== 'X' && (
            <View
              style={{
                backgroundColor: colorStatus[getStatus(item)].background,
                borderRadius: 100,
                padding: 8,
              }}
            >
              <Text
                style={{
                  color: colorStatus[getStatus(item)].color,
                  fontWeight: '500',
                  fontSize: 12,
                }}
              >
                {statusText[getStatus(item)]}
              </Text>
            </View>
          )
        }
        left={<Avatar name={getFullName(item.visit)} style={{}} hasImage={0} />}
      />
    );
  };

  const ingresados = () => {
    let ingreados = 0;
    data?.guests?.map((invitado: any) => invitado?.access && ingreados++);
    return ingreados;
  };

  useEffect(() => {
    if (tab === 'V') {
      setFormState({
        ...formState,
        tab: tab,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        disbledTaxi: false,
        plate: formState?.plate || selectedVisit?.visit?.vehicle?.plate || '',
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      });
    }
    if (tab === 'P' || tab == 'T') {
      setFormState({
        ...formState,
        tab: tab,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      });
    }
  }, [tab]);

  const onDelAcom = (acom: any) => {
    const acomps = formState?.acompanantes;
    const newAcomps = acomps.filter((item: any) => item.ci !== acom.ci);
    setFormState({ ...formState, acompanantes: newAcomps });
  };

  const acompanantesList = (acompanante: any) => {
    if (!acompanante) return null;
    return (
      <ItemList
        title={getFullName(acompanante)}
        subtitle={'C.I. ' + acompanante.ci}
        subtitle2={
          acompanante.obs_in
            ? 'Observaciones de entrada: ' + acompanante.obs_in
            : ''
        }
        left={<Avatar name={getFullName(acompanante)} hasImage={0} />}
        right={
          <Icon
            name={IconX}
            color={cssVar.cError}
            size={20}
            style={{
              padding: 4,
            }}
            onPress={() => onDelAcom(acompanante)}
          />
        }
        onPress={() => {
          setEditAcom(acompanante);
          setOpenAcom(true);
        }}
      />
    );
  };

  useEffect(() => {
    if (!selectedVisit?.visit?.ci && openSelected) {
      setOpenExistVisit(true);
      setIsMain(true);
    }
  }, [selectedVisit?.visit?.ci, openSelected]);
  const getStatusTextPhoto = () => {
    if (!formState?.ci_reverso || !formState?.ci_anverso) {
      return '/ Foto pendiente';
    }
    return '';
  };

  const handleEdit = (bandera: boolean) => {
    setFormStateA(bandera ? formStateA : formState);
    setEditAcom(true);
    setOpenAcom(true);
  };
  return (
    <>
      {!data ? (
        <Loading />
      ) : (
        <View>
          <Card>
            <OwnerInvitationInfoDisplay invitationData={data} />
            <KeyValue keys="Descripción" value={data?.obs || '-/-'} />
            <Br />
            <View style={{ justifyContent: 'center' }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  marginTop: 12,
                }}
                onPress={() => {
                  setOpenSelected(false);
                }}
              >
                {openSelected && (
                  <Icon name={IconArrowLeft} color={cssVar.cWhite} size={20} />
                )}
                <Text
                  style={{
                    color: cssVar.cWhite,
                    fontWeight: '600',
                    fontFamily: FONTS.medium,
                    fontSize: 16,
                  }}
                >
                  {openSelected
                    ? 'Invitados'
                    : 'Cantidad de invitados ingresados: ' +
                      ingresados() +
                      '/' +
                      data?.guests?.length}
                </Text>
              </TouchableOpacity>
            </View>
            {openSelected ? (
              <ItemList
                title={getFullName(formState)}
                subtitle={
                  'C.I. ' +
                  (formState?.ci || '-/-') +
                  ' ' +
                  getStatusTextPhoto()
                }
                left={
                  <Avatar
                    hasImage={0}
                    src={getUrlImages(
                      `/VISIT-${formState?.id}.webp?d=${formState?.updated_at}`,
                    )}
                    name={getFullName(formState)}
                    w={40}
                    h={40}
                  />
                }
                right={
                  <TouchableOpacity onPress={() => handleEdit(false)}>
                    <Text
                      style={{
                        color: cssVar.cAccent,
                        fontSize: 12,
                        fontFamily: FONTS.semiBold,
                      }}
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <ScrollView>
                <List data={data?.guests} renderItem={visitList} />
              </ScrollView>
            )}
          </Card>
          {openSelected && (
            <>
              {!selectedVisit?.access?.in_at && data?.status !== 'X' && (
                <TouchableOpacity
                  style={styles.boxAcompanante}
                  onPress={() => setOpenExistVisit(true)}
                >
                  <Icon name={IconSimpleAdd} size={16} color={cssVar.cAccent} />
                  <Text
                    style={{
                      color: cssVar.cAccent,
                      fontFamily: FONTS.semiBold,
                    }}
                  >
                    Agregar acompañante
                  </Text>
                </TouchableOpacity>
              )}

              {formState?.acompanantes?.length > 0 && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FONTS.semiBold,
                      marginVertical: 10,
                      color: cssVar.cWhite,
                    }}
                  >
                    Acompañantes:
                  </Text>
                  <List
                    data={formState?.acompanantes}
                    renderItem={acompanantesList}
                  />
                </>
              )}
              {!selectedVisit?.access?.in_at && data?.status !== 'X' && (
                <>
                  <SectionIncomeType
                    tab={tab}
                    setTab={setTab}
                    formState={formState}
                    setFormState={setFormState}
                    handleChangeInput={handleChange}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </>
              )}
              <View style={styles.observationsOuterContainer}>
                {data?.status != 'X' &&
                  (!selectedVisit?.access?.in_at ? (
                    <TextArea
                      label="Observaciones de entrada"
                      placeholder="Ej: El visitante está ingresando con 1 mascota y 2 bicicletas."
                      name={'obs_in'}
                      value={formState['obs_in']}
                      onChange={value => handleChange('obs_in', value)}
                    />
                  ) : (
                    <TextArea
                      label="Observaciones de salida"
                      placeholder="Ej: El visitante está saliendo con 3 cajas de embalaje"
                      name="obs_out"
                      value={formState?.obs_out}
                      onChange={value => handleChange('obs_out', value)}
                    />
                  ))}
              </View>
            </>
          )}
        </View>
      )}
      {openAcom && (
        <AccompaniedAdd
          formState={formStateA}
          setFormState={setFormStateA}
          open={openAcom}
          onClose={() => {
            setOpenAcom(false);
            setEditAcom(false);
            setIsMain(false);
          }}
          item={formState}
          setItem={setFormState}
          editItem={editAcom}
          isMain={isMain}
          extraOnClose={() => {
            setOpenSelected(false);
          }}
        />
      )}
      {openExistVisit && (
        <ExistVisitModal
          open={openExistVisit}
          formState={formStateA}
          setFormState={setFormStateA}
          item={formState}
          setItem={setFormState}
          extraOnClose={() => {
            setOpenSelected(false);
          }}
          onClose={() => {
            setOpenExistVisit(false);
          }}
          setOpenNewAcomp={setOpenAcom}
          setIsMain={setIsMain}
          isMain={isMain}
          onDismiss={() => handleEdit(true)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  invitationDetailsContent: {
    flexDirection: 'column',
    gap: 12, // gap-3
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: cssVar.cWhite,
  },
  detailsGroup: {
    flexDirection: 'column',
    gap: 12, // gap-3
    alignSelf: 'stretch',
  },
  boxAcompanante: {
    marginBottom: cssVar.sS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    marginTop: 12,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 12,
    borderColor: '#505050',
    backgroundColor: 'rgba(51, 53, 54, 0.20)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#a7a7a7',
  },
  detailValueRight: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: cssVar.cWhite,
    textAlign: 'right',
  },
  detailValueRightNormal: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhite,
    textAlign: 'right',
  },
  visitToSection: {
    flexDirection: 'column',
  },
  visitToContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    alignSelf: 'stretch',
    height: 40, // h-10
  },
  avatarImage: {
    width: 40, // w-10
    height: 40, // h-10
    // resizeMode: 'cover', // Avatar component handles this
  },
  visitToTextContainer: {
    // width: 202, // w-[202px] - flexGrow is better for responsiveness
    flex: 1,
    flexDirection: 'column',
    gap: 2, // gap-0.5
  },
  ownerNameValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: cssVar.cWhite, // neutral-50
  },
  ownerUnitValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#a7a7a7',
  },
  ownerCiSection: {
    width: '100%', // w-[388px] - use 100% of parent
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    backgroundColor: '#414141',
    padding: 8, // p-2
    borderRadius: 8, // rounded-lg
  },
  ownerCiTextContainer: {
    flexDirection: 'column',
    gap: 2, // gap-0.5
    flexGrow: 1,
  },
  transportButtonBase: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8, // p-2
    paddingHorizontal: 8,
    borderRadius: 8, // rounded-lg
  },
  transportButtonActivePie: {
    backgroundColor: '#00af90',
    borderWidth: 0.5,
    borderColor: '#246950',
  },
  transportButtonActiveGeneral: {
    backgroundColor: cssVar.cAccent, // Or #00af90 if strictly following 'A pie' active style
    borderWidth: 0.5,
    borderColor: cssVar.cAccent, // Or #246950
  },
  transportButtonInactive: {
    backgroundColor: '#333536',
  },
  transportButtonTextActive: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: 'center',
    color: cssVar.cWhite,
  },
  transportButtonTextInactive: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
    color: '#a7a7a7',
  },
  addCompanionLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCompanionLinkText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: cssVar.cAccent,
  },
  observationsOuterContainer: {
    marginTop: 12,
  },
});

export default GroupQR;
