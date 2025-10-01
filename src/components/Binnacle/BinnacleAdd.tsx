import React, { useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import useAuth from '../../../mk/hooks/useAuth';
import useApi from '../../../mk/hooks/useApi';
import UploadImage from '../../../mk/components/forms/UploadImage/UploadImage';
type PropsType = {
  open: boolean;
  onClose: () => void;
  reload: any;
};

const BinnacleAdd = ({open, onClose, reload}: PropsType) => {
  const [errors, setErrors]: any = useState({});
  const [formState, setFormState]: any = useState();
  const {showToast} = useAuth();
  const {execute} = useApi();

  const handleInputChange = (name: string, value: any) => {
    const v = value?.target?.value ? value.target.value : value;
    setFormState({
      ...formState,
      [name]: v,
    });
  };
  const onSaveNovedades = async () => {
    if (!formState?.descrip) {
      setErrors({descrip: 'Ingrese una descripcion'});
      return;
    }

    const {data: novedad} = await execute('/guardnews', 'POST', {
      descrip: formState.descrip,
      imageNew: {file: encodeURIComponent(formState.avatar), ext: 'webp'},
    });
    if (novedad?.success) {
      onClose();
      reload();
      setFormState({});
      showToast('Novedad agregada', 'success');
    } else {
      showToast('Ocurrió un error', 'error');
    }
  };

  return (
    <ModalFull
      open={open}
      title="Nueva bitácora"
      onSave={onSaveNovedades}
      onClose={onClose}
      buttonText="Enviar reporte"
      buttonCancel="">
      <TextArea
        type="textArea"
        label="Escribir reporte..."
        name="descrip"
        // placeholder="Escribir reporte..."
        error={errors}
        maxLength={250}
        required={false}
        value={formState?.descrip}
        onChange={value => handleInputChange('descrip', value)}
      />

      <UploadImage
        style={{marginTop: 0}}
        setFormState={setFormState}
        formState={formState}
        label="Adjuntar imagen"
        name="avatar"
      />
    </ModalFull>
  );
};

export default BinnacleAdd;
