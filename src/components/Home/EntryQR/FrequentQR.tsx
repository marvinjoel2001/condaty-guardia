import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, ScrollView} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
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

type PropsType = {
  setFormState: any;
  formState: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
};

const DetailRow = ({label, value}: {label: string; value: string | number | null | undefined}) => {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
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
  const meesageforUndefined = "Indefinido";
  
  const invitation = data;
  const visit = invitation?.visit;
  const owner = invitation?.owner;
  const access = invitation?.access;

  const lastAccess = access && access.length > 0 ? access[access.length - 1] : null;
  const isCurrentlyInside = lastAccess && lastAccess.in_at && !lastAccess.out_at;

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
      disbledTaxi: false,
    }));
  }, [tab, setFormState]);

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

  const getUnitInfo = (ownerData: any) => {
    if (ownerData?.dpto && ownerData.dpto.length > 0) {
      const dpto = ownerData.dpto[0];
      return dpto.nro ? `${dpto.nro}${dpto.description ? `, ${dpto.description}` : ''}` : 'No especificada';
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
      { value: 1, label: 'Lun' },
      { value: 2, label: 'Mar' },
      { value: 4, label: 'Mié' },
      { value: 8, label: 'Jue' },
      { value: 16, label: 'Vie' },
      { value: 32, label: 'Sáb' },
      { value: 64, label: 'Dom' }
    ];
  
    const selectedDays = daysMap
      .filter(day => (weekdayValue & day.value) === day.value)
      .map(day => day.label);
  
    return selectedDays.join(', ');
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.summaryCard}>
            <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Visita a</Text>
                <View style={styles.personCard}>
               
                    <Avatar src={getUrlImages('/OWNER-' + owner?.id + '.webp?d=' + owner?.updated_at)} name={getFullName(owner)} w={40} h={40} />
                    <View style={styles.personInfo}>
                        <Text style={styles.personName}>{getFullName(owner)}</Text>
                        <Text style={styles.personDetail}>Unidad: {getUnitInfo(owner)}</Text>
                    </View>
                </View>
                <DetailRow label="Tipo de invitación" value={invitation.type === 'F' ? 'QR frecuente' : 'Otro'} />
                <DetailRow label="Validez del QR" value={invitation.start_date && invitation.end_date ? `${formatSimpleDate(invitation.start_date)} - ${formatSimpleDate(invitation.end_date)}` : meesageforUndefined} />
                <DetailRow label="Días de acceso" value={formatWeekdays(invitation.weekday)} />
                <DetailRow label="Horario permitido" value={invitation.start_time && invitation.end_time ? `${invitation.start_time.substring(0,5)} - ${invitation.end_time.substring(0,5)}` : null} />
                <DetailRow label="Cantidad de accesos" value={invitation.max_entries} />
            </View>

            <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Invitados</Text>
                <View style={styles.personCard}>
                    <Avatar src={visit?.url_avatar ? getUrlImages(visit.url_avatar) : undefined} name={getFullName(visit)} w={40} h={40} />
                    <View style={styles.personInfo}>
                        <Text style={styles.personName}>{getFullName(visit)}</Text>
                        <Text style={styles.personDetail}>{visit?.ci ? `C.I. ${visit.ci}` : 'CI no registrado'}</Text>
                    </View>
                </View>
            </View>
        </View>

        {!visit?.ci && data?.status !== 'X' && (
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
                onChange={(value: string) => handleChange('plate', value.toUpperCase())}
                autoCapitalize="characters"
              />
            )}
            {tab === 'T' && (
              <View style={styles.taxiFormContainer}>
                <Text style={styles.summaryTitle}>Datos del conductor del taxi</Text>
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
                <Input
                  label="Nombre del taxista"
                  name="name_taxi"
                  error={errors}
                  required
                  disabled={formState?.disbledTaxi}
                  value={formState?.name_taxi || ''}
                  onChange={(value: string) => handleChange('name_taxi', value)}
                />
                <Input
                  label="Segundo nombre"
                  name="middle_name_taxi"
                  error={errors}
                  disabled={formState?.disbledTaxi}
                  value={formState?.middle_name_taxi || ''}
                  onChange={(value: string) => handleChange('middle_name_taxi', value)}
                />
                <Input
                  label="Apellido paterno"
                  name="last_name_taxi"
                  error={errors}
                  required
                  disabled={formState?.disbledTaxi}
                  value={formState?.last_name_taxi || ''}
                  onChange={(value: string) => handleChange('last_name_taxi', value)}
                />
                <Input
                  label="Apellido materno"
                  name="mother_last_name_taxi"
                  error={errors}
                  disabled={formState?.disbledTaxi}
                  value={formState?.mother_last_name_taxi || ''}
                  onChange={(value: string) => handleChange('mother_last_name_taxi', value)}
                />
                <Input
                  label="Placa del taxi"
                  type="text"
                  name="plate"
                  error={errors}
                  required={tab === 'T'}
                  value={formState?.plate || ''}
                  onChange={(value: string) => handleChange('plate', value.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>
            )}
            
            <TouchableOpacity style={styles.addCompanionButton} onPress={() => setOpenAcom(true)}>
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

const styles = StyleSheet.create({
  scrollViewContainer: { 
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: cssVar.cBlackV2,
    padding: 12,
    borderRadius: 12,
    gap: 16,
  },
  summarySection: {
    gap: 12,
  },
  summaryTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: cssVar.cWhite,
    marginBottom: 12
  },
  personCard: {
    backgroundColor: cssVar.cBlackV3,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: cssVar.cWhite,
  },
  personDetail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: cssVar.cWhiteV1,
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
  textAreaContainer: {},
  taxiFormContainer: {
    
  },
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
  }
});

export default FrequentQR;