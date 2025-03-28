import React, {useEffect, useState} from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import IndividualQR from './IndividualQR';
import GroupQR from './GroupQR';
import KeyQR from './KeyQR';
import useApi from '../../../../mk/hooks/useApi';
import useAuth from '../../../../mk/hooks/useAuth';
import {getUTCNow} from '../../../../mk/utils/dates';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
interface TypeProps {
  code: string;
  open: boolean;
  onClose: () => void;
  reload: any;
}

const EntryQR = ({code, open, onClose, reload}: TypeProps) => {
  const [formState, setFormState]: any = useState({});
  const [openSelected, setOpenSelected] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData]: any = useState([]);
  const {execute} = useApi();
  const {showToast} = useAuth();
  const type = code[2];
  const codeId: any = code[3];
  const handleChange = (key: string, value: any) => {
    setFormState({...formState, [key]: value});
  };

  const getOwner = async () => {
    const time: any = new Date();
    const ltime: any =
      time.getHours() + time.getDate() + time.getMonth() + time.getFullYear();
    const status =
      codeId.indexOf(ltime) > -1
        ? 'A'
        : codeId.indexOf(ltime - 4) > -1
        ? 'A'
        : 'X';
    let id = codeId.replace(ltime, '');
    id = id.replace(ltime - 4, '');

    const {data: QR} = await execute(
      '/owners',
      'GET',
      {
        searchBy: id,
        fullType: 'KEY',
      },
      false,
      3,
    );
    if (QR?.success == true) {
      setData({
        invitation: QR?.data[0],
        type: 'O',
        status,
      });
    }
  };
  const getInvitation = async () => {
    const {data: invitation, errors} = await execute(
      '/invitations',
      'GET',
      {
        perPage: -1,
        qr: type,
        searchBy: codeId,
        fullType: 'L',
      },
      false,
      3,
    );
    if (invitation?.success == true) {
      setData({...invitation?.data[0]});
    }
  };

  useEffect(() => {
    if (type === 'O') {
      getOwner();
    }
    if (type === 'I' || type === 'G') {
      getInvitation();
    }
  }, []);

  const onOut = async () => {
    const {data: In, error: err} = await execute(
      '/accesses/exit',
      'POST',
      {
        id: formState.access_id,
        obs_out: formState.obs_out,
      },
      false,
      3,
    );
    if (In?.success == true) {
      if (reload) reload();
      onClose();
      showToast('El visitante salió', 'success');
    } else {
      showToast(In.err, 'error');
    }
  };

  const validate = () => {
    let errors: any = {};
    if (type == 'I' || type == 'G') {
      errors = checkRules({
        value: formState.ci,
        rules: ['required'],
        key: 'ci',
        errors,
      });
      errors = checkRules({
        value: formState.name,
        rules: ['required'],
        key: 'name',
        errors,
      });
      errors = checkRules({
        value: formState.last_name,
        rules: ['required'],
        key: 'last_name',
        errors,
      });
      if (formState?.tab == 'V' || formState?.tab == 'T') {
        errors = checkRules({
          value: formState.plate,
          rules: ['required', 'plate'],
          key: 'plate',
          errors,
        });
        if (formState?.tab == 'T') {
          errors = checkRules({
            value: formState.ci_taxi,
            rules: ['required', 'ci'],
            key: 'ci_taxi',
            errors,
          });
          errors = checkRules({
            value: formState.name_taxi,
            rules: ['required'],
            key: 'name_taxi',
            errors,
          });
          errors = checkRules({
            value: formState.last_name_taxi,
            rules: ['required'],
            key: 'last_name_taxi',
            errors,
          });
        }
      }
    }
    setErrors(errors);
    return errors;
  };

  const onSaveAccess = async () => {
    let parms = {};
    if (type == 'O') {
      parms = {
        type: type,
        owner_id: data?.invitation?.id,
        begin_at: formState?.begin_at || getUTCNow(),
      };
    }
    if (type == 'I' || type == 'G') {
      parms = {
        type: type,
        invitation_id: data?.id,
        acompanantes: formState?.acompanantes || [],
        begin_at: formState?.begin_at || getUTCNow(),
        ci: formState?.ci,
        name: formState?.name,
        middle_name: formState?.middle_name,
        last_name: formState?.last_name,
        mother_last_name: formState?.mother_last_name,
        obs_in: formState?.obs_in,
        plate: formState?.plate,
        ci_taxi: formState?.ci_taxi,
        name_taxi: formState?.name_taxi,
        middle_name_taxi: formState?.middle_name_taxi,
        last_name_taxi: formState?.last_name_taxi,
        mother_last_name_taxi: formState?.mother_last_name_taxi,
        visit_id: formState?.visit_id,
      };
      if (hasErrors(validate())) {
        return;
      }
    }
    const {data: In, error: err} = await execute(
      '/accesses/enterqr',
      'POST',
      parms,
      false,
      3,
    );
    if (In?.success == true) {
      if (reload) reload();
      // if (formState.contactsSelectedOut?.length > 0) {
      //   showToast('El visitante salió', 'success');
      // } else {
      showToast('Registrado con éxito', 'success');
      // }
      setFormState({});
      onClose();
    } else {
      showToast(In.message, 'error');
      onClose();
    }
  };

  console.log(formState);
  return (
    <ModalFull
      title={
        type === 'I' ? 'QR individual' : type === 'G' ? 'QR grupal' : 'Llave QR'
      }
      open={open}
      onClose={onClose}
      onSave={() => {
        formState?.access_id ? onOut() : onSaveAccess();
      }}
      buttonCancel=""
      buttonText={!openSelected && type == 'G' ? '' : 'Continuar'}>
      {type === 'I' && (
        <IndividualQR
          setFormState={setFormState}
          formState={formState}
          handleChange={handleChange}
          data={data}
          errors={errors}
          setErrors={setErrors}
        />
      )}
      {type === 'G' && (
        <GroupQR
          setFormState={setFormState}
          formState={formState}
          handleChange={handleChange}
          data={data}
          errors={errors}
          setErrors={setErrors}
          setOpenSelected={setOpenSelected}
          openSelected={openSelected}
        />
      )}
      {type === 'O' && (
        <KeyQR
          setFormState={setFormState}
          formState={formState}
          handleChange={handleChange}
          data={data}
        />
      )}
    </ModalFull>
  );
};

export default EntryQR;
