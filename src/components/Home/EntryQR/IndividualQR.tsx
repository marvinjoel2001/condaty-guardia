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
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Input from '../../../../mk/components/forms/Input/Input';
import useApi from '../../../../mk/hooks/useApi';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import {AccompaniedAdd} from './AccompaniedAdd';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconSimpleAdd, IconX} from '../../../icons/IconLibrary'; // IconAdd es usado en la nueva version del boton
import List from '../../../../mk/components/ui/List/List';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import Br from '../../Profile/Br';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import useAuth from '../../../../mk/hooks/useAuth';
import ExistVisitModal from '../CiNomModal/ExistVisitModal';
import SectionIncomeType from '../CiNomModal/SectionIncomeType';

type PropsType = {
  setFormState: any;
  formState: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
  onClose: any;
};

const IndividualQR = ({
  setFormState,
  formState,
  errors,
  setErrors,
  data,
  handleChange,
  onClose,
}: PropsType) => {
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const [openAcom, setOpenAcom] = useState(false);
  const [editAcom, setEditAcom] = useState(false);
  const {showToast} = useAuth();
  const [visit, setVisit] = useState(data?.visit || {});
  const [openExistVisit, setOpenExistVisit] = useState(false);
  const [formStateA, setFormStateA] = useState({});
  const [isMain, setIsMain] = useState(false);
  const owner = data?.owner;
  const access = data?.access;

  // useEffect(() => {
  //   const currentVisit = data?.visit;
  //   const currentAccess = data?.access;
  //   if (data) {
  //     setFormState((prevState: any) => ({
  //       ...prevState,
  //       ci: currentVisit?.ci || prevState?.ci || '',
  //       name: currentVisit?.name || prevState?.name || '',
  //       middle_name: currentVisit?.middle_name || prevState?.middle_name || '',
  //       last_name: currentVisit?.last_name || prevState?.last_name || '',
  //       mother_last_name:
  //         currentVisit?.mother_last_name || prevState?.mother_last_name || '',
  //       access_id: currentAccess?.[0]?.id || prevState?.access_id || null,
  //       obs_in: currentAccess?.[0]?.obs_in || prevState?.obs_in || '',
  //       obs_out: currentAccess?.[0]?.obs_out || prevState?.obs_out || '',
  //       // plate es manejado por el efecto de 'tab' y onExistTaxi
  //     }));
  //   }
  // }, [data, setFormState]);

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
        plate: formState.plate || visit?.vehicle?.plate || '',
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
      return dpto.nro || 'No especificada';
    }
    return 'No especificada';
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
            title={getFullName(formState)}
            subtitle={
              'C.I. ' + (formState?.ci || '-/-') + ' ' + getStatusTextPhoto()
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
                  }}>
                  Editar
                </Text>
              </TouchableOpacity>
            }
          />
          <KeyValue
            style={{marginTop: cssVar.spM}}
            keys="Descripción "
            value={data?.obs || '-/-'}
          />
        </Card>
        {/* {!visit?.ci && data?.status !== 'X' && (
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
              // onBlur={onExistVisits}
            />
            <InputFullName
              formState={formState}
              errors={errors}
              handleChangeInput={handleChange}
              inputGrid={true}
            />
          </View>
        )} */}
        {access?.length === 0 && data?.status !== 'X' && (
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
          </>
        )}

        {!access?.[0]?.in_at && data?.status !== 'X' && (
          <SectionIncomeType
            tab={tab}
            setTab={setTab}
            formState={formState}
            setFormState={setFormState}
            handleChangeInput={handleChange}
            errors={errors}
            setErrors={setErrors}
          />
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
});
