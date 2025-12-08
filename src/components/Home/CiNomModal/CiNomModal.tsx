import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, Keyboard, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import useAuth from '../../../../mk/hooks/useAuth';
import useApi from '../../../../mk/hooks/useApi';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Select from '../../../../mk/components/forms/Select/Select';
import Input from '../../../../mk/components/forms/Input/Input';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {getFullName} from '../../../../mk/utils/strings';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import InputNameCi from './shared/InputNameCi';
import {IconSimpleAdd} from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {AccompaniedAdd} from '../EntryQR/AccompaniedAdd';
import {getUTCNow} from '../../../../mk/utils/dates';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import KeyQR from '../EntryQR/KeyQR';
import UploadImage from '../../../../mk/components/forms/UploadImage/UploadImage';
import ExistVisitModal from './ExistVisitModal';
import UploadFileV2 from '../../../../mk/components/forms/UploadFileV2';
import SectionIncomeType from './SectionIncomeType';
import DetAccesses from '../Accesses/DetAccesses';

interface CiNomModalProps {
  open: boolean;
  onClose: () => void;
  reload: any;
  data: any;
}

const CiNomModal = ({open, onClose, reload, data}: CiNomModalProps) => {
  const {showToast} = useAuth();
  // const [visit, setVisit]: any = useState(null);
  const [oldPlate, setOldPlate] = useState('');
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors] = useState({});
  const [steps, setSteps] = useState(0);
  const [saving, setSaving] = useState(false);
  const [typeSearch, setTypeSearch] = useState('P');
  const [addCompanion, setAddCompanion] = useState(false);
  const [openExistVisit, setOpenExistVisit] = useState(false);
  const [dataOwner, setDataOwner]: any = useState(null);
  const [formStateA, setFormStateA] = useState({});
  const [onEdit, setOnEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState({open: false, id: null});

  const handleDeleteAcompanante = (ci: any) => {
    const newAcompanante = formState.acompanantes.filter(
      (acomDelete: any) => acomDelete.ci !== ci,
    );
    setFormState((old: any) => ({...old, acompanantes: newAcompanante}));
  };
  const [dataOwners, setDataOwners] = useState([]);
  const {execute} = useApi();

  useEffect(() => {
    if (data) {
      const newOwners = data.map((owner: any) => {
        let nro = '';
        if (owner?.dpto && owner?.dpto.length > 0) {
          nro = owner.dpto[0]?.type_name + ' ' + owner.dpto[0].nro;
        } else {
          nro = owner.type_name + ' ' + owner.dpto_nro;
        }

        return {
          ...owner,
          name: nro + ' - ' + getFullName(owner),
        };
      });
      setDataOwners(newOwners);
    }
  }, [data]);

  const handleChangeInput = (name: string, value: string) => {
    setFormState((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const visitExist = async () => {
    const {data: visitData} = await execute(
      '/visit-exist',
      'GET',
      {
        perPage: -1,
        page: 1,
        fullType: 'L',
        searchBy: formState.ci,
      },
      false,
      3,
    );
    if (visitData?.success) {
      if (visitData?.data?.owner_exist) {
        setDataOwner({invitation: visitData?.data});
      } else {
        // setVisit(visitData?.data);
        setOldPlate(visitData?.data?.plate);
        setFormState({
          ...formState,
          name: visitData?.data?.name,
          middle_name: visitData?.data?.middle_name,
          last_name: visitData?.data?.last_name,
          mother_last_name: visitData?.data?.mother_last_name,
          ci: visitData?.data?.ci,
          plate: visitData?.data?.plate,
          ci_anverso: visitData?.data?.url_image_a,
          ci_reverso: visitData?.data?.url_image_r,
        });
        setSteps(2);
      }
    } else {
      setSteps(1);
    }
  };

  const validate = () => {
    let errors: any = {};

    // Validar CI siempre
    errors = checkRules({
      value: formState.ci,
      rules: ['required', 'ci'],
      key: 'ci',
      errors,
    });

    // Validar owner_id siempre que no sea paso 0
    if (steps > 0) {
      errors = checkRules({
        value: formState.owner_id,
        rules: ['required'],
        key: 'owner_id',
        errors,
      });
    }

    // Validar vehículo/taxi (aplica para steps > 0)
    if (steps >= 0 && (typeSearch === 'V' || typeSearch === 'T')) {
      if (steps > 0) {
        errors = checkRules({
          value: formState.plate,
          rules: ['required', 'plate'],
          key: 'plate',
          errors,
        });
      }

      if (typeSearch === 'T') {
        errors = checkRules({
          value: formState.ci_taxi,
          rules: ['required', 'ci'],
          key: 'ci_taxi',
          errors,
        });
        errors = checkRules({
          value: formState.name_taxi,
          rules: ['required', 'alpha'],
          key: 'name_taxi',
          errors,
        });
        errors = checkRules({
          value: formState.middle_name_taxi,
          rules: ['alpha'],
          key: 'middle_name_taxi',
          errors,
        });
        errors = checkRules({
          value: formState.last_name_taxi,
          rules: ['required', 'alpha'],
          key: 'last_name_taxi',
          errors,
        });
        errors = checkRules({
          value: formState.mother_last_name_taxi,
          rules: ['alpha'],
          key: 'mother_last_name_taxi',
          errors,
        });
      }
    }

    setErrors(errors);
    return errors;
  };

  const onSave = async () => {
    if (saving) return;
    if (formState?.ci_taxi == formState?.ci) {
      return setErrors({errors, ci_taxi: 'El ci ya fue añadido'});
    }

    if (hasErrors(validate())) {
      return;
    }

    if (steps === 0 && !dataOwner) {
      setSaving(true);
      await visitExist();
      setSaving(false);
      return;
    }

    const url = dataOwner ? '/accesses/enterqr' : '/accesses';
    let method = 'POST';
    let params: any = {
      begin_at: formState?.begin_at || getUTCNow(),
    };

    if (dataOwner) {
      params = {
        ...params,
        owner_id: dataOwner?.invitation?.id,
        type: 'O',
        acompanantes: formState?.acompanantes || [],
        obs_in: formState?.obs_in,
        plate: formState?.plate,
        ci_taxi: formState?.ci_taxi,
        name_taxi: formState?.name_taxi,
        middle_name_taxi: formState?.middle_name_taxi,
        last_name_taxi: formState?.last_name_taxi,
        mother_last_name_taxi: formState?.mother_last_name_taxi,
        visit_id: formState?.visit_id,
        plate_vehicle: formState?.plate_vehicle,
        ci_anverso_taxi: formState?.ci_anverso_taxi,
        ci_reverso_taxi: formState?.ci_reverso_taxi,
      };
    } else {
      params = {
        ...params,
        ...formState,
      };
    }
    setSaving(true);
    const {data, error: err} = await execute(url, method, params, false, 3);

    if (data?.success === true) {
      // onClose();
      // reload();
      setOpenDetail({open: true, id: data?.data});
    } else {
      setSaving(false);
      showToast(data?.message, 'error');
    }
  };

  const acompanantesList = (item: any) => {
    return (
      <ItemList
        title={getFullName(item)}
        subtitle={`CI: ${item.ci}`}
        left={<Avatar name={getFullName(item)} hasImage={item?.has_image} />}
        right={
          <Text
            onPress={() => handleDeleteAcompanante(item.ci)}
            style={{
              color: cssVar.cAccent,
              fontSize: 12,
              fontFamily: FONTS.semiBold,
            }}>
            Eliminar
          </Text>
        }
      />
    );
  };
  useEffect(() => {
    if (typeSearch === 'V') {
      setFormState((prevState: any) => ({
        ...prevState,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        disbledTaxi: false,
        plate: prevState?.plate || oldPlate || '',
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      }));
    }
    if (typeSearch === 'P' || typeSearch == 'T') {
      setFormState((prevState: any) => ({
        ...prevState,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      }));
    }
  }, [typeSearch]);

  const _onClose = () => {
    if (steps > 0) {
      setSteps(0);
      setOldPlate('');
      setFormState({owner_id: formState?.owner_id, ci: formState?.ci});
      return;
    }
    onClose();
  };
  const handleEdit = () => {
    setFormStateA(formState);
    setOnEdit(true);
    setAddCompanion(true);
  };
  const getStatusTextPhoto = () => {
    if (!formState?.ci_reverso || !formState?.ci_anverso) {
      return '/ Foto pendiente';
    }
    return '';
  };
  useEffect(() => {
    if (!formState.name && steps === 1) {
      handleEdit();
    }
  }, [steps]);

  return (
    open && (
      <ModalFull
        open={open}
        onClose={_onClose}
        title={'Visitante sin QR'}
        buttonText={
          saving
            ? 'Procesando...'
            : steps > 0
            ? 'Notificar al residente'
            : steps <= 0
            ? dataOwner
              ? 'Dejar ingresar'
              : 'Buscar'
            : ''
        }
        disabled={saving}
        onSave={onSave}>
        <>
          {dataOwner ? (
            <KeyQR
              data={dataOwner}
              formState={formState}
              setFormState={setFormState}
              handleChange={handleChangeInput}
              errors={errors}
              setTab={setTypeSearch}
              tab={typeSearch}
              setErrors={setErrors}
            />
          ) : (
            <>
              <Text
                style={{
                  marginBottom: 12,
                  fontFamily: FONTS.bold,
                  color: cssVar.cWhite,
                }}>
                ¿A quién visitas?
              </Text>
              <Select
                filter
                label="¿A quién visita?"
                name="owner_id"
                required={true}
                options={dataOwners || []}
                value={formState?.owner_id || ''}
                onChange={value =>
                  handleChangeInput('owner_id', value?.target.value)
                }
                optionValue="id"
                error={errors}
                optionLabel="name"
                height={300}
                search={true}
              />
              <Text
                style={{
                  marginBottom: 12,
                  fontFamily: FONTS.bold,
                  color: cssVar.cWhite,
                }}>
                Visitante
              </Text>
              {steps === 0 && (
                <Input
                  label="Carnet de identidad"
                  type="date"
                  name="ci"
                  error={errors}
                  required={true}
                  value={formState['ci']}
                  maxLength={10}
                  onChange={(value: any) => handleChangeInput('ci', value)}
                />
              )}

              {steps >= 1 && (
                <>
                  <ItemList
                    title={formState?.name ? getFullName(formState) : '-/-'}
                    subtitle={`CI: ${
                      formState?.ci || '-/-'
                    } ${getStatusTextPhoto()}`}
                    left={
                      <Avatar
                        name={formState?.name ? getFullName(formState) : '-/-'}
                        hasImage={formState?.has_image}
                      />
                    }
                    right={
                      <TouchableOpacity onPress={handleEdit}>
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
                </>
              )}
              {formState?.acompanantes?.length > 0 && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FONTS.medium,
                      marginBottom: 10,
                      marginTop: 16,
                      color: cssVar.cWhite,
                    }}>
                    {formState?.acompanantes?.length > 1
                      ? 'Acompañantes:'
                      : 'Acompañante:'}
                  </Text>
                  <List
                    data={formState.acompanantes}
                    renderItem={acompanantesList}
                    // refreshing={!loaded}
                  />
                </>
              )}

              {steps > 0 && (
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
              )}
              {steps > 0 && (
                <SectionIncomeType
                  setErrors={setErrors}
                  formState={formState}
                  handleChangeInput={handleChangeInput}
                  errors={errors}
                  tab={typeSearch}
                  setTab={setTypeSearch}
                  setFormState={setFormState}
                />
              )}

              {steps > 0 && (
                <TextArea
                  label="Observaciones"
                  name="obs_in"
                  placeholder="Ej: El visitante está ingresando con 2 mascotas"
                  value={formState?.obs_in}
                  onChange={(e: any) => handleChangeInput('obs_in', e)}
                  maxAutoHeightRatio={0.3}
                  expandable={true}
                />
              )}
            </>
          )}
        </>
        {openExistVisit && (
          <ExistVisitModal
            open={openExistVisit}
            formState={formStateA}
            setFormState={setFormStateA}
            item={formState}
            setItem={setFormState}
            onClose={() => setOpenExistVisit(false)}
            setOpenNewAcomp={setAddCompanion}
          />
        )}
        {addCompanion && (
          <AccompaniedAdd
            editItem={onEdit}
            open={addCompanion}
            onClose={() => {
              Keyboard.dismiss();
              setAddCompanion(false);
              setOnEdit(false);
            }}
            item={formState}
            setItem={setFormState}
            formState={formStateA}
            setFormState={setFormStateA}
          />
        )}
        {openDetail.open && (
          <DetAccesses
            open={openDetail.open}
            id={openDetail.id}
            close={() => {
              setOpenDetail({open: false, id: null});
              onClose();
            }}
            reload={reload}
          />
        )}
      </ModalFull>
    )
  );
};

export default CiNomModal;

const styles = StyleSheet.create({
  textAcompanante: {
    fontSize: cssVar.sL,
    fontFamily: FONTS.medium,
    marginBottom: 4,
    color: cssVar.cWhite,
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
  modalAlert: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalAlertText: {
    fontSize: cssVar.sXl,
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
  },
});
