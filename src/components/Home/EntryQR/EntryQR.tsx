import React, {useEffect, useState} from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import IndividualQR from './IndividualQR';
import GroupQR from './GroupQR';
import KeyQR from './KeyQR';
import FrequentQR from './FrequentQR';
import useApi from '../../../../mk/hooks/useApi';
import useAuth from '../../../../mk/hooks/useAuth';
import {getUTCNow} from '../../../../mk/utils/dates';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import {Text, View} from 'react-native';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconAlert, IconX} from '../../../icons/IconLibrary';
import {cssVar, FONTS} from '../../../../mk/styles/themes';

interface TypeProps {
  code: string;
  open: boolean;
  onClose: () => void;
  reload: any;
}

const EntryQR = ({code, open, onClose, reload}: TypeProps) => {
  const [formState, setFormState]: any = useState({});
  const [openSelected, setOpenSelected]: any = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData]: any = useState(null);
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const {showToast, waiting} = useAuth();
  const [msgErrorQr, setMsgErrorQr] = useState('');
  const typeFromQr = code[2];
  const codeId: any = code[3];

  const handleChange = (key: string, value: any) => {
    setFormState((prevState: any) => ({...prevState, [key]: value}));
  };

  useEffect(() => {
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
      const {data: QR} = await execute('/owners', 'GET', {
        searchBy: id,
        fullType: 'KEY',
      });
      if (QR?.success && QR.data?.[0]) {
        setData({
          invitation: QR.data[0],
          type: 'O',
          status,
        });
      } else if (QR?.success && (!QR.data || QR.data.length === 0)) {
        setMsgErrorQr('Llave QR no encontrada o no válida.');
      } else {
        showToast(QR?.message || 'Error al consultar la llave QR.', 'error');
        onClose();
      }
    };

    const getInvitation = async () => {
      const {data: invitation} = await execute('/invitations', 'GET', {
        perPage: -1,
        qr: typeFromQr,
        searchBy: codeId,
        fullType: 'L',
      });
      if (invitation?.success && invitation.data?.[0]) {
        setData(invitation.data[0]);
      } else {
        setMsgErrorQr(invitation?.message || 'Invitación no encontrada.');
      }
    };

    if (open) {
      setData(null);
      setFormState({});
      if (typeFromQr === 'O') {
        getOwner();
      } else if (['I', 'G', 'F'].includes(typeFromQr)) {
        getInvitation();
      } else {
        setMsgErrorQr('Tipo de QR no reconocido.');
      }
    }
  }, [code, open]);

  useEffect(() => {
    if (data) {
      const currentVisit = data.visit;
      const lastAccessRecord =
        data.access && data.access.length > 0
          ? data.access[data.access.length - 1]
          : null;
      const visitorIsInside =
        lastAccessRecord && lastAccessRecord.in_at && !lastAccessRecord.out_at;

      setFormState((prevState: any) => ({
        ...prevState,
        ci: currentVisit?.ci || '',
        name: currentVisit?.name || '',
        middle_name: currentVisit?.middle_name || '',
        last_name: currentVisit?.last_name || '',
        mother_last_name: currentVisit?.mother_last_name || '',
        visit_id: currentVisit?.id || null,
        access_id: visitorIsInside ? lastAccessRecord.id : null,
        obs_in: visitorIsInside ? lastAccessRecord.obs_in : '',
        obs_out: '',
      }));
    }
  }, [data]);

  const onOut = async () => {
    const {data: In} = await execute('/accesses/exit', 'POST', {
      id: formState.access_id,
      obs_out: formState.obs_out,
    });
    if (In?.success) {
      if (reload) reload();
      onClose();
      showToast('El visitante salió', 'success');
    } else {
      showToast(In.message || 'Error al registrar la salida.', 'error');
    }
  };

  const validate = () => {
    let currentErrors: any = {};
    if (!data) return currentErrors;

    if (['I', 'G', 'F'].includes(data.type)) {
      currentErrors = checkRules({
        value: formState.ci,
        rules: ['required', 'ci'],
        key: 'ci',
        errors: currentErrors,
      });
      currentErrors = checkRules({
        value: formState.name,
        rules: ['required', 'alpha'],
        key: 'name',
        errors: currentErrors,
      });
      currentErrors = checkRules({
        value: formState.middle_name,
        rules: ['alpha'],
        key: 'middle_name',
        errors: currentErrors,
      });
      currentErrors = checkRules({
        value: formState.last_name,
        rules: ['required', 'alpha'],
        key: 'last_name',
        errors: currentErrors,
      });
      currentErrors = checkRules({
        value: formState.mother_last_name,
        rules: ['alpha'],
        key: 'mother_last_name',
        errors: currentErrors,
      });

      if (formState?.tab === 'V' || formState?.tab === 'T') {
        currentErrors = checkRules({
          value: formState.plate,
          rules: ['required', 'plate'],
          key: 'plate',
          errors: currentErrors,
        });
        if (formState?.tab === 'T') {
          currentErrors = checkRules({
            value: formState.ci_taxi,
            rules: ['required', 'ci'],
            key: 'ci_taxi',
            errors: currentErrors,
          });
          currentErrors = checkRules({
            value: formState.name_taxi,
            rules: ['required', 'alpha'],
            key: 'name_taxi',
            errors: currentErrors,
          });
          currentErrors = checkRules({
            value: formState.last_name_taxi,
            rules: ['required', 'alpha'],
            key: 'last_name_taxi',
            errors: currentErrors,
          });
        }
      }
    }
    setErrors(currentErrors);
    return currentErrors;
  };

  const onSaveAccess = async () => {
    if (!data) return;
    const validationErrors = validate();
    if (hasErrors(validationErrors)) {
      return;
    }

    let params = {};
    if (data.type === 'O') {
      params = {
        type: data.type,
        owner_id: data?.invitation?.id,
        begin_at: formState?.begin_at || getUTCNow(),
        acompanantes: formState?.acompanantes || [],
        obs_in: formState?.obs_in,
        plate: formState?.plate,
        ci_taxi: formState?.ci_taxi,
        name_taxi: formState?.name_taxi,
        middle_name_taxi: formState?.middle_name_taxi,
        last_name_taxi: formState?.last_name_taxi,
        mother_last_name_taxi: formState?.mother_last_name_taxi,
        visit_id: formState?.visit_id,
      };
    } else if (['I', 'G', 'F'].includes(data.type)) {
      params = {
        type: data.type,
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
    }

    const {data: In, error} = await execute(
      '/accesses/enterqr',
      'POST',
      params,
    );
    if (In?.success) {
      if (reload) reload();
      showToast(
        'Visita registrada y notificación enviada con éxito',
        'success',
      );
      setFormState({});
      onClose();
    } else {
      showToast(
        error?.data?.message || 'Error al registrar la entrada.',
        'error',
      );
      // onClose();
    }
  };

  const renderContent = () => {
    if (!data) {
      return <Loading />;
    }
    switch (data.type) {
      case 'I':
        return (
          <IndividualQR
            setFormState={setFormState}
            formState={formState}
            handleChange={handleChange}
            data={data}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 'G':
        return (
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
        );
      case 'F':
        return (
          <FrequentQR
            setFormState={setFormState}
            formState={formState}
            handleChange={handleChange}
            data={data}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 'O':
        return (
          <KeyQR
            setFormState={setFormState}
            formState={formState}
            handleChange={handleChange}
            data={data}
            errors={errors}
            tab={tab}
            setTab={setTab}
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    if (waiting > 0) return 'Cargando...';
    if (!data) return 'Error de invitación';
    switch (data.type) {
      case 'I':
        return 'QR Individual';
      case 'G':
        return 'QR Grupal';
      case 'F':
        return 'QR Frecuente';
      case 'O':
        return 'Llave QR';
      default:
        return 'Detalle de QR';
    }
  };

  const isExit = () => {
    if (data?.type == 'I') {
      const lastAccess =
        data?.access && data.access.length > 0
          ? data.access[data.access.length - 1]
          : null;
      return lastAccess && lastAccess.in_at && !lastAccess.out_at;
    }
    if (data?.type == 'G') {
      return data?.guests?.find((v: any) => v.id == openSelected?.id)?.access
        ?.in_at;
    }
  };

  const RenderErrorMsg = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 16,
        }}>
        <Icon name={IconAlert} size={80} color={cssVar.cWarning} />
        <Text
          style={{
            color: cssVar.cWhite,
            fontSize: 16,
            fontFamily: FONTS.semiBold,
            textAlign: 'center',
          }}>
          {msgErrorQr}
        </Text>
      </View>
    );
  };
  return (
    <ModalFull
      title={getModalTitle()}
      open={open}
      onClose={onClose}
      onSave={() => {
        isExit() ? onOut() : onSaveAccess();
      }}
      buttonCancel=""
      scrollViewHide={msgErrorQr ? true : false}
      buttonText={
        (!openSelected && data?.type === 'G') || data?.status === 'X'
          ? data?.type == 'O'
            ? 'Dejar ingresar'
            : ''
          : isExit()
          ? 'Registrar salida'
          : msgErrorQr
          ? ''
          : 'Dejar ingresar'
      }>
      {msgErrorQr ? <RenderErrorMsg /> : renderContent()}
    </ModalFull>
  );
};

export default EntryQR;
