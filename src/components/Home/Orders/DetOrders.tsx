import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import useApi from '../../../../mk/hooks/useApi';
import {getDateTimeStrMes, getUTCNow} from '../../../../mk/utils/dates';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import Input from '../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import List from '../../../../mk/components/ui/List/List';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {IconX, IconAddMore, IconSimpleAdd} from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {AccompaniedAdd} from '../EntryQR/AccompaniedAdd';
import {checkRules, hasErrors} from '../../../../mk/utils/validate/Rules';
import ItemListDate from '../Accesses/shares/ItemListDate';
import Card from '../../../../mk/components/ui/Card/Card';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import Br from '../../Profile/Br';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import {AccompaniedAddV2} from '../EntryQR/AccompaniedAddV2';

const DetOrders = ({id, open, close, reload, handleChange}: any) => {
  const {execute} = useApi();
  const [data, setData]: any = useState(null);
  const [formState, setFormState]: any = useState({});
  const [openAcom, setOpenAcom] = useState(false);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('P');
  const [visit, setVisit]: any = useState({});

  useEffect(() => {
    const getData = async (id: number) => {
      const {data} = await execute('/others', 'GET', {
        fullType: 'DET',
        searchBy: id,
        section: 'HOME',
      });
      if (data.success) {
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
      Y: 'Registrar ingreso',
      // S: 'Esperando confirmación',
      C: '',
    };
    return mapping[status] || '';
  };

  const onExistTaxi = async () => {
    if (!formState?.ci_taxi || formState.ci_taxi.length < 5) {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: prevState.tab === 'T' ? '' : prevState.plate,
        disbledTaxi: false,
      }));
      return;
    }
    const {data: existData} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
    if (existData?.data) {
      setFormState((prevState: any) => ({
        ...prevState,
        ci_taxi: existData.data.ci,
        name_taxi: existData.data.name,
        middle_name_taxi: existData.data.middle_name,
        last_name_taxi: existData.data.last_name,
        mother_last_name_taxi: existData.data.mother_last_name,
        plate: existData.data.plate || '',
        disbledTaxi: true,
      }));
    } else {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: prevState.tab === 'T' ? '' : prevState.plate,
        disbledTaxi: false,
      }));
    }
  };
  const handleInputChange = (name: string, value: string) => {
    setFormState((prevState: any) => ({...prevState, [name]: value}));
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
      const {data: result, error} = await execute('/accesses/exit', 'POST', {
        ids: [data?.access_id],
        obs_out: formState?.obs_out || '',
      });
      if (result?.success) {
        if (reload) reload();
        close();
      } else {
        console.log('Error al dejar salir:', error);
      }
    } else {
      if (hasErrors(validate())) {
        return;
      }
      // Acción: Dejar entrar
      const {data: result, error} = await execute('/accesses', 'POST', {
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
      });
      if (result?.success) {
        if (reload) reload();
        close();
      } else {
        console.log('Error al dejar entrar:', error);
      }
    }
  };

  const renderDetails = () => {
    return (
      <Card>
        <Text style={styles.labelAccess}>Notificado Por</Text>
        <ItemList
          title={getFullName(data?.owner)}
          // subtitle={'C.I.' + data?.owner?.ci}
          subtitle={
            'Unidad: ' +
            data?.owner?.dpto?.[0]?.nro +
            ', ' +
            data?.owner?.dpto?.[0]?.description
          }
          left={
            <Avatar
              hasImage={data?.owner?.has_image}
              name={getFullName(data?.owner)}
              src={getUrlImages(
                '/OWNER-' +
                  data?.owner?.id +
                  '.webp?d=' +
                  data?.owner?.updated_at,
              )}
            />
          }
        />
        <KeyValue
          keys="Fecha de notificación"
          value={getDateTimeStrMes(data?.created_at, true)}
        />
        <KeyValue keys="Descripión" value={data?.descrip} />
      </Card>
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
      setVisit(exist?.data);
      setFormState({
        ...formState,
        ci: exist?.data.ci,
        name: exist?.data.name,
        middle_name: exist?.data.middle_name,
        last_name: exist?.data.last_name,
        mother_last_name: exist?.data.mother_last_name,
        plate: exist?.data.vehicle?.plate,
        disbled: true,
      });
    } else {
      setVisit({});
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
      <TouchableOpacity>
        <ItemList
          title={getFullName(acompanante)}
          subtitle={'C.I. ' + acompanante.ci}
          subtitle2={
            acompanante.obs_in
              ? 'Observaciones de entrada: ' + acompanante.obs_in
              : ''
          }
          left={<Avatar name={getFullName(acompanante)} hasImage={0} />}
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
    if (tab === 'P') {
      setFormState({
        ...formState,
        tab: tab,
        plate: '',
        disbledTaxi: false,
      });
    } else {
      setFormState({
        ...formState,
        tab: tab,
        plate: visit?.vehicle?.plate || '',
        disbledTaxi: true,
      });
    }
  }, [tab]);
  // console.log(data);
  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Pedido' + '/' + data?.other_type?.name}
      onSave={handleSave}
      buttonText={getButtonText()}>
      {!data ? (
        <Loading />
      ) : (
        <>
          {renderDetails()}
          <View style={{marginTop: 12}}>
            {getStatus() === 'C' && (
              <>
                <ItemList
                  title={getFullName(data?.access?.visit)}
                  subtitle={'C.I.' + data?.access?.visit?.ci}
                  left={
                    <Avatar
                      name={getFullName(data?.access?.visit)}
                      hasImage={0}
                    />
                  }>
                  <ItemListDate
                    inDate={data?.access?.in_at}
                    outDate={data?.access?.out_at}
                  />
                </ItemList>
              </>
            )}
            {getStatus() === 'Y' && (
              <>
                <Input
                  label="Carnet del visitante"
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
                  inputGrid={true}
                />

                <TouchableOpacity
                  style={styles.boxAcompanante}
                  onPress={() => setOpenAcom(true)}>
                  <Icon name={IconSimpleAdd} size={16} color={cssVar.cAccent} />
                  <Text
                    style={{
                      color: cssVar.cAccent,
                      fontFamily: FONTS.semiBold,
                    }}>
                    Agregar acompañante
                  </Text>
                </TouchableOpacity>
                {formState?.acompanantes?.length > 0 && (
                  <>
                    <List
                      data={formState?.acompanantes}
                      renderItem={acompanantesList}
                    />
                  </>
                )}
                <TabsButtons
                  tabs={[
                    {value: 'P', text: 'A pie'},
                    {value: 'V', text: 'En vehículo'},
                    // {value: 'T', text: 'En Taxi'},
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
                    onChange={(value: any) => handleInputChange('plate', value)}
                  />
                )}
                {tab === 'T' && (
                  <>
                    <Text style={styles.subSectionTitle}>
                      Datos del conductor del taxi:
                    </Text>
                    <Input
                      label="Carnet de identidad (Taxista)"
                      name="ci_taxi"
                      keyboardType="numeric"
                      maxLength={10}
                      error={errors}
                      required
                      value={formState?.ci_taxi || ''}
                      onBlur={onExistTaxi}
                      onChange={(value: string) =>
                        handleChange('ci_taxi', value)
                      }
                    />
                    <InputFullName
                      formState={formState}
                      errors={errors}
                      disabled={formState?.disbledTaxi}
                      prefijo="_taxi"
                      handleChangeInput={handleChange}
                      inputGrid={true}
                    />
                    <Input
                      label="Placa del taxi"
                      type="text"
                      name="plate" // Taxi usa 'plate' como en la versión antigua
                      error={errors} // Error para 'plate'
                      required={tab === 'T'}
                      value={formState?.plate || ''} // Valor de 'plate'
                      onChange={(value: string) =>
                        handleChange('plate', value.toUpperCase())
                      }
                      autoCapitalize="characters"
                    />
                  </>
                )}
              </>
            )}
            {getStatus() === 'Y' && (
              <>
                <TextArea
                  label="Observaciones"
                  name="obs_out"
                  value={
                    getStatus() === 'I'
                      ? formState?.obs_out || ''
                      : formState?.obs_in || ''
                  }
                  onChange={e =>
                    handleInputChange(
                      getStatus() === 'I' ? 'obs_out' : 'obs_in',
                      e,
                    )
                  }
                  placeholder="Ej: El visitante está ingresando con 2 mascotas"
                />
              </>
            )}
          </View>
        </>
      )}
      <AccompaniedAddV2
        open={openAcom}
        onClose={() => setOpenAcom(false)}
        item={formState}
        setItem={setFormState}
      />
    </ModalFull>
  );
};

export default DetOrders;

const styles = StyleSheet.create({
  label: {
    color: cssVar.cWhiteV1,
    fontSize: 12,
    fontFamily: FONTS.light,
  },
  labelAccess: {
    color: cssVar.cWhite,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhiteV1 || '#D0D0D0',
    marginBottom: 12,
  },
  boxAcompanante: {
    marginBottom: cssVar.sS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    marginTop: 12,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 12,
    borderColor: '#505050',
    backgroundColor: 'rgba(51, 53, 54, 0.20)',
  },
});
