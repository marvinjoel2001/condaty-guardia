import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, ScrollView} from 'react-native'; // Agregado ScrollView
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
import {IconAdd, IconSimpleAdd, IconX} from '../../../icons/IconLibrary';
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
    const currentVisit = data?.visit; // Usar variables locales para claridad
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
        plate: currentAccess?.[0]?.plate || prevState?.plate || '',
        // No reinicializar acompanantes aquí para que se mantengan los agregados
        // acompanantes: prevState?.acompanantes || [], // Esto se maneja al inicializar formState
      }));
    }
  }, [data, setFormState]); // Dependencias simplificadas

  const onExistVisits = async () => {
    if (!formState?.ci || formState.ci.length < 5) {
      setErrors({...errors, ci: ''});
      return;
    }
    const {data: existData} = await execute('/visits', 'GET', { // Renombrada la variable de respuesta
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
      plate: tab === 'V' ? prevState?.plate || '' : (tab === 'P' ? '' : prevState?.plate),
      plate_taxi: tab === 'T' ? prevState?.plate_taxi || '' : '',
      disbledTaxi: false,
    }));
  }, [tab, setFormState]);

  const onDelAcom = (acom: {ci: string}) => {
    const acomps = formState?.acompanantes || [];
    const newAcomps = acomps.filter((item: {ci: string}) => item.ci !== acom.ci);
    setFormState({...formState, acompanantes: newAcomps});
  };

  // ESTA ES LA FUNCIÓN acompanantesList DE LA "VERSIÓN ANTIGUA QUE SÍ FUNCIONABA"
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
        plate_taxi: '',
        disbledTaxi: false,
      }));
      return;
    }
    const {data: existData} = await execute('/visits', 'GET', { // Renombrada la variable de respuesta
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
        plate_taxi: existData.data.plate || '',
        disbledTaxi: true,
      }));
    } else {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate_taxi: '',
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
          {/* ESTA ES LA PARTE DE VISUALIZACIÓN DE PROPIETARIO/INVITADO DEL CÓDIGO MÁS RECIENTE (SIN ItemInfo) */}
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
          {/* FIN DE LA PARTE DE VISUALIZACIÓN DE PROPIETARIO/INVITADO */}

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
                  error={errors?.ci}
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
          
          {/* SECCIÓN DE VEHÍCULO/TAXI Y ACOMPAÑANTES */}
          {/* La condición original era access?.length === 0, aquí se usa la misma que para tabs y observaciones */}
          {!access?.[0]?.in_at && data?.status !== 'X' && (
            <View style={styles.formSection}>
              {tab === 'V' && (
                <Input
                  label="Placa del vehículo"
                  type="text"
                  name="plate"
                  error={errors?.plate}
                  required={tab === 'V'}
                  value={formState?.plate || ''}
                  onChange={(value: string) => handleChange('plate', value.toUpperCase())}
                  autoCapitalize="characters"
                />
              )}
              {tab === 'T' && (
                <>
                  {/* El styles.subSectionTitle es del código más reciente, si prefieres el estilo antiguo para "Datos del conductor" debes indicarlo */}
                  <Text style={styles.subSectionTitle}> 
                    Datos del conductor del taxi:
                  </Text>
                  <Input
                    label="Carnet de identidad (Taxista)"
                    name="ci_taxi"
                    keyboardType="numeric"
                    maxLength={10}
                    error={errors?.ci_taxi}
                    required
                    value={formState?.ci_taxi || ''}
                    onBlur={onExistTaxi}
                    onChange={(value: string) => handleChange('ci_taxi', value)}
                    style={{marginBottom: 16}}
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
                    name="plate_taxi"
                    error={errors?.plate_taxi}
                    required={tab === 'T'}
                    value={formState?.plate_taxi || ''}
                    onChange={(value: string) => handleChange('plate_taxi', value.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </>
              )}
              
              {/* ESTA ES LA SECCIÓN DE ACOMPAÑANTES COMO EN LA "VERSIÓN ANTIGUA QUE SÍ FUNCIONABA" */}
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-start',
                  marginVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setOpenAcom(true)}>
                <Icon name={IconSimpleAdd} color="#4CAF50" size={13} />
                <Text
                  style={{
                    color: '#4CAF50',
                    textDecorationLine: 'underline',
                    marginLeft: 4,
                  }}>
                  Agregar acompañante
                </Text>
              </TouchableOpacity>
            
              {(formState?.acompanantes?.length || 0) > 0 && (
                <>
                  <Text
                    style={{ // Estilo de la versión antigua para el título "Acompañantes:"
                      fontSize: 16,
                      fontFamily: FONTS.semiBold,
                      marginVertical: 4,
                      color: cssVar.cWhiteV1,
                    }}>
                    Acompañantes:
                  </Text>
                  <List
                    data={formState?.acompanantes} // Usar optional chaining como en la versión antigua
                    renderItem={acompanantesList}
                    // Sin keyExtractor explícito, como en la versión antigua
                  />
                </>
              )}
              {/* FIN DE LA SECCIÓN DE ACOMPAÑANTES */}
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
  scrollViewContainer: { // Añadido para el ScrollView
    flex: 1,
  },
  mainContainer: {
    
    paddingTop: 16,
    paddingBottom: 32, // Añadido padding inferior
    flexDirection: 'column',
    gap: 20, // Gap general entre secciones principales
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
    // Puedes agregar estilos si es necesario, o quitar el View si no aporta
  },
  formSection: { // Estilo para agrupar formularios y el área de acompañantes
    flexDirection: 'column',
    
  },
  subSectionTitle: { // Estilo usado en la "nueva" versión para "Datos del conductor" y "Acompañantes"
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhiteV1 || '#D0D0D0',
    // marginBottom: 8, // Eliminado para usar el gap del formSection
  },
  // Los estilos para el botón de agregar acompañante no son necesarios si usamos los inline de la versión antigua
  // acompanantesSection, addAcompananteButton, addAcompananteText pueden eliminarse si no se usan.
});