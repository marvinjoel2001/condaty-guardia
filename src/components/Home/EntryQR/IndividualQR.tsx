import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, ScrollView} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Input from '../../../../mk/components/forms/Input/Input';
import useApi from '../../../../mk/hooks/useApi';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import {AccompaniedAdd} from './AccompaniedAdd';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconAdd, IconSimpleAdd, IconX} from '../../../icons/IconLibrary'; // IconAdd es usado en la nueva version del boton
import List from '../../../../mk/components/ui/List/List';
import Loading from '../../../../mk/components/ui/Loading/Loading';

type PropsType = {
  setFormState: any;
  formState: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
};

const IndividualQR = ({
  setFormState,
  formState,
  errors,
  setErrors,
  data,
  handleChange,
}: PropsType) => {
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const [openAcom, setOpenAcom] = useState(false);

  const visit = data?.visit;
  const owner = data?.owner;
  const access = data?.access;

  useEffect(() => {
    const currentVisit = data?.visit;
    const currentAccess = data?.access;
    if (data) {
      setFormState((prevState: any) => ({
        ...prevState,
        ci: currentVisit?.ci || prevState?.ci || '',
        name: currentVisit?.name || prevState?.name || '',
        middle_name: currentVisit?.middle_name || prevState?.middle_name || '',
        last_name: currentVisit?.last_name || prevState?.last_name || '',
        mother_last_name:
          currentVisit?.mother_last_name || prevState?.mother_last_name || '',
        access_id: currentAccess?.[0]?.id || prevState?.access_id || null,
        obs_in: currentAccess?.[0]?.obs_in || prevState?.obs_in || '',
        obs_out: currentAccess?.[0]?.obs_out || prevState?.obs_out || '',
        // plate es manejado por el efecto de 'tab' y onExistTaxi
      }));
    }
  }, [data, setFormState]);

  const onExistVisits = async () => {
    if (!formState?.ci || formState.ci.length < 5) {
      setErrors({...errors, ci: ''});
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
      setErrors({
        ...errors,
        ci: 'Ya existe un registro de entrada para este CI',
      });
    } else {
      setErrors({...errors, ci: ''});
    }
  };

  useEffect(() => {
    setFormState((prevState: any) => ({
      ...prevState,
      tab: tab,
      ci_taxi: '',
      name_taxi: '',
      middle_name_taxi: '',
      last_name_taxi: '',
      mother_last_name_taxi: '',
      plate: tab === 'V' ? prevState?.plate || '' : '', // Limpiar 'plate' si no es Vehículo (Taxi lo llenará con onExistTaxi)
      // plate_taxi: '', // No necesitamos plate_taxi si usamos 'plate' para el taxi
      disbledTaxi: false,
    }));
  }, [tab, setFormState]);

  const onDelAcom = (acom: {ci: string}) => {
    const acomps = formState?.acompanantes || [];
    const newAcomps = acomps.filter((item: {ci: string}) => item.ci !== acom.ci);
    setFormState({...formState, acompanantes: newAcomps});
  };

  const acompanantesList = (acompanante: any) => {
    if (!acompanante) return null;
    return (
      <TouchableOpacity>
        <ItemList
          title={getFullName(acompanante)}
          subtitle={'C.I. ' + (acompanante.ci || 'N/A')}
          subtitle2={
            acompanante.obs_in
              ? 'Observaciones de entrada: ' + acompanante.obs_in
              : ''
          }
          left={<Avatar name={getFullName(acompanante)} />}
          right={
            <Icon
              name={IconX}
              color={cssVar.cWhiteV2}
              onPress={() => onDelAcom(acompanante)}
            />
          }
        />
      </TouchableOpacity>
    );
  };

  const onExistTaxi = async () => {
    if (!formState?.ci_taxi || formState.ci_taxi.length < 5) {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: prevState.tab === 'T' ? '' : prevState.plate, 
        disbledTaxi: false,
      }));
      return;
    }
    const {data: existData} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
    if (existData?.data) {
      setFormState((prevState: any) =>({
        ...prevState,
        ci_taxi: existData.data.ci,
        name_taxi: existData.data.name,
        middle_name_taxi: existData.data.middle_name,
        last_name_taxi: existData.data.last_name,
        mother_last_name_taxi: existData.data.mother_last_name,
        plate: existData.data.plate || '', 
        disbledTaxi: true,
      }));
    } else {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: prevState.tab === 'T' ? '' : prevState.plate, 
        disbledTaxi: false,
      }));
    }
  };

  const getUnitInfo = (ownerData: any) => {
    if (ownerData?.dpto && ownerData.dpto.length > 0) {
      const dpto = ownerData.dpto[0];
      return dpto.nro || 'No especificada';
    }
    return 'No especificada';
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.mainContainer}>
          <View style={styles.residentCard}>
            <Text style={styles.residentTitle}>Visita a:</Text>
            <View style={styles.residentInfoRow}>
              <Avatar
                src={owner?.url_avatar ? getUrlImages(owner.url_avatar) : undefined}
                name={getFullName(owner)}
                w={40}
                h={40}
              />
              <View style={styles.residentTextContainer}>
                <Text style={styles.residentName}>{getFullName(owner)}</Text>
                <Text style={styles.residentUnit}>
                  Unidad: {getUnitInfo(owner)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Invitado:</Text>
          <View style={styles.visitorCard}>
            <Avatar
              src={visit?.url_avatar ? getUrlImages(visit.url_avatar) : undefined}
              name={getFullName(visit)}
              w={40}
              h={40}
            />
            <View style={styles.visitorTextContainer}>
              <Text style={styles.visitorName}>{getFullName(visit)}</Text>
              <Text style={styles.visitorDetail}>
                C.I. {visit?.ci || 'Sin registrar'}
              </Text>
            </View>
          </View>

          {!visit?.ci && data?.status !== 'X' && (
            <View style={styles.formSection}>
              <InputFullName
                formState={formState}
                errors={errors}
                handleChangeInput={handleChange}
                inputGrid={true}
              />
              <Input
                  label="Carnet del visitante*"
                  name="ci"
                  maxLength={10}
                  keyboardType="numeric"
                  value={formState?.ci || ''}
                  error={errors}
                  required
                  onChange={(value: string) => handleChange('ci', value)}
                  onBlur={onExistVisits}
              />
            </View>
          )}

          {data?.status !== 'X' && (
            <View style={styles.formSection}>
              {!access?.[0]?.in_at ? (
                <TextArea
                  label="Observaciones de entrada"
                  placeholder="Ej: El visitante está ingresando con 1 mascota y 2 bicicletas."
                  name="obs_in"
                  value={formState?.obs_in || ''}
                  onChange={(value: string) => handleChange('obs_in', value)}
                />
              ) : (
                <TextArea
                  label="Observaciones de salida"
                  placeholder="Ej: El visitante está saliendo con 3 cajas de embalaje"
                  name="obs_out"
                  value={formState?.obs_out || ''}
                  onChange={(value: string) => handleChange('obs_out', value)}
                />
              )}
            </View>
          )}

          {!access?.[0]?.in_at && data?.status !== 'X' && (
            <View style={styles.tabsContainer}>
              <TabsButtons
                tabs={[
                  {value: 'P', text: 'A pie'},
                  {value: 'V', text: 'En vehículo'},
                  {value: 'T', text: 'En taxi'},
                ]}
                sel={tab}
                setSel={setTab}
              />
            </View>
          )}
          
          {/* CONDICIÓN RESTAURADA A LA DE LA "VERSIÓN ANTIGUA QUE SÍ FUNCIONABA" */}
          {access?.length === 0 && data?.status !== 'X' && (
            <View style={styles.formSection}>
              {tab === 'V' && (
                <Input
                  label="Placa del vehículo"
                  type="text"
                  name="plate" // Vehículo usa 'plate'
                  error={errors}
                  required={tab === 'V'}
                  value={formState?.plate || ''}
                  onChange={(value: string) => handleChange('plate', value.toUpperCase())}
                  autoCapitalize="characters"
                />
              )}
              {tab === 'T' && (
                <>
                  <Text style={styles.subSectionTitle}> 
                    Datos del conductor del taxi:
                  </Text>
                  <Input
                    label="Carnet de identidad (Taxista)"
                    name="ci_taxi"
                    keyboardType="numeric"
                    maxLength={10}
                    error={errors}
                    required
                    value={formState?.ci_taxi || ''}
                    onBlur={onExistTaxi}
                    onChange={(value: string) => handleChange('ci_taxi', value)}
                    
                  />
                  <InputFullName
                    formState={formState}
                    errors={errors}
                    disabled={formState?.disbledTaxi}
                    prefijo="_taxi"
                    handleChangeInput={handleChange}
                    inputGrid={true}
                  />
                  <Input
                    label="Placa del taxi"
                    type="text"
                    name="plate" // Taxi usa 'plate' como en la versión antigua
                    error={errors} // Error para 'plate'
                    required={tab === 'T'}
                    value={formState?.plate || ''} // Valor de 'plate'
                    onChange={(value: string) => handleChange('plate', value.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </>
              )}
              
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-start',
                  marginVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setOpenAcom(true)}>
                <Icon name={IconSimpleAdd} color={cssVar.cSuccess} size={13} />
                <Text
                  style={{
                    color: cssVar.cSuccess,
                    textDecorationLine: 'underline',
                    marginLeft: 4,
                  }}>
                  Agregar acompañante
                </Text>
              </TouchableOpacity>
            
              {(formState?.acompanantes?.length || 0) > 0 && (
                <>
                  <Text
                    style={{ 
                      fontSize: 16,
                      fontFamily: FONTS.semiBold,
                      marginVertical: 4,
                      color: cssVar.cWhiteV1, // Coincidir con subSectionTitle o definir un color específico
                    }}>
                    Acompañantes:
                  </Text>
                  <List
                    data={formState?.acompanantes} 
                    renderItem={acompanantesList}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <AccompaniedAdd
        open={openAcom}
        onClose={() => setOpenAcom(false)}
        item={formState}
        setItem={setFormState}
      />
    </>
  );
};

export default IndividualQR;

const styles = StyleSheet.create({
  scrollViewContainer: { 
    flex: 1,
  },
  mainContainer: {
    paddingTop: 16,
    paddingBottom: 32, 
    flexDirection: 'column',
    gap: 20, 
  },
  residentCard: {
    backgroundColor: '#333536',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'column',
    gap: 8,
  },
  residentTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FAFAFA',
  },
  residentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
  },
  residentTextContainer: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  residentName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: cssVar.cWhiteV1 || '#D0D0D0',
  },
  residentUnit: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhiteV1 || '#D0D0D0',
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: cssVar.cWhite,
  },
  visitorCard: {
    backgroundColor: '#414141',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitorTextContainer: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  visitorName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: cssVar.cWhiteV1 || '#D0D0D0',
  },
  visitorDetail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhiteV1 || '#D0D0D0',
  },
  tabsContainer: {
  },
  formSection: { 
    flexDirection: 'column',
    
  },
  subSectionTitle: { 
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhiteV1 || '#D0D0D0',
  },
});