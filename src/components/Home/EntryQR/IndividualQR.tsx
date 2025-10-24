import React, {useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
import Br from '../../Profile/Br';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import useAuth from '../../../../mk/hooks/useAuth';

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
  const [editAcom, setEditAcom] = useState(null);
  const {showToast} = useAuth();
  const [visit, setVisit] = useState(data?.visit || {});
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
      setVisit(existData?.data || {});
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
        plate: prevState?.plate || visit?.vehicle?.plate || '',
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

  const onDelAcom = (acom: {ci: string}) => {
    const acomps = formState?.acompanantes || [];
    const newAcomps = acomps.filter(
      (item: {ci: string}) => item.ci !== acom.ci,
    );
    setFormState({...formState, acompanantes: newAcomps});
  };

  const acompanantesList = (acompanante: any) => {
    if (!acompanante) return null;
    return (
      <ItemList
        title={getFullName(acompanante)}
        subtitle={'C.I. ' + (acompanante.ci || 'N/A')}
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
    const {data: existData} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
    if (existData?.data) {
      setFormState((prevState: any) => ({
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
      <View>
        <Card style={{marginVertical: 0}}>
          <Text style={styles.residentTitle}>Visita a</Text>
          <ItemList
            title={getFullName(owner)}
            subtitle={'Unidad: ' + getUnitInfo(owner)}
            left={
              <Avatar
                hasImage={owner?.has_image}
                src={getUrlImages(
                  `/OWNER-${owner?.id}.webp?d=${owner?.updated_at}`,
                )}
                name={getFullName(owner)}
                w={40}
                h={40}
              />
            }
          />
          <Br />
          <Text style={styles.sectionTitle}>Visitante</Text>
          <ItemList
            title={getFullName(visit)}
            subtitle={'C.I. ' + (visit?.ci || '-/-')}
            left={
              <Avatar
                hasImage={0}
                src={getUrlImages(
                  `/VISIT-${visit?.id}.webp?d=${visit?.updated_at}`,
                )}
                name={getFullName(visit)}
                w={40}
                h={40}
              />
            }
          />
          <KeyValue
            style={{marginTop: cssVar.spM}}
            keys="Descripción "
            value={data?.obs || '-/-'}
          />
        </Card>
        {!visit?.ci && data?.status !== 'X' && (
          <View style={{...styles.formSection, marginTop: cssVar.spM}}>
            <Input
              label="Carnet del visitante"
              name="ci"
              maxLength={10}
              keyboardType="numeric"
              value={formState?.ci || ''}
              error={errors}
              required
              onChange={(value: string) => handleChange('ci', value)}
              onBlur={onExistVisits}
            />
            <InputFullName
              formState={formState}
              errors={errors}
              handleChangeInput={handleChange}
              inputGrid={true}
            />
          </View>
        )}

        {!access?.[0]?.in_at && data?.status !== 'X' && (
          <TabsButtons
            style={{marginVertical: 0}}
            tabs={[
              {value: 'P', text: 'A pie'},
              {value: 'V', text: 'En vehículo'},
              {value: 'T', text: 'En taxi'},
            ]}
            sel={tab}
            setSel={setTab}
          />
        )}

        {/* CONDICIÓN RESTAURADA A LA DE LA "VERSIÓN ANTIGUA QUE SÍ FUNCIONABA" */}
        {access?.length === 0 && data?.status !== 'X' && (
          <View style={styles.formSection}>
            {tab === 'V' && (
              <Input
                label="Placa del vehículo"
                type="text"
                name="plate"
                error={errors}
                required={tab === 'V'}
                value={formState?.plate || ''}
                onChange={(value: string) =>
                  handleChange('plate', value.toUpperCase())
                }
                autoCapitalize="characters"
              />
            )}
            {tab === 'T' && (
              <>
                <Text style={styles.subSectionTitle}>Datos del conductor</Text>
                <Input
                  label="Carnet de identidad"
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
                  name="plate"
                  error={errors}
                  required={tab === 'T'}
                  value={formState?.plate || ''}
                  onChange={(value: string) =>
                    handleChange('plate', value.toUpperCase())
                  }
                  autoCapitalize="characters"
                />
              </>
            )}

            <TouchableOpacity
              style={{
                alignSelf: 'flex-start',
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => setOpenAcom(true)}>
              <Icon name={IconSimpleAdd} color={cssVar.cAccent} size={13} />
              <Text
                style={{
                  color: cssVar.cAccent,
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
                    color: cssVar.cWhite,
                  }}>
                  Acompañantes:
                </Text>
                <List
                  style={{marginBottom: 12}}
                  data={formState?.acompanantes}
                  renderItem={acompanantesList}
                />
              </>
            )}
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
      </View>

      <AccompaniedAdd
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

export default IndividualQR;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },

  residentTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FAFAFA',
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: cssVar.cWhite,
  },
  tabsContainer: {
    marginVertical: 0,
  },
  formSection: {
    flexDirection: 'column',
    marginTop: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhite,
    marginBottom: 12,
  },
});
