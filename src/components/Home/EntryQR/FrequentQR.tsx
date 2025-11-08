import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Input from '../../../../mk/components/forms/Input/Input';
import useApi from '../../../../mk/hooks/useApi';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import {AccompaniedAdd} from './AccompaniedAdd';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconSimpleAdd, IconX} from '../../../icons/IconLibrary';
import List from '../../../../mk/components/ui/List/List';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import Br from '../../Profile/Br';
import useAuth from '../../../../mk/hooks/useAuth';

type PropsType = {
  setFormState: any;
  formState: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
};

const FrequentQR = ({
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
  const meesageforUndefined = 'Indefinido';
  const {showToast} = useAuth();

  const invitation = data;
  const [visit, setVisit] = useState(invitation?.visit || {});
  const owner = invitation?.owner;
  const access = invitation?.access;

  const lastAccess =
    access && access.length > 0 ? access[access.length - 1] : null;
  const isCurrentlyInside =
    lastAccess && lastAccess.in_at && !lastAccess.out_at;

  useEffect(() => {
    const currentVisit = data?.visit;
    if (data) {
      setFormState((prevState: any) => ({
        ...prevState,
        ci: currentVisit?.ci || '',
        name: currentVisit?.name || '',
        middle_name: currentVisit?.middle_name || '',
        last_name: currentVisit?.last_name || '',
        mother_last_name: currentVisit?.mother_last_name || '',
        visit_id: currentVisit?.id || null,
        access_id: isCurrentlyInside ? lastAccess?.id : null,
        obs_in: isCurrentlyInside ? lastAccess?.obs_in : '',
        obs_out: '',
      }));
    }
  }, [data, setFormState, isCurrentlyInside, lastAccess]);

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
        left={
          <Avatar
            name={getFullName(acompanante)}
            hasImage={acompanante?.has_image}
          />
        }
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

  const getUnitInfo = (ownerData: any) => {
    if (ownerData?.dpto && ownerData.dpto.length > 0) {
      const dpto = ownerData.dpto[0];
      return dpto.nro
        ? `${dpto.nro}${dpto.description ? `, ${dpto.description}` : ''}`
        : 'No especificada';
    }
    return 'No especificada';
  };

  const formatSimpleDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatWeekdays = (weekdayValue: number | null | undefined) => {
    if (typeof weekdayValue !== 'number' || isNaN(weekdayValue)) {
      return '';
    }

    const daysMap = [
      {value: 1, label: 'Lun'},
      {value: 2, label: 'Mar'},
      {value: 4, label: 'Mié'},
      {value: 8, label: 'Jue'},
      {value: 16, label: 'Vie'},
      {value: 32, label: 'Sáb'},
      {value: 64, label: 'Dom'},
    ];

    const selectedDays = daysMap
      .filter(day => (weekdayValue & day.value) === day.value)
      .map(day => day.label);

    return selectedDays.join(', ');
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <Card>
        <Text style={styles.summaryTitle}>Visita a</Text>
        <ItemList
          style={{marginBottom: 12}}
          title={getFullName(owner)}
          subtitle={'Unidad: ' + getUnitInfo(owner)}
          left={
            <Avatar
              hasImage={owner?.has_image}
              src={getUrlImages(
                '/OWNER-' + owner?.id + '.webp?d=' + owner?.updated_at,
              )}
              name={getFullName(owner)}
            />
          }
        />

        <KeyValue
          keys="Tipo de invitación"
          value={invitation.type === 'F' ? 'QR frecuente' : 'Otro'}
        />
        {invitation.start_date && (
          <KeyValue
            keys="Validez del QR"
            value={
              invitation.start_date && invitation.end_date
                ? `${formatSimpleDate(
                    invitation.start_date,
                  )} - ${formatSimpleDate(invitation.end_date)}`
                : meesageforUndefined
            }
          />
        )}
        {invitation.weekday && (
          <KeyValue
            keys="Días de acceso"
            value={formatWeekdays(invitation.weekday)}
          />
        )}
        {invitation.start_time && (
          <KeyValue
            keys="Horario permitido"
            value={
              invitation.start_time && invitation.end_time
                ? `${invitation.start_time.substring(
                    0,
                    5,
                  )} - ${invitation.end_time.substring(0, 5)}`
                : null
            }
          />
        )}
        {invitation.max_entries && (
          <KeyValue keys="Cantidad de accesos" value={invitation.max_entries} />
        )}
        <KeyValue keys="Descripción" value={data?.obs || '-/-'} />
        <Br />
        <Text style={styles.summaryTitle}>Invitado</Text>
        <ItemList
          style={{marginTop: 12}}
          title={getFullName(visit)}
          subtitle={'C.I. ' + (visit.ci || '-/-')}
          left={
            <Avatar
              hasImage={0}
              src={getUrlImages(
                `/VISIT-${visit?.id}.png?d=${visit?.updated_at}`,
              )}
              name={getFullName(visit)}
            />
          }
        />
      </Card>

      {!visit?.ci && data?.status !== 'X' && (
        <>
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
        </>
      )}

      {!isCurrentlyInside && data?.status !== 'X' && (
        <TabsButtons
          tabs={[
            {value: 'P', text: 'A pie'},
            {value: 'V', text: 'En vehículo'},
            {value: 'T', text: 'En taxi'},
          ]}
          sel={tab}
          setSel={setTab}
        />
      )}

      {!isCurrentlyInside && data?.status !== 'X' && (
        <>
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
            <View style={styles.taxiFormContainer}>
              <Text style={{...styles.summaryTitle, marginBottom: 12}}>
                Datos del conductor
              </Text>
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
            </View>
          )}

          <TouchableOpacity
            style={styles.addCompanionButton}
            onPress={() => setOpenAcom(true)}>
            <Icon name={IconSimpleAdd} color={cssVar.cAccent} size={13} />
            <Text style={styles.addCompanionText}>Agregar acompañante</Text>
          </TouchableOpacity>

          {(formState?.acompanantes?.length || 0) > 0 && (
            <View style={styles.taxiFormContainer}>
              <Text style={styles.summaryTitle}>Acompañantes:</Text>
              <List
                data={formState?.acompanantes}
                renderItem={acompanantesList}
              />
            </View>
          )}
        </>
      )}

      {data?.status !== 'X' && (
        <View style={styles.textAreaContainer}>
          {!isCurrentlyInside ? (
            <TextArea
              label="Observaciones de entrada"
              placeholder="Ej: El visitante está ingresando con 1 mascota."
              name="obs_in"
              value={formState?.obs_in || ''}
              onChange={(value: string) => handleChange('obs_in', value)}
            />
          ) : (
            <TextArea
              label="Observaciones de salida"
              placeholder="Ej: El visitante está saliendo con 3 cajas"
              name="obs_out"
              value={formState?.obs_out || ''}
              onChange={(value: string) => handleChange('obs_out', value)}
            />
          )}
        </View>
      )}

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

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },

  summaryCard: {
    backgroundColor: cssVar.cBlackV2,
    padding: 12,
    borderRadius: 12,
    gap: 16,
  },
  summarySection: {
    // gap: 12,
  },
  summaryTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: cssVar.cWhite,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhiteV1,
  },
  detailValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: cssVar.cWhite,
    textAlign: 'right',
  },
  textAreaContainer: {
    marginTop: 12,
  },
  taxiFormContainer: {},
  addCompanionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addCompanionText: {
    color: cssVar.cAccent,
    textDecorationLine: 'underline',
    marginLeft: 4,
    fontSize: 12,
  },
});

export default FrequentQR;
