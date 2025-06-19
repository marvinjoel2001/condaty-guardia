import React, {useState, useEffect} from 'react';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import Input from '../../../../mk/components/forms/Input/Input';
import useApi from '../../../../mk/hooks/useApi';
import useAuth from '../../../../mk/hooks/useAuth';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
type TypeProps = {
  open: boolean;
  onClose: () => void;
  item: any;
  setItem: any;
  editItem?: any;
};

export const AccompaniedAdd = ({open, onClose, item, setItem, editItem}: TypeProps) => {
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors]: any = useState({});
  const {execute} = useApi();
  const {showToast} = useAuth();

  useEffect(() => {
    if (open && editItem) {
      setFormState({
        ci: editItem.ci,
        name: editItem.name,
        middle_name: editItem.middle_name,
        last_name: editItem.last_name,
        mother_last_name: editItem.mother_last_name,
        ciDisabled: false,
      });
    } else if (open) {
      setFormState({});
    }
  }, [open, editItem]);

  const handleChange = (key: string, value: any) => {
    setFormState({...formState, [key]: value});
  };
  const onExist = async () => {
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      // searchBy: formState?.ci,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci,
    });
    if (exist?.data) {
      setFormState({
        ...formState,
        name: exist?.data?.name,
        middle_name: exist?.data?.middle_name,
        last_name: exist?.data?.last_name,
        mother_last_name: exist?.data?.mother_last_name,
        ciDisabled: true,
      });
    } else {
      setFormState({
        ...formState,
        name: editItem ? formState.name : '',
        middle_name: editItem ? formState.middle_name : '',
        last_name: editItem ? formState.last_name : '',
        mother_last_name: editItem ? formState.mother_last_name : '',
        ciDisabled: false,
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
  // console.log(formState,'fst aad')
  // console.log(item,'item aad')
  const onSave = async () => {
    let acompanantes = item?.acompanantes || [];
    if (editItem) {
      acompanantes = acompanantes.map((acompanante: any) =>
        acompanante.ci === editItem.ci
          ? {
              ci: formState.ci,
              name: formState.name,
              middle_name: formState.middle_name,
              last_name: formState.last_name,
              mother_last_name: formState.mother_last_name,
            }
          : acompanante
      );
      setItem({...item, acompanantes});
      _onClose();
      setFormState({});
      showToast('Acompañante editado');
      return;
    }
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
      // obs_in: formState.obs_in,
      // nameDisabled: formState.nameDisabled,
    });

    setItem({...item, acompanantes});
    _onClose();
    setFormState({});
    showToast('Acompañante agregado');
  };

  const _onClose = () => {
    setFormState({});
    onClose();
  };
  return (
    <Modal
      title={editItem ? 'Editar acompañante' : 'Agregar acompañante'}
      open={open}
      onClose={_onClose}
      buttonText="Guardar"
      disabled={!formState.ci}
      onSave={onSave}>
      <Input
        label="Carnet de identidad"
        keyboardType="numeric"
        maxLength={10}
        name="ci"
        value={formState?.ci}
        error={errors}
        required={true}
        onChange={(value: any) => handleChange('ci', value)}
        onBlur={() => onExist()}
        disabled={formState?.ciDisabled}
      />
      <InputFullName
        formState={formState}
        errors={errors}
        // name_prefijo="_a"
        handleChangeInput={handleChange}
        disabled={false}
        inputGrid={false}
      />
    </Modal>
  );
};
