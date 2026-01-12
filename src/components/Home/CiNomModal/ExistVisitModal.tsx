import React, {useState} from 'react';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import Input from '../../../../mk/components/forms/Input/Input';
import useAuth from '../../../../mk/hooks/useAuth';
import useApi from '../../../../mk/hooks/useApi';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
interface ExistVisitModalProps {
  open: boolean;
  onClose: () => void;
  formState: any;
  item: any;
  setFormState: any;
  setItem: any;
  setOpenNewAcomp: any;
  isMain?: boolean;
  onDismiss?: () => void;
  extraOnClose?: () => void;
  setIsMain?: (value: boolean) => void;
  type?: 'acompanante' | 'taxi' | 'main';
}

const ExistVisitModal = ({
  open,
  onClose,
  formState,
  setFormState,
  setOpenNewAcomp,
  setItem,
  item,
  isMain = false,
  extraOnClose,
  onDismiss,
  setIsMain = () => {},
  type = 'acompanante',
}: ExistVisitModalProps) => {
  const {showToast} = useAuth();
  const {execute} = useApi();
  const [errors, setErrors] = useState({});

  const validate = () => {
    let errors: any = {};

    errors = checkRules({
      value: formState.ci,
      rules: ['required', 'ci'],
      key: 'ci',
      errors,
    });

    setErrors(errors);
    return errors;
  };
  const onExist = async () => {
    if (hasErrors(validate())) {
      return;
    }
    if (formState?.ci === item.ci) {
      showToast(
        'El ci del acompañante no puede ser igual al ci del visitante',
        'error',
      );
      setFormState({
        ...formState,
        ci: '',
        name: '',
        middle_name: '',
        last_name: '',
        mother_last_name: '',
        ci_anverso: '',
        ci_reverso: '',
      });
      return;
    }
    if (
      item?.acompanantes &&
      item?.acompanantes.some((item: any) => item?.ci == formState?.ci)
    ) {
      showToast('El ci ya se encuentra en la lista', 'error');
      return;
    }
    const {data: exist} = await execute(
      '/visits',
      'GET',
      {
        perPage: 1,
        page: 1,
        exist: '1',
        fullType: 'L',
        ci_visit: formState?.ci,
      },
      false,
      3,
    );

    if (exist?.data) {
      if (type === 'taxi') {
        setItem((prev: any) => ({
          ...prev,
          ci_taxi: exist?.data?.ci,
          name_taxi: exist?.data?.name,
          middle_name_taxi: exist?.data?.middle_name,
          last_name_taxi: exist?.data?.last_name,
          mother_last_name_taxi: exist?.data?.mother_last_name,
          plate: exist?.data?.plate || '',
          disabledTaxi: true,
          disabledCI: true,
          ci_anverso_taxi: exist?.data?.url_image_a,
          ci_reverso_taxi: exist?.data?.url_image_r,
        }));
        setFormState({});
        onClose();
        return;
      }
      if (isMain) {
        setItem({...item, ...exist?.data});
        setIsMain(false);
        onClose();
        return;
      }
      let acompanantes = item?.acompanantes || [];
      acompanantes.push({
        ci: exist?.data?.ci,
        name: exist?.data?.name,
        middle_name: exist?.data?.middle_name,
        last_name: exist?.data?.last_name,
        mother_last_name: exist?.data?.mother_last_name,
        ci_anverso: exist?.data?.url_image_a,
        ci_reverso: exist?.data?.url_image_r,
      });
      setItem({...item, acompanantes});
      setFormState({});
      onClose();
    } else {
      if (type === 'taxi') {
        setItem((prev: any) => ({
          ...prev,
          ci_taxi: formState.ci,
          name_taxi: '',
          last_name_taxi: '',
          middle_name_taxi: '',
          mother_last_name_taxi: '',
          plate: '',
          disabledTaxi: false,
          disabledCI: true,
          ci_anverso_taxi: '',
          ci_reverso_taxi: '',
        }));
        setFormState({});
        onClose();
        return;
      }
      if (!isMain) {
        setOpenNewAcomp(true);
      }
      if (onDismiss && isMain) {
        onDismiss();
      }
      onClose();
    }
  };
  const handleChange = (key: string, value: any) => {
    setFormState((prevState: any) => ({...prevState, [key]: value}));
  };
  const _onClose = () => {
    onClose();
    setFormState({});
    if (isMain) {
      extraOnClose?.();
    }
  };
  return (
    <Modal
      title={
        type === 'taxi'
          ? 'Buscar conductor'
          : isMain
          ? 'Agregar visitante'
          : 'Agregar acompañante'
      }
      open={open}
      onClose={_onClose}
      buttonText="Buscar"
      disabled={!formState.ci}
      onSave={onExist}>
      <Input
        label="Carnet de identidad"
        keyboardType="numeric"
        maxLength={10}
        name="ci"
        value={formState?.ci}
        error={errors}
        required={true}
        onChange={(value: any) => handleChange('ci', value)}
        // onBlur={() => onExist()}
        disabled={formState?.ciDisabled}
      />
    </Modal>
  );
};

export default ExistVisitModal;