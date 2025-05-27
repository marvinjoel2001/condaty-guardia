import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
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
import {IconAdd, IconX} from '../../../icons/IconLibrary';
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
    if (data) {
      setFormState((prevState: any) => ({
        ...prevState,
        ci: visit?.ci || prevState?.ci || '',
        name: visit?.name || prevState?.name || '',
        middle_name: visit?.middle_name || prevState?.middle_name || '',
        last_name: visit?.last_name || prevState?.last_name || '',
        mother_last_name:
          visit?.mother_last_name || prevState?.mother_last_name || '',
        access_id: access?.[0]?.id || prevState?.access_id || null,
      }));
    }
  }, [data, visit, access, setFormState]);

  const onExistVisits = async () => {
    if (!formState?.ci || formState.ci.length < 5) {
      setErrors({...errors, ci: ''});
      return;
    }
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci,
    });
    if (exist?.data) {
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
      plate: tab === 'V' ? prevState?.plate || '' : '',
      plate_taxi: tab === 'T' ? prevState?.plate_taxi || '' : '',
      disbledTaxi: false,
    }));
  }, [tab, setFormState]);

  const onDelAcom = (acom: {ci: string}) => {
    const acomps = formState?.acompanantes || [];
    const newAcomps = acomps.filter((item: {ci: string}) => item.ci !== acom.ci);
    setFormState({...formState, acompanantes: newAcomps});
  };

  const acompanantesList = ({item}: {item: any}) => {
    return (
      <TouchableOpacity>
        <ItemList
          title={getFullName(item)}
          subtitle={'C.I. ' + item.ci}
          subtitle2={item.obs_in ? 'Observaciones: ' + item.obs_in : ''}
          left={<Avatar name={getFullName(item)} />}
          right={
            <Icon name={IconX} color={cssVar.cWhiteV2} onPress={() => onDelAcom(item)} />
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
        disbledTaxi: false,
      }));
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
      setFormState((prevState: any) =>({
        ...prevState,
        ci_taxi: exist.data.ci,
        name_taxi: exist.data.name,
        middle_name_taxi: exist.data.middle_name,
        last_name_taxi: exist.data.last_name,
        mother_last_name_taxi: exist.data.mother_last_name,
        plate_taxi: prevState.plate_taxi || exist.data.plate || '',
        disbledTaxi: true,
      }));
    } else {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
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

        {access?.length === 0 && data?.status !== 'X' && (
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
                <Text style={styles.subSectionTitle}>
                  Datos del conductor del taxi:
                </Text>
                <Input
                  label="Carnet de identidad (Taxista)"
                  name="ci_taxi"
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
          </View>
        )}

        {!access?.[0]?.in_at && data?.status !== 'X' && (
          <View style={styles.acompanantesSection}>
            <TouchableOpacity
              style={styles.addAcompananteButton}
              onPress={() => setOpenAcom(true)}>
              <Icon name={IconAdd} size={16} color={cssVar.cSuccess} />
              <Text style={styles.addAcompananteText}>
                Agregar acompañante
              </Text>
            </TouchableOpacity>

            {(formState?.acompanantes?.length || 0) > 0 && (
              <>
                <Text style={styles.subSectionTitle}>Acompañantes:</Text>
                <List
                  data={formState.acompanantes}
                  renderItem={acompanantesList}
                  keyExtractor={(item: any) => item.ci || `acom-${item.id}`}
                />
              </>
            )}
          </View>
        )}
      </View>

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
  mainContainer: {
    paddingTop: 16,
    flexDirection: 'column',
    gap: 16,
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
    color: cssVar.cWhiteV1,
  },
  residentUnit: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhiteV1,
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
    color: cssVar.cWhiteV1,
  },
  visitorDetail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhiteV1,
  },
  tabsContainer: {},
  formSection: {
    flexDirection: 'column',
  },
  ciInputWrapper: {
    height: 48,
    backgroundColor: '#414141',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12, 
  },
  inputFieldStyle: { 
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingHorizontal: 0, 
    paddingVertical: 0,
    height: '100%',
    justifyContent: 'center',
  },
  textInFieldStyle: {
    fontSize: 14,
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
  },
  labelInFieldStyle: {
    fontSize: 12,
    color: cssVar.cWhiteV2,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhiteV1,
  },
  acompanantesSection: {
    flexDirection: 'column',
    gap: 8,
  },
  addAcompananteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  addAcompananteText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textDecorationLine: 'underline',
    color: cssVar.cSuccess || '#00E38C',
  },
});