import React, {useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import Select from '../../../mk/components/forms/Select/Select';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import useApi from '../../../mk/hooks/useApi';
import useAuth from '../../../mk/hooks/useAuth';
import {cssVar} from '../../../mk/styles/themes';
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';

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
    if (alerts?.success == true) {
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
      open={open}
      onClose={onClose}
      title="Crear Alerta"
      onSave={onSaveAlerts}
      buttonText="Crear alerta">
      <Select
        label="Nivel de alerta"
        // placeholder="Nivel de alerta"
        error={errors}
        required
        name="level"
        style={{
          paddingTop: cssVar.spM,
        }}
        options={[
          {id: 1, name: 'Bajo - Solo guardias'},
          {id: 2, name: 'Medio - Solo administradores y guardias'},
          {id: 3, name: 'Alto - Residentes, administradores y guardias'},
        ]}
        value={formState.level}
        onChange={value => handleInputChange('level', value)}
      />
      <TextArea
        label="Descripción"
        // placeholder="Ej. Se ha detectado un incendio en el edificio 1 piso 2."
        name="descrip"
        required
        error={errors}
        value={formState.descrip}
        onChange={value => handleInputChange('descrip', value)}
      />
    </ModalFull>
  );
};

export default AlertAdd;
