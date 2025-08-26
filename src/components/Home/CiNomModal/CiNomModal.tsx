import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import useAuth from '../../../../mk/hooks/useAuth';
import useApi from '../../../../mk/hooks/useApi';
import {checkRules} from '../../../../mk/utils/validate/Rules';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Select from '../../../../mk/components/forms/Select/Select';
import Input from '../../../../mk/components/forms/Input/Input';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {getFullName} from '../../../../mk/utils/strings';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import InputNameCi from './shared/InputNameCi';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import {IconAlert, IconX} from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {TouchableOpacity} from 'react-native';
import {AccompaniedAdd} from '../EntryQR/AccompaniedAdd';
import {getUTCNow} from '../../../../mk/utils/dates';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';

interface CiNomModalProps {
  open: boolean;
  onClose: () => void;
  reload: any;
}

const CiNomModal = ({open, onClose, reload}: CiNomModalProps) => {
  const {showToast} = useAuth();
  const [visit, setVisit]: any = useState([]);
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors] = useState({});
  const [steps, setSteps] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const [typeSearch, setTypeSearch] = useState('P');
  const [addCompanion, setAddCompanion] = useState(false);

  const handleDeleteAcompanante = (ci: any) => {
    const newAcompanante = formState.acompanantes.filter(
      (acomDelete: any) => acomDelete.ci !== ci,
    );
    setFormState((old: any) => ({...old, acompanantes: newAcompanante}));
  };
  const hasErrors = (errors: any) => {
    for (const key in errors) {
      if (errors[key]) {
        return true;
      }
    }
    return false;
  };

  const [dataOwners, setDataOwners] = useState([]);

  const {
    data: owners,
    loaded,
    execute,
  } = useApi('/owners', 'GET', {
    perPage: -1,
    sortBy: 'name',
    orderBy: 'asc',
    searchBy: '',
    fullType: 'L',
  });

  useEffect(() => {
    if (owners?.data) {
      const newOwners = owners?.data.map((owner: any) => ({
        ...owner,
        name:
          getFullName(owner) +
          ' - ' +
          owner?.dpto[0]?.nro +
          ' - ' +
          owner?.dpto[0]?.type?.name,
      }));
      setDataOwners(newOwners);
    }
  }, [owners?.data]);

  const handleChangeInput = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const getVisits = async () => {
    // if (hasErrors(validate())) {
    //   return;
    // }

    const {data: visitData} = await execute(
      '/visits',
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
    setVisit(visitData?.data);
    if (visitData?.data.length === 0) {
      setSteps(2);
      setOpenAlert(true);

      return;
    } else {
      setSteps(1);
      setFormState({
        ...formState,
        name: visitData?.data[0].name,
        middle_name: visitData?.data[0].middle_name,
        last_name: visitData?.data[0].last_name,
        mother_last_name: visitData?.data[0].mother_last_name,
        ci: visitData?.data[0].ci,
      });
    }
  };

  const validate = () => {
    let errors: any = {};
    errors = checkRules({
      value: formState.ci,
      rules: ['required', 'ci'],
      key: 'ci',
      errors,
    });
    if (steps > 0) {
      errors = checkRules({
        value: formState.owner_id,
        rules: ['required'],
        key: 'owner_id',
        errors,
      });
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

      if (typeSearch == 'V' || typeSearch == 'T') {
        errors = checkRules({
          value: formState.plate,
          rules: ['required', 'plate'],
          key: 'plate',
          errors,
        });
        if (typeSearch == 'T') {
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
    }

    setErrors(errors);
    return errors;
  };

  const onSave = async () => {
    if (hasErrors(validate())) {
      return;
    }
    if (steps === 0) {
      getVisits();
      return;
    }
    const url = '/accesses';
    let method = 'POST';

    const {data, error: err} = await execute(url, method, {
      ...formState,
      begin_at: formState?.begin_at || getUTCNow(),
    });

    if (data?.success === true) {
      onClose();
      // Removed reload call since reload is not defined in the component scope
      reload();
      showToast('Notificación enviada', 'success');
    } else {
      showToast(data?.message, 'error');
    }
  };

  const acompanantesList = (item: any) => {
    // console.log(item,'item',formState.acompanantes,'formState.acompanantes')
    return (
      <ItemList
        title={getFullName(item)}
        subtitle={`CI: ${item.ci}`}
        left={<Avatar name={getFullName(item)} />}
        right={
          <Icon
            name={IconX}
            color={cssVar.cError}
            size={20}
            style={{
              borderRadius: 20,
              padding: 4,
              elevation: 2,
            }}
            onPress={() => handleDeleteAcompanante(item.ci)}
          />
        }
      />
    );
  };
  useEffect(() => {
    setFormState({
      ...formState,
      ci_taxi: '',
      name_taxi: '',
      middle_name_taxi: '',
      last_name_taxi: '',
      mother_last_name_taxi: '',
      plate: '',
      disbledTaxi: false,
    });
  }, [typeSearch]);

  const onExistTaxi = async () => {
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
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
      setVisit([]);
      setFormState({owner_id: formState?.owner_id, ci: formState?.ci});
      return;
    }
    onClose();
  };

  return (
    <ModalFull
      open={open}
      onClose={_onClose}
      title={steps > 0 ? 'Registrar sin qr' : 'Visitante sin qr'}
      buttonText={
        steps > 0 ? 'Notificar al residente' : steps <= 0 ? 'Buscar' : ''
      }
      onSave={onSave}>
      <>
        {visit.length > 0 && (
          <ItemList
            title={getFullName(visit[0])}
            subtitle={`CI: ${visit[0]?.ci}`}
            left={<Avatar name={getFullName(visit[0])} />}
          />
        )}
        <Select
          filter
          label="¿A quién visita?"
          name="owner_id"
          required={true}
          options={dataOwners || []}
          value={formState.owner_id || ''}
          onChange={value => handleChangeInput('owner_id', value.target.value)}
          optionValue="id"
          error={errors}
          optionLabel="name"
          height={300}
          search={true}
          style={{
            paddingTop: cssVar.spM,
          }}
        />
        {visit.length === 0 && steps === 0 && (
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
        {steps === 2 && (
          <InputNameCi
            formStateName={formState}
            formStateCi={formState.ci}
            disabledCi={steps === 2}
            handleChangeInput={handleChangeInput}
            errors={errors}
          />
        )}
        {steps > 0 && (
          <TextArea
            label="Observaciones de Entrada"
            name="obs_in"
            value={formState?.obs_in}
            onChange={(e: any) => handleChangeInput('obs_in', e)}
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
                    color: cssVar.cWhiteV2,
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
                  onChange={(value: any) => handleChangeInput('ci_taxi', value)}
                />
                <InputFullName
                  formState={formState}
                  errors={errors}
                  handleChangeInput={handleChangeInput}
                  disabled={formState?.disbledTaxi}
                  prefijo={'_taxi'}
                />
                <Input
                  label="Placa"
                  type="text"
                  name="plate"
                  error={errors}
                  required={typeSearch == 'T'}
                  value={formState['plate']}
                  onChange={(value: any) => handleChangeInput('plate', value)}
                />
              </>
            )}
          </>
        )}
        {formState.acompanantes?.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 16,
                fontFamily: FONTS.medium,
                marginBottom: 4,
                color: cssVar.cWhiteV2,
              }}>
              {formState.acompanantes?.length > 1
                ? 'Acompañantes:'
                : 'Acompañante:'}
            </Text>
            <List
              data={formState.acompanantes}
              renderItem={acompanantesList}
              refreshing={!loaded}
            />
          </>
        )}

        {steps > 0 && (
          <TouchableOpacity
            style={{
              alignSelf: 'flex-start',
              marginVertical: 4,
            }}
            onPress={() => setAddCompanion(true)}>
            <Text
              style={{
                color: cssVar.cWhite,
                textDecorationLine: 'underline',
              }}>
              Agregar acompañante
            </Text>
          </TouchableOpacity>
        )}
      </>

      {openAlert && (
        <Modal
          open={openAlert}
          onClose={onClose}
          iconClose={false}
          onSave={() => setOpenAlert(false)}
          buttonText="Registrar"
          buttonCancel=""
          headerStyles={{backgroundColor: 'transparent'}}>
          <View style={styles.modalAlert}>
            <Icon name={IconAlert} size={80} color={cssVar.cWarning} />
            <Text style={styles.modalAlertText}>¡Visita no registrada!</Text>
          </View>
        </Modal>
      )}
      {addCompanion && (
        <AccompaniedAdd
          open={addCompanion}
          onClose={() => {
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
  modalAlert: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalAlertText: {
    fontSize: 20,
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
  },
});
