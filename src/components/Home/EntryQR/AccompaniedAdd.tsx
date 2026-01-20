import React, { useState } from 'react';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import Input from '../../../../mk/components/forms/Input/Input';
import useAuth from '../../../../mk/hooks/useAuth';
import { checkRules, hasErrors } from '../../../../mk/utils/validate/Rules';
import { View, Platform, useWindowDimensions } from 'react-native';
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
  const { showToast } = useAuth();
  const { height } = useWindowDimensions();

  const handleChange = (key: string, value: any) => {
    setFormState((prevState: any) => ({ ...prevState, [key]: value }));
  };
  const validate = (values: any = formState) => {
    let errors: any = {};

    errors = checkRules({
      value: values.ci,
      rules: ['required', 'ci'],
      key: 'ci',
      errors,
    });
    errors = checkRules({
      value: values.name,
      rules: ['required', 'alpha'],
      key: 'name',
      errors,
    });
    errors = checkRules({
      value: values.middle_name,
      rules: ['alpha'],
      key: 'middle_name',
      errors,
    });
    errors = checkRules({
      value: values.last_name,
      rules: ['required', 'alpha'],
      key: 'last_name',
      errors,
    });
    errors = checkRules({
      value: values.mother_last_name,
      rules: ['alpha'],
      key: 'mother_last_name',
      errors,
    });

    setErrors(errors);
    return errors;
  };
  const onSave = async (force: boolean = false) => {
    const values = {
      ...formState,
      name: formState.name?.trim(),
      middle_name: formState.middle_name?.trim(),
      last_name: formState.last_name?.trim(),
      mother_last_name: formState.mother_last_name?.trim(),
    };
    setFormState(values);
    if (editItem) {
      if (!force && hasErrors(validate(values))) {
        return;
      }
      setItem({
        ...item,
        ci: values.ci,
        name: values.name,
        middle_name: values.middle_name,
        last_name: values.last_name,
        mother_last_name: values.mother_last_name,
        ci_anverso: values.ci_anverso,
        ci_reverso: values.ci_reverso,
      });
      _onClose();
      return;
    }

    let acompanantes = item?.acompanantes || [];
    if (acompanantes?.length > 0) {
      const exist = acompanantes.find(
        (acompanante: any) => acompanante.ci === values.ci,
      );
      if (exist) {
        showToast('El acompañante ya esta en la lista', 'error');
        return;
      }
    }
    if (item?.ci === values.ci || item?.ci_taxi === values.ci) {
      showToast('El ci ya esta en la lista', 'error');
      return;
    }

    if (!force && hasErrors(validate(values))) {
      return;
    }

    acompanantes.push({
      ci: values.ci,
      name: values.name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      mother_last_name: values.mother_last_name,
      ci_anverso: values.ci_anverso,
      ci_reverso: values.ci_reverso,
    });

    setItem({ ...item, acompanantes });
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

  const handleClose = () => {
    const hasData =
      formState?.name ||
      formState?.last_name ||
      formState?.middle_name ||
      formState?.mother_last_name;

    if (hasData) {
      onSave(true);
    } else {
      _onClose();
    }
  };

  return (
    <DynamicModal
      title={editItem ? 'Editar datos' : 'Persona no encontrada'}
      open={open}
      onClose={handleClose}
      height={Platform.OS === 'web' ? Math.min(468, height * 0.85) : 468}
      styleHeader={{ borderBottomWidth: 0 }}
      buttonText="Registrar"
      subTitle="Agrega sus datos para registrarla"
      variant="V2"
      buttonCancelText=""
      onSave={() => onSave(false)}
    >
      <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
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
      <View style={{ gap: 12, width: '100%' }}>
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
          handleChangeInput={handleChange}
          inputGrid={true}
        />
      </View>
    </DynamicModal>
  );
};
