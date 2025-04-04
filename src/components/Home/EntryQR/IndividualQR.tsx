import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import {getFullName} from '../../../../mk/utils/strings';
import {getDateStrMes, getDateTimeStrMes} from '../../../../mk/utils/dates';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Input from '../../../../mk/components/forms/Input/Input';
import useApi from '../../../../mk/hooks/useApi';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import {AccompaniedAdd} from './AccompaniedAdd';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconX} from '../../../icons/IconLibrary';
import List from '../../../../mk/components/ui/List/List';
import {onExist} from '../../../../mk/utils/dbtools';

type PropsType = {
  setFormState: any;
  formState: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
};
const IndividualQR = ({
  setFormState,
  formState,
  errors,
  setErrors,
  data,
  handleChange,
}: PropsType) => {
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const [openAcom, setOpenAcom] = useState(false);
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });
  const visit = data?.visit;
  const access = data?.access;
  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    const labelEstado =
      item?.status == 'A'
        ? 'Activo'
        : item?.status == 'X'
        ? 'Anulado'
        : item?.status == 'I'
        ? item?.access?.length > 0
          ? item?.access?.[0]?.out_at
            ? 'Usada ya no Valida'
            : 'Por salir'
          : ''
        : item?.access?.[0]?.out_at
        ? 'Completado'
        : '';
    // if (labelEstado == "") {
    //   showToast("Qr ya usado", "warning");
    //   if (onClose) onClose();
    //   return;
    // }
    data.push({
      l: 'Estado:',
      v: labelEstado,
      sv:
        item?.status == 'A'
          ? {color: cssVar.cSuccess}
          : item?.status == 'X'
          ? {color: cssVar.cError}
          : {color: cssVar.cWhiteV2},
    });
    data.push({
      v: getFullName(item?.owner),
      l: 'Residente:',
    });
    data.push({
      v: getDateStrMes(item?.date_event),
      l: 'Válido hasta:',
    });
    {
      item?.access?.[0]?.plate &&
        data.push({
          l: 'Placa:',
          v: item.access?.[0].plate,
        });
    }
    {
      item?.access?.length > 0 &&
        data.push({
          l: 'Entrada:',
          v: getDateTimeStrMes(item?.access?.[0].in_at),
        });
    }
    {
      item?.access?.[0]?.out_at &&
        data.push({
          l: ' Salida:',
          v: getDateTimeStrMes(item?.access?.[0]?.out_at),
        });
    }

    setDetails({data: data});
  };
  // console.log(data);
  useEffect(() => {
    _onDetail(data);
    setFormState({
      ...formState,
      ci: visit?.ci,
      name: visit?.name,
      middle_name: visit?.middle_name,
      last_name: visit?.last_name,
      mother_last_name: visit?.mother_last_name,
      access_id: access?.[0]?.id,
    });
  }, [data]);

  const onExistVisits = async () => {
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci,
    });
    if (exist?.data) {
      setErrors({
        ...errors,
        ci: 'Ya existe un registro de entrada para este CI',
      });
    } else {
      setErrors({...errors, ci: ''});
    }
  };
  useEffect(() => {
    setFormState({
      ...formState,
      tab: tab,
      ci_taxi: '',
      name_taxi: '',
      middle_name_taxi: '',
      last_name_taxi: '',
      mother_last_name_taxi: '',
      plate: '',
      disbledTaxi: false,
    });
  }, [tab]);

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

  const onExistTaxi = async () => {
    const {data: exist} = await execute('/visits', 'GET', {
      perPage: 1,
      page: 1,
      exist: '1',
      fullType: 'L',
      ci_visit: formState?.ci_taxi,
    });
    if (exist?.data) {
      setFormState({
        ...formState,
        ci_taxi: exist?.data.ci,
        name_taxi: exist?.data.name,
        middle_name_taxi: exist?.data.middle_name,
        last_name_taxi: exist?.data.last_name,
        mother_last_name_taxi: exist?.data.mother_last_name,
        plate: exist?.data.plate,
        disbledTaxi: true,
      });
    } else {
      setFormState({
        ...formState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disbledTaxi: false,
      });
    }
  };
  return (
    <>
      <View>
        <ItemInfo type="C" details={details} />
        <Text
          style={{
            fontSize: 16,
            fontFamily: FONTS.semiBold,
            marginBottom: 4,
            color: cssVar.cWhiteV2,
          }}>
          Invitado:
        </Text>
        <ItemList
          title={getFullName(visit)}
          left={<Avatar name={getFullName(visit)} />}
          subtitle={'CI:' + (visit?.ci || 'Sin registro')}
        />
        {!visit?.ci && data?.status !== 'X' && (
          <>
            <Input
              label="Carnet de identidad"
              type="date"
              name="ci"
              required={true}
              maxLength={10}
              value={formState?.ci}
              error={errors}
              onChange={(value: any) => handleChange('ci', value)}
              onBlur={() => onExistVisits()}
            />
            <InputFullName
              formState={formState}
              errors={errors}
              handleChangeInput={handleChange}
              inputGrid={false}
            />
          </>
        )}
        {data?.status != 'X' &&
          (!access?.[0]?.in_at ? (
            <TextArea
              label="Observaciones de entrada"
              placeholder="Ej: El visitante está ingresando con 1 mascota y 2 bicicletas."
              name="obs_in"
              value={formState?.obs_in}
              onChange={value => handleChange('obs_in', value)}
            />
          ) : (
            <TextArea
              label="Observaciones de salida"
              placeholder="Ej: El visitante está saliendo con 3 cajas de embalaje"
              name="obs_out"
              value={formState?.obs_out}
              onChange={value => handleChange('obs_out', value)}
            />
          ))}
        {!access?.[0]?.in_at && data?.status !== 'X' && (
          <TabsButtons
            tabs={[
              {value: 'P', text: 'A pie'},
              {value: 'V', text: 'En vehículo'},
              {value: 'T', text: 'En taxi'},
            ]}
            sel={tab}
            setSel={setTab}
          />
        )}
        {access?.length == 0 && (
          <>
            {tab == 'V' && (
              <Input
                label="Placa"
                type="text"
                name="plate"
                error={errors}
                required={tab == 'V'}
                value={formState['plate']}
                onChange={(value: any) => handleChange('plate', value)}
              />
            )}
            {tab == 'T' && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 4,
                    color: cssVar.cWhiteV2,
                  }}>
                  Datos del conductor:
                </Text>
                <Input
                  label="Carnet de identidad"
                  type="date"
                  name="ci_taxi"
                  maxLength={10}
                  error={errors}
                  required
                  value={formState?.ci_taxi}
                  onBlur={() => onExistTaxi()}
                  // onBlur={() => onCheckCI(true)}
                  onChange={(value: any) => handleChange('ci_taxi', value)}
                />
                <InputFullName
                  formState={formState}
                  errors={errors}
                  disabled={formState?.disbledTaxi}
                  prefijo="_taxi"
                  handleChangeInput={handleChange}
                />
                <Input
                  label="Placa"
                  type="text"
                  name="plate"
                  error={errors}
                  // disabled={formState?.disbledTaxi}
                  required={tab == 'T'}
                  value={formState['plate']}
                  onChange={(value: any) => handleChange('plate', value)}
                />
              </>
            )}
            {access?.length == 0 && data?.status != 'X' && (
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
            )}
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
      </View>
      <AccompaniedAdd
        open={openAcom}
        onClose={() => setOpenAcom(false)}
        item={formState}
        setItem={setFormState}
      />
    </>
  );
};

export default IndividualQR;
