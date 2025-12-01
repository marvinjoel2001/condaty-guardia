import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import useApi from '../../../../mk/hooks/useApi';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconSimpleAdd} from '../../../icons/IconLibrary';
import List from '../../../../mk/components/ui/List/List';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import Br from '../../Profile/Br';
import SectionIncomeType from '../CiNomModal/SectionIncomeType';
import ExistVisitModal from '../CiNomModal/ExistVisitModal';
import {AccompaniedAdd} from './AccompaniedAdd';

type PropsType = {
  setFormState: any;
  formState: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
  onClose: any;
};

const FrequentQR = ({
  setFormState,
  formState,
  errors,
  setErrors,
  data,
  onClose,
  handleChange,
}: PropsType) => {
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const [openAcom, setOpenAcom] = useState(false);
  const [editAcom, setEditAcom] = useState(false);
  const meesageforUndefined = 'Indefinido';
  const [openExistVisit, setOpenExistVisit] = useState(false);
  const [formStateA, setFormStateA] = useState({});
  const invitation = data;
  const [visit, setVisit] = useState(invitation?.visit || {});
  const [isMain, setIsMain] = useState(false);
  const owner = invitation?.owner;
  const access = invitation?.access;

  const lastAccess =
    access && access.length > 0 ? access[access.length - 1] : null;
  const isCurrentlyInside =
    lastAccess && lastAccess.in_at && !lastAccess.out_at;

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
  }, [tab]);

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
          <TouchableOpacity onPress={() => onDelAcom(acompanante)}>
            <Text
              style={{
                color: cssVar.cAccent,
                fontSize: 12,
                fontFamily: FONTS.semiBold,
              }}>
              Eliminar
            </Text>
          </TouchableOpacity>
        }
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
  const handleEdit = (bandera: boolean) => {
    setFormStateA(bandera ? formStateA : formState);
    setEditAcom(true);
    setOpenAcom(true);
  };
  useEffect(() => {
    if (!visit?.ci) {
      setFormStateA(formState);
      setOpenExistVisit(true);
      setIsMain(true);
    }
  }, [visit]);
  const getStatusTextPhoto = () => {
    if (!formState?.ci_reverso || !formState?.ci_anverso) {
      return '/ Foto pendiente';
    }
    return '';
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
          title={getFullName(formState)}
          subtitle={
            'C.I. ' + (formState.ci || '-/-') + ' ' + getStatusTextPhoto()
          }
          left={
            <Avatar
              hasImage={0}
              src={getUrlImages(
                `/VISIT-${formState?.id}.png?d=${formState?.updated_at}`,
              )}
              name={getFullName(formState)}
            />
          }
          right={
            <TouchableOpacity onPress={() => handleEdit(false)}>
              <Text
                style={{
                  color: cssVar.cAccent,
                  fontSize: 12,
                  fontFamily: FONTS.semiBold,
                }}>
                Editar
              </Text>
            </TouchableOpacity>
          }
        />
      </Card>
      {!isCurrentlyInside && data?.status !== 'X' && (
        <>
          <TouchableOpacity
            style={styles.boxAcompanante}
            onPress={() => setOpenExistVisit(true)}>
            <Icon name={IconSimpleAdd} size={16} color={cssVar.cAccent} />
            <Text
              style={{
                color: cssVar.cAccent,
                fontFamily: FONTS.semiBold,
              }}>
              Agregar acompañante
            </Text>
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
      {!isCurrentlyInside && data?.status !== 'X' && (
        <SectionIncomeType
          errors={errors}
          formState={formState}
          handleChangeInput={handleChange}
          setErrors={setErrors}
          setFormState={setFormState}
          setTab={setTab}
          tab={tab}
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
      {openExistVisit && (
        <ExistVisitModal
          open={openExistVisit}
          formState={formStateA}
          setFormState={setFormStateA}
          item={formState}
          setItem={setFormState}
          extraOnClose={() => {
            onClose();
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
            onClose({});
          }}
        />
      )}
    </>
  );
};

export default FrequentQR;

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
  addCompanionText: {
    color: cssVar.cAccent,
    textDecorationLine: 'underline',
    marginLeft: 4,
    fontSize: 12,
  },
});