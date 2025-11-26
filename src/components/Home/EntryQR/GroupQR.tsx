import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import List from '../../../../mk/components/ui/List/List';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconArrowLeft, IconX, IconSimpleAdd} from '../../../icons/IconLibrary'; // Assuming IconPlusCircle or similar exists
import Input from '../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import {AccompaniedAdd} from './AccompaniedAdd';
import useApi from '../../../../mk/hooks/useApi';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import {getDateStrMes} from '../../../../mk/utils/dates';
import useAuth from '../../../../mk/hooks/useAuth';
import {AccompaniedAddV2} from './AccompaniedAddV2';

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
    style={{height: 0.5, backgroundColor: cssVar.cWhiteV1, marginVertical: 8}}
  />
);

const colorStatus = {
  C: {color: cssVar.cWhite, background: cssVar.cHoverCompl1},
  I: {color: cssVar.cBlack, background: cssVar.cAccent},
  O: {color: cssVar.cBlack, background: cssVar.cWarning},
};
const statusText = {
  C: 'Completado',
  I: 'Dejar ingresar',
  O: 'Dejar salir',
};

// const formatDateForInvitation = (dateString: string | undefined) => {
//   if (!dateString) return '';
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'Fecha inválida';

//     const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
//     const dayOfWeek = days[date.getUTCDay()];
//     const day = String(date.getUTCDate()).padStart(2, '0');
//     const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//     const year = date.getUTCFullYear();
//     const hours = String(date.getUTCHours()).padStart(2, '0');
//     const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//     return `${dayOfWeek}, ${day}/${month}/${year} - ${hours}:${minutes}`;
//   } catch (e) {
//     return 'Fecha inválida';
//   }
// };

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
        subtitle={
          'Unidad: ' +
          invitationData?.owner?.dpto?.[0]?.nro +
          ', ' +
          (invitationData?.owner?.dpto?.[0]?.description || '')
        }
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
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const [selectedVisit, setSelectedVisit]: any = useState(null);
  const [openAcom, setOpenAcom] = useState(false);
  const [editAcom, setEditAcom] = useState(null);
  const {showToast} = useAuth();
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
              }}>
              <Text
                style={{
                  color: colorStatus[getStatus(item)].color,
                  fontWeight: '500',
                  fontSize: 12,
                }}>
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
      setFormState((prevState: any) => ({
        ...prevState,
        tab: tab,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        disbledTaxi: false,
        plate: prevState?.plate || selectedVisit?.visit?.vehicle?.plate || '',
      }));
    }
    if (tab === 'P' || tab == 'T') {
      setFormState((prevState: any) => ({
        ...prevState,
        tab: tab,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
      }));
    }
  }, [tab, setFormState]);

  const onDelAcom = (acom: any) => {
    const acomps = formState?.acompanantes;
    const newAcomps = acomps.filter((item: any) => item.ci !== acom.ci);
    setFormState({...formState, acompanantes: newAcomps});
  };

  const onExistVisits = async () => {
    if (!formState?.ci || formState.ci.length < 5) {
      setErrors({...errors, ci: ''});
      return;
    }
    if (
      data?.guests?.find(
        (invitado: any) => invitado?.visit?.ci === formState?.ci,
      )
    ) {
      showToast('El ci ya se encuentra en la lista de invitados', 'error');
      setFormState({
        ...formState,
        ci: '',
      });
      return;
    }
    const {data: existData} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci,
    });

    if (existData?.data) {
      setSelectedVisit({...selectedVisit, visit: existData?.data});

      setFormState({
        ...formState,
        name: existData?.data?.name || '',
        middle_name: existData?.data?.middle_name || '',
        last_name: existData?.data?.last_name || '',
        mother_last_name: existData?.data?.mother_last_name || '',
      });
    } else {
      setErrors({...errors, ci: ''});
    }
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

  const onExistTaxi = async () => {
    if (formState?.ci_taxi === '') {
      return;
    }
    if (formState?.ci_taxi == formState?.ci) {
      showToast('El ci del visitante y el taxi son iguales', 'error');
      setFormState({
        ...formState,
        ci_taxi: '',
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
      });
      return;
    }
    if (
      formState?.acompanantes?.find(
        (item: {ci: string}) => item.ci === formState?.ci_taxi,
      )
    ) {
      showToast('El ci del taxi está registrado como acompanante', 'error');
      setFormState({
        ...formState,
        ci_taxi: '',
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
      });
      return;
    }
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
    if (exist?.data) {
      setFormState({
        ...formState,
        ci_taxi: exist?.data.ci,
        name_taxi: exist?.data.name,
        middle_name_taxi: exist?.data.middle_name,
        last_name_taxi: exist?.data.last_name,
        mother_last_name_taxi: exist?.data.mother_last_name,
        plate: exist?.data.plate || formState.plate,
        disbledTaxi: true,
      });
    } else {
      setFormState({
        ...formState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
      });
    }
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
            <View style={{justifyContent: 'center'}}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  marginTop: 12,
                }}
                onPress={() => {
                  setOpenSelected(false);
                }}>
                {openSelected && (
                  <Icon name={IconArrowLeft} color={cssVar.cWhite} size={20} />
                )}
                <Text
                  style={{
                    color: cssVar.cWhite,
                    fontWeight: '600',
                    fontFamily: FONTS.medium,
                    fontSize: 16,
                  }}>
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
                title={getFullName(selectedVisit?.visit)}
                subtitle={
                  selectedVisit?.visit.ci
                    ? 'C.I. ' + selectedVisit?.visit.ci
                    : 'C.I. -/-'
                }
                left={
                  <Avatar
                    name={getFullName(selectedVisit?.visit)}
                    hasImage={0}
                  />
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
              {!selectedVisit?.visit?.ci && (
                <>
                  <Input
                    label={'Carnet de identidad'}
                    name={'ci'}
                    maxLength={10}
                    keyboardType="number-pad"
                    value={formState.ci}
                    required={true}
                    error={errors}
                    onChange={(value: any) => handleChange('ci', value)}
                    onBlur={onExistVisits}
                  />
                  <InputFullName
                    formState={formState}
                    errors={errors}
                    handleChangeInput={handleChange}
                    inputGrid={true}
                  />
                </>
              )}

              <TabsButtons
                tabs={[
                  {value: 'P', text: 'A pie'},
                  {value: 'V', text: 'En vehículo'},
                  {value: 'T', text: 'En taxi'},
                ]}
                sel={tab}
                setSel={setTab}
              />

              {tab == 'V' &&
                !selectedVisit?.access?.in_at &&
                data?.status !== 'X' && (
                  <Input
                    label="Placa"
                    type="text"
                    name="plate"
                    error={errors}
                    required={tab == 'V'}
                    value={formState['plate']}
                    onChange={(value: any) => {
                      handleChange('plate', value);
                    }}
                  />
                )}
              {tab == 'T' &&
                !selectedVisit?.access?.in_at &&
                data?.status !== 'X' && (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginVertical: 8,
                        color: cssVar.cWhite,
                        fontFamily: FONTS.medium,
                      }}>
                      Datos del conductor:
                    </Text>
                    <Input
                      label="Carnet de identidad"
                      type="text"
                      name="ci_taxi"
                      required
                      maxLength={10}
                      keyboardType="number-pad"
                      error={errors}
                      value={formState['ci_taxi']}
                      onBlur={() => onExistTaxi()}
                      onChange={(value: any) => handleChange('ci_taxi', value)}
                    />
                    <InputFullName
                      formState={formState}
                      errors={errors}
                      handleChangeInput={handleChange}
                      disabled={formState?.disbledTaxi}
                      prefijo={'_taxi'}
                      inputGrid={true}
                    />
                    <Input
                      label="Placa"
                      type="text"
                      name="plate"
                      error={errors}
                      required={tab == 'T'}
                      value={formState['plate']}
                      onChange={(value: any) => handleChange('plate', value)}
                    />
                  </>
                )}

              {!selectedVisit?.access?.in_at && data?.status !== 'X' && (
                <TouchableOpacity
                  style={styles.boxAcompanante}
                  onPress={() => setOpenAcom(true)}>
                  <Icon name={IconSimpleAdd} size={16} color={cssVar.cAccent} />
                  <Text
                    style={{
                      color: cssVar.cAccent,
                      fontFamily: FONTS.semiBold,
                    }}>
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
                    }}>
                    Acompañantes:
                  </Text>
                  <List
                    data={formState?.acompanantes}
                    renderItem={acompanantesList}
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
      <AccompaniedAddV2
        open={openAcom}
        onClose={() => {
          setOpenAcom(false);
          setEditAcom(null);
        }}
        item={formState}
        setItem={setFormState}
        editItem={editAcom}
      />
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
    color: cssVar.cWhite, // neutral-50
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
    color: cssVar.cWhite, // neutral-50
    textAlign: 'right',
  },
  detailValueRightNormal: {
    fontFamily: FONTS.regular, // HTML shows font-normal for these values
    fontSize: 14,
    color: cssVar.cWhite, // neutral-50
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
    // For Vehiculo and Taxi when active (using accent color)
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
    color: cssVar.cWhite, // neutral-50
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
