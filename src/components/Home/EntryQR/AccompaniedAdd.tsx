import React, {useState} from 'react';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import Input from '../../../../mk/components/forms/Input/Input';
import useAuth from '../../../../mk/hooks/useAuth';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
import {View} from 'react-native';
import UploadImage from '../../../../mk/components/forms/UploadImage/UploadImage';
import DynamicModal from '../../../../mk/components/ui/DynamicModal/DynamicModal';
import UploadFileV2 from '../../../../mk/components/forms/UploadFileV2';
type TypeProps = {
  open: boolean;
  onClose: () => void;
  item: any;
  setItem: any;
  editItem?: any;
  formState: any;
  setFormState: any;
  isMain?: boolean;
  disabledCi?: boolean;
  extraOnClose?: () => void;
};

export const AccompaniedAdd = ({
  open,
  onClose,
  item,
  setItem,
  formState,
  setFormState,
  editItem,
  disabledCi = true,
  isMain = false,
  extraOnClose = () => {},
}: TypeProps) => {
  const [errors, setErrors]: any = useState({});
  const {showToast} = useAuth();

  const handleChange = (key: string, value: any) => {
    setFormState((prevState: any) => ({...prevState, [key]: value}));
  };
  const validate = () => {
    let errors: any = {};

    errors = checkRules({
      value: formState.ci,
      rules: ['required', 'ci'],
      key: 'ci',
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

    setErrors(errors);
    return errors;
  };
  const onSave = async () => {
    if (editItem) {
      if (hasErrors(validate())) {
        return;
      }
      setItem({
        ...item,
        ci: formState.ci,
        name: formState.name,
        middle_name: formState.middle_name,
        last_name: formState.last_name,
        mother_last_name: formState.mother_last_name,
        ci_anverso: formState.ci_anverso,
        ci_reverso: formState.ci_reverso,
      });
      _onClose();
      return;
    }

    let acompanantes = item?.acompanantes || [];
    if (acompanantes?.length > 0) {
      const exist = acompanantes.find(
        (acompanante: any) => acompanante.ci === formState.ci,
      );
      if (exist) {
        showToast('El acompañante ya esta en la lista', 'error');
        return;
      }
    }
    if (item?.ci === formState.ci || item?.ci_taxi === formState.ci) {
      showToast('El ci ya esta en la lista', 'error');
      return;
    }

    if (hasErrors(validate())) {
      return;
    }

    acompanantes.push({
      ci: formState.ci,
      name: formState.name,
      middle_name: formState.middle_name,
      last_name: formState.last_name,
      mother_last_name: formState.mother_last_name,
      ci_anverso: formState.ci_anverso,
      ci_reverso: formState.ci_reverso,
    });

    setItem({...item, acompanantes});
    _onClose();
  };

  const _onClose = () => {
    onClose();
    setFormState({});
    if (
      isMain &&
      !formState?.name &&
      !formState?.middle_name &&
      !formState?.last_name &&
      !formState?.mother_last_name
    ) {
      extraOnClose?.();
    }
  };
  return (
    <DynamicModal
      title={editItem ? 'Editar datos' : 'Persona no encontrada'}
      open={open}
      onClose={_onClose}
      height={468}
      styleHeader={{borderBottomWidth: 0}}
      buttonText="Registrar"
      subTitle="Agrega sus datos para registrarla"
      variant="V2"
      buttonCancelText=""
      onSave={onSave}>
      <View style={{flexDirection: 'row', gap: 12}}>
        <UploadFileV2
          variant="V2"
          style={{
            marginBottom: 12,
          }}
          setFormState={setFormState}
          formState={formState}
          label="Carnet anverso"
          name="ci_anverso"
          global
        />
        <UploadFileV2
          variant="V2"
          style={{
            marginBottom: 12,
          }}
          setFormState={setFormState}
          formState={formState}
          label="Carnet reverso"
          name="ci_reverso"
          global
        />
      </View>
      <Input
        label="Carnet de identidad"
        keyboardType="numeric"
        maxLength={10}
        name="ci"
        value={formState?.ci}
        error={errors}
        required={true}
        onChange={(value: any) => handleChange('ci', value)}
        disabled={disabledCi}
      />

      <InputFullName
        formState={formState}
        errors={errors}
        // name_prefijo="_a"

        handleChangeInput={handleChange}
        // disabled={editItem}
        inputGrid={true}
      />
    </DynamicModal>
  );
};
