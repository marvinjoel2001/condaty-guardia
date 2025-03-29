// DetPedidos.tsx
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import useApi from '../../../../mk/hooks/useApi';
import {getUTCNow} from '../../../../mk/utils/dates';
import {getFullName} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import LineDetail from '../Accesses/shares/LineDetail';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import {getAccessStatus} from '../../../../mk/utils/utils';
import Input from '../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {IconX} from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {AccompaniedAdd} from '../EntryQR/AccompaniedAdd';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';

const DetOrders = ({id, open, close, reload}: any) => {
  const {execute} = useApi();
  const [data, setData]: any = useState(null);
  const [formState, setFormState]: any = useState({});
  // const [acompanSelect, setAcompSelect]: any = useState([]); // Si en pedidos hay acompañantes
  const [openAcom, setOpenAcom] = useState(false);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('P');

  useEffect(() => {
    const getData = async (id: number) => {
      // Suponiendo que para pedidos usas otro endpoint (o envías type "P")
      const {data} = await execute('/others', 'GET', {
        fullType: 'DET',
        searchBy: id,
        section: 'HOME',
      });
      if (data.success) {
        // Si el pedido tiene algún atributo que lo redirija a otro registro, podrías hacer una recursión similar a accesses
        setData(data?.data?.length > 0 ? data?.data[0] : null);
      }
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  const getStatus = () => {
    if (!data?.access?.in_at) return 'Y';
    if (data?.access?.in_at && !data?.access?.out_at) return 'I';
    if (data?.access?.out_at) return 'C';
    return '';
  };

  const getButtonText = () => {
    const status = getStatus();
    const mapping: Record<string, string> = {
      I: 'Dejar salir',
      Y: 'Dejar entrar',
      // S: 'Esperando confirmación',
      C: 'Completado',
    };
    return mapping[status] || '';
  };

  const handleInputChange = (name: string, value: string) => {
    setFormState({...formState, [name]: value});
  };

  const validate = () => {
    let errors: any = {};

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
    if (formState?.tab == 'V') {
      errors = checkRules({
        value: formState.plate,
        rules: ['required', 'plate'],
        key: 'plate',
        errors,
      });
    }
    setErrors(errors);
    return errors;
  };
  const handleSave = async () => {
    const status = getStatus();
    if (status === 'I') {
      // if (acompanSelect.length === 0) {
      //   console.log(
      //     'Debe seleccionar al menos un acompañante para dejar salir',
      //   );
      //   return;
      // }
      // const ids = acompanSelect.map((item: any) => item.id);
      const {data: result, error} = await execute('/accesses/exit', 'POST', {
        ids: [data?.access_id],
        obs_out: formState?.obs_out || '',
      });
      if (result?.success) {
        reload();
        close();
      } else {
        console.log('Error al dejar salir:', error);
      }
    } else {
      if (hasErrors(validate())) {
        return;
      }
      // Acción: Dejar entrar
      const {data: result, error} = await execute(
        '/accesses',
        'POST',
        {
          begin_at: formState?.begin_at || getUTCNow(),
          pedido_id: data?.id,
          type: 'P',
          plate: formState?.plate,
          name: formState?.name,
          middle_name: formState?.middle_name,
          last_name: formState?.last_name,
          mother_last_name: formState?.mother_last_name,
          ci: formState?.ci,
          obs_in: formState?.obs_in,
          acompanantes: formState?.acompanantes,
        },
        false,
        3,
      );
      if (result?.success) {
        reload();
        close();
      } else {
        console.log('Error al dejar entrar:', error);
      }
    }
  };

  // Renderizamos el detalle del pedido
  const renderDetails = () => {
    const status = getStatus();
    return (
      <>
        <LineDetail label="Estado" value={getAccessStatus(data)} />
        <LineDetail
          label="Tipo de pedido"
          value={
            data?.type === 'P'
              ? 'Pedido-' + (data?.other?.otherType?.name || '')
              : 'Pedido'
          }
        />
        {/* Si es un pedido de Taxi, por ejemplo, podrías mostrar el nombre del conductor */}
        {data?.other?.otherType?.name === 'Taxi' && (
          <LineDetail label="Conductor" value={getFullName(data?.visit)} />
        )}
        {data?.plate && <LineDetail label="Placa" value={data?.plate} />}
        <LineDetail label="Entregó a" value={getFullName(data?.owner)} />
        {status === 'C' && data?.obs_confirm && (
          <>
            <LineDetail label="Observación" value={data?.obs_confirm} />
          </>
        )}
        {/* Puedes agregar más detalles según lo que necesites */}
      </>
    );
  };

  const onExist = async () => {
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci,
    });
    if (exist?.data) {
      setFormState({
        ...formState,
        ci: exist?.data.ci,
        name: exist?.data.name,
        middle_name: exist?.data.middle_name,
        last_name: exist?.data.last_name,
        mother_last_name: exist?.data.mother_last_name,
        plate: exist?.data.plate,
        disbled: true,
      });
    } else {
      setFormState({
        ...formState,
        name: '',
        last_name: '',
        middle_name: '',
        mother_last_name: '',
        plate: '',
        disbled: false,
      });
    }
  };

  const onDelAcom = (acom: any) => {
    const acomps = formState?.acompanantes;
    const newAcomps = acomps.filter((item: any) => item.ci !== acom.ci);
    setFormState({...formState, acompanantes: newAcomps});
  };
  const acompanantesList = (acompanante: any) => {
    return (
      <TouchableOpacity
      // onPress={() => handleEditAcompanante(acompanante.ci)}
      >
        <ItemList
          title={getFullName(acompanante)}
          subtitle={'C.I. ' + acompanante.ci}
          subtitle2={
            acompanante.obs_in
              ? 'Observaciones de entrada: ' + acompanante.obs_in
              : ''
          }
          left={<Avatar name={getFullName(acompanante)} />}
          right={
            <Icon
              name={IconX}
              color={cssVar.cWhiteV2}
              onPress={() => onDelAcom(acompanante)}
            />
          }
        />
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    setFormState({
      ...formState,
      tab: tab,
      plate: '',
      disbledTaxi: false,
    });
  }, [tab]);
  console.log(data);
  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Detalle de Pedido'}
      onSave={handleSave}
      buttonText={getButtonText()}>
      <View style={{marginVertical: 12}}>
        {!data ? (
          <Text style={{color: cssVar.cWhiteV2}}>Cargando...</Text>
        ) : (
          <>
            {renderDetails()}
            <View style={{marginTop: 12}}>
              {getStatus() === 'Y' && (
                <>
                  <Input
                    label="Carnet de identidad"
                    type="date"
                    name="ci"
                    required={true}
                    maxLength={10}
                    value={formState?.ci}
                    error={errors}
                    onChange={(value: any) => handleInputChange('ci', value)}
                    onBlur={() => onExist()}
                  />
                  <InputFullName
                    formState={formState}
                    errors={errors}
                    handleChangeInput={handleInputChange}
                    disabled={formState?.disbled}
                  />

                  <TextArea
                    label="Observaciones de Entrada"
                    name="obs_in"
                    value={formState?.obs_in || ''}
                    onChange={value => handleInputChange('obs_in', value)}
                  />
                  <TabsButtons
                    tabs={[
                      {value: 'P', text: 'A pie'},
                      {value: 'V', text: 'En vehículo'},
                    ]}
                    sel={tab}
                    setSel={setTab}
                  />

                  {tab === 'V' && (
                    <Input
                      label="Placa"
                      type="text"
                      required
                      name="plate"
                      error={errors}
                      // disabled={formState?.disbled}
                      value={formState['plate']}
                      onChange={(value: any) =>
                        handleInputChange('plate', value)
                      }
                    />
                  )}
                  <TouchableOpacity
                    style={{
                      alignSelf: 'flex-start',
                      marginVertical: 4,
                    }}
                    onPress={() => setOpenAcom(true)}>
                    <Text
                      style={{
                        color: cssVar.cWhite,
                        textDecorationLine: 'underline',
                      }}>
                      Agregar acompañante
                    </Text>
                  </TouchableOpacity>
                  {formState?.acompanantes?.length > 0 && (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: FONTS.semiBold,
                          marginVertical: 4,
                          color: cssVar.cWhiteV2,
                        }}>
                        Acompañantes:
                      </Text>
                      <List
                        data={formState?.acompanantes}
                        renderItem={acompanantesList}
                      />
                    </>
                  )}
                </>
              )}
              {getStatus() === 'I' && (
                <>
                  <ItemList
                    title={getFullName(data?.access?.visit)}
                    subtitle={'C.I.' + data?.access?.visit?.ci}
                    subtitle2={'Placa: ' + data?.access?.plate || 'A pie'}
                    left={<Avatar name={getFullName(data?.access?.visit)} />}
                  />
                  <TextArea
                    label="Observaciones de Salida"
                    name="obs_out"
                    value={formState?.obs_out || ''}
                    onChange={e => handleInputChange('obs_out', e)}
                  />
                </>
              )}
            </View>
          </>
        )}
      </View>
      <AccompaniedAdd
        open={openAcom}
        onClose={() => setOpenAcom(false)}
        item={formState}
        setItem={setFormState}
      />
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  // Puedes definir estilos propios para DetOrders
});

export default DetOrders;
