import React, {useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import Select from '../../../mk/components/forms/Select/Select';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import useApi from '../../../mk/hooks/useApi';
import useAuth from '../../../mk/hooks/useAuth';
import { cssVar } from '../../../mk/styles/themes';

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
  const onSaveAlerts = async () => {
    let error: any = {};
    if (!formState['level']) {
      error = {...error, level: 'Seleccione un nivel'};
    }
    if (!formState['descrip']) {
      error = {...error, descrip: 'Ingrese una descripcion'};
    }

    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }
    console.log(error,formState,'errfst')
    const {data: alerts, error: err} = await execute('/alerts', 'POST', {
      level: formState.level,
      descrip: formState.descrip,
    });
    if (alerts?.success == true) {
      onClose();
      reload();
      formState.descrip = '';
      formState.level = '';
      showToast('Alerta Enviada', 'success');
    } else {
      const errorMessage = typeof err === 'string' ? err : 'Error al enviar la alerta';
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
        placeholder="Nivel de alerta"
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
        label="Descripción de la alerta"
        placeholder="Ej. Se ha detectado un incendio en el edificio 1 piso 2."
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
