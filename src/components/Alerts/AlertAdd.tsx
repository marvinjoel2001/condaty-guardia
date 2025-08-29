import React, {useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import Select from '../../../mk/components/forms/Select/Select';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import useApi from '../../../mk/hooks/useApi';
import useAuth from '../../../mk/hooks/useAuth';
import {cssVar} from '../../../mk/styles/themes';
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';
import {ALERT_LEVEL_OPTIONS} from './alertConstants';
import {View} from 'react-native';

type PropsType = {
  open: boolean;
  onClose: () => void;
  reload: any;
};

const AlertAdd = ({open, onClose, reload}: PropsType) => {
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors]: any = useState({});
  const {showToast} = useAuth();
  const {execute} = useApi();

  const handleInputChange = (name: string, value: any) => {
    const v = value?.target?.value ? value.target.value : value;
    setFormState({
      ...formState,
      [name]: v,
    });
  };

  const validate = () => {
    let errors: any = {};
    errors = checkRules({
      value: formState.level,
      rules: ['required'],
      key: 'level',
      errors,
    });
    errors = checkRules({
      value: formState.descrip,
      rules: ['required'],
      key: 'descrip',
      errors,
    });
    setErrors(errors);
    return errors;
  };

  const onSaveAlerts = async () => {
    if (hasErrors(validate())) {
      return;
    }
    const {data: alerts, error: err} = await execute('/alerts', 'POST', {
      level: formState.level,
      descrip: formState.descrip,
    });
    if (alerts?.success) {
      onClose();
      reload();
      showToast('Alerta Enviada', 'success');
    } else {
      const errorMessage =
        typeof err === 'string' ? err : 'Error al enviar la alerta';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <ModalFull
      title="Agregar alerta"
      open={open}
      onClose={onClose}
      buttonText="Guardar"
      onSave={onSaveAlerts}>
      <View style={{gap: cssVar.spM, marginTop: cssVar.spM}}>
        <Select
          name="level"
          required
          label="Nivel de alerta"
          placeholder="Selecciona el nivel"
          value={formState.level}
          onChange={(value) => handleInputChange('level', value)}
          options={ALERT_LEVEL_OPTIONS}
          optionValue="id"
          optionLabel="name"
          error={errors.level}
        />
        <TextArea
          label="Descripción"
          name="descrip"
          required
          error={errors}
          value={formState.descrip}
          onChange={value => handleInputChange('descrip', value)}
        />
      </View>
    </ModalFull>
  );
};

export default AlertAdd;
