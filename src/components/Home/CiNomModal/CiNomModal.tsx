import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, Keyboard} from 'react-native';
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
import {IconSimpleAdd, IconX} from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {AccompaniedAdd} from '../EntryQR/AccompaniedAdd';
import {getUTCNow} from '../../../../mk/utils/dates';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import KeyQR from '../EntryQR/KeyQR';

interface CiNomModalProps {
  open: boolean;
  onClose: () => void;
  reload: any;
  data: any;
}

const CiNomModal = ({open, onClose, reload, data}: CiNomModalProps) => {
  const {showToast} = useAuth();
  const [visit, setVisit]: any = useState(null);
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors] = useState({});
  const [steps, setSteps] = useState(0);
  const [saving, setSaving] = useState(false);
  const [typeSearch, setTypeSearch] = useState('P');
  const [addCompanion, setAddCompanion] = useState(false);
  const [dataOwner, setDataOwner]: any = useState(null);

  const handleDeleteAcompanante = (ci: any) => {
    const newAcompanante = formState.acompanantes.filter(
      (acomDelete: any) => acomDelete.ci !== ci,
    );
    setFormState((old: any) => ({...old, acompanantes: newAcompanante}));
  };
  const [dataOwners, setDataOwners] = useState([]);
  const {execute} = useApi();
  // const {
  //   data: owners,
  //   loaded,
  //   execute,
  // } = useApi(
  //   '/owners',
  //   'GET',
  //   {
  //     perPage: -1,
  //     sortBy: 'name',
  //     orderBy: 'asc',
  //     searchBy: '',
  //     fullType: 'SG',
  //   },
  //   3,
  // );
  useEffect(() => {
    if (data) {
      const newOwners = data.map((owner: any) => {
        let nro = '';
        if (owner?.dpto && owner?.dpto.length > 0) {
          nro = owner.dpto[0].type.name + ' ' + owner.dpto[0].nro;
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
        setVisit(visitData?.data);
        setFormState({
          ...formState,
          name: visitData?.data?.name,
          middle_name: visitData?.data?.middle_name,
          last_name: visitData?.data?.last_name,
          mother_last_name: visitData?.data?.mother_last_name,
          ci: visitData?.data?.ci,
          plate: visitData?.data?.plate,
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

    // Validar datos del visitante solo cuando no existe visit (steps === 1)
    if (steps === 1 && !visit) {
      errors = checkRules({
        value: formState.name,
        rules: ['required', 'alpha'],
        key: 'name',
        errors,
      });
      errors = checkRules({
        value: formState.middle_name,
        rules: ['alpha'],
        key: 'middle_name',
        errors,
      });
      errors = checkRules({
        value: formState.last_name,
        rules: ['required', 'alpha'],
        key: 'last_name',
        errors,
      });
      errors = checkRules({
        value: formState.mother_last_name,
        rules: ['alpha'],
        key: 'mother_last_name',
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
      onClose();
      reload();
      showToast(
        dataOwner ? 'Visita registrada' : 'Notificación enviada',
        'success',
      );
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
          <Icon
            name={IconX}
            color={cssVar.cError}
            size={20}
            style={{
              borderRadius: 20,
              padding: 4,
            }}
            onPress={() => handleDeleteAcompanante(item.ci)}
          />
        }
      />
    );
  };
  useEffect(() => {
    if (typeSearch === 'V') {
      setFormState((prevState: any) => ({
        ...prevState,
        tab: typeSearch,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        disbledTaxi: false,
        plate: prevState?.plate || visit?.plate || '',
      }));
    }
    if (typeSearch === 'P' || typeSearch == 'T') {
      setFormState((prevState: any) => ({
        ...prevState,
        tab: typeSearch,
        ci_taxi: '',
        name_taxi: '',
        middle_name_taxi: '',
        last_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
      }));
    }
  }, [typeSearch]);

  const onExistTaxi = async () => {
    if (formState?.ci_taxi == formState?.ci) {
      return setErrors({errors, ci_taxi: 'El ci ya fue añadido'});
    }
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
    setErrors({errors, ci_taxi: ''});
    if (exist?.data) {
      setFormState({
        ...formState,
        ci_taxi: exist?.data.ci,
        name_taxi: exist?.data.name,
        middle_name_taxi: exist?.data.middle_name,
        last_name_taxi: exist?.data.last_name,
        mother_last_name_taxi: exist?.data.mother_last_name,
        plate: exist?.data.plate,
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

  const _onClose = () => {
    if (steps > 0) {
      setSteps(0);
      setVisit(null);
      setFormState({owner_id: formState?.owner_id, ci: formState?.ci});
      return;
    }
    onClose();
  };

  return (
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
          />
        ) : (
          <>
            {!visit && steps === 0 && (
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
            {visit && (
              <ItemList
                title={getFullName(visit)}
                subtitle={`CI: ${visit?.ci}`}
                left={
                  <Avatar
                    name={getFullName(visit)}
                    hasImage={visit?.has_image}
                  />
                }
              />
            )}

            {steps === 1 && !visit && (
              <InputNameCi
                formStateName={formState}
                formStateCi={formState?.ci}
                disabledCi={true}
                handleChangeInput={handleChangeInput}
                errors={errors}
              />
            )}

            {steps > 0 && (
              <>
                <TabsButtons
                  tabs={[
                    {value: 'P', text: 'A pie'},
                    {value: 'V', text: 'En vehículo'},
                    {value: 'T', text: 'En taxi'},
                  ]}
                  sel={typeSearch}
                  setSel={setTypeSearch}
                />
                {typeSearch == 'V' && (
                  <Input
                    label="Placa"
                    autoCapitalize="characters"
                    type="text"
                    name="plate"
                    error={errors}
                    required={typeSearch == 'V'}
                    value={formState['plate']}
                    onChange={(value: any) => {
                      handleChangeInput('plate', value);
                    }}
                  />
                )}
                {typeSearch == 'T' && (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginBottom: 4,
                        color: cssVar.cWhite,
                        fontFamily: FONTS.medium,
                      }}>
                      Datos del conductor:
                    </Text>
                    <Input
                      label="Carnet de identidad"
                      type="date"
                      name="ci_taxi"
                      required
                      maxLength={10}
                      error={errors}
                      value={formState['ci_taxi']}
                      onBlur={() => onExistTaxi()}
                      onChange={(value: any) =>
                        handleChangeInput('ci_taxi', value)
                      }
                    />
                    <InputFullName
                      formState={formState}
                      errors={errors}
                      handleChangeInput={handleChangeInput}
                      disabled={formState?.disbledTaxi}
                      prefijo={'_taxi'}
                      inputGrid={true}
                    />
                    <Input
                      label="Placa"
                      autoCapitalize="characters"
                      type="text"
                      name="plate"
                      error={errors}
                      required={typeSearch == 'T'}
                      value={formState['plate']}
                      onChange={(value: any) =>
                        handleChangeInput('plate', value)
                      }
                    />
                  </>
                )}
              </>
            )}
            {formState?.acompanantes?.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: FONTS.medium,
                    marginBottom: 4,
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
                onPress={() => setAddCompanion(true)}>
                <Icon name={IconSimpleAdd} size={16} color={cssVar.cAccent} />
                <Text
                  style={{
                    color: cssVar.cAccent,
                    textDecorationLine: 'underline',
                  }}>
                  Agregar acompañante
                </Text>
              </TouchableOpacity>
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

      {addCompanion && (
        <AccompaniedAdd
          open={addCompanion}
          onClose={() => {
            Keyboard.dismiss();
            setAddCompanion(false);
          }}
          item={formState}
          setItem={setFormState}
        />
      )}
    </ModalFull>
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
    alignSelf: 'flex-start',
    marginBottom: cssVar.sS,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
