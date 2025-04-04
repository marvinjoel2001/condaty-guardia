import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import List from '../../../../mk/components/ui/List/List';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import {getDateStrMes} from '../../../../mk/utils/dates';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconArrowLeft, IconX} from '../../../icons/IconLibrary';
import Input from '../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import {AccompaniedAdd} from './AccompaniedAdd';
import useApi from '../../../../mk/hooks/useApi';
type PropsType = {
  setFormState: any;
  formState: any;
  openSelected: any;
  setOpenSelected: any;
  handleChange: any;
  data: any;
  errors: any;
  setErrors: any;
};
const GroupQR = ({
  setFormState,
  formState,
  handleChange,
  data,
  errors,
  setErrors,
  openSelected,
  setOpenSelected,
}: PropsType) => {
  const {execute} = useApi();
  const [tab, setTab] = useState('P');
  const [selectedVisit, setSelectedVisit]: any = useState(null);
  const [openAcom, setOpenAcom] = useState(false);
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });
  const visitList = (item: any) => {
    return (
      <ItemList
        onPress={() => {
          formState.acompanantes = [];
          setSelectedVisit(item);

          setFormState((prev: any) => ({
            ...prev,
            name: item.visit.name,
            middle_name: item.visit.middle_name,
            last_name: item.visit.last_name,
            mother_last_name: item.visit.mother_last_name,
            ci: item.visit.ci,
            visit_id: item.visit_id,
            access_id: item.access_id,
          }));
          if (data?.status !== 'X' && !item.access?.out_at) {
            setOpenSelected(true);
          }
        }}
        title={getFullName(item.visit) || getFullName(item)}
        subtitle={
          item.visit?.ci ? 'C.I. ' + item.visit?.ci : 'C.I. (Sin registrar)'
        }
        right={
          data?.status !== 'X' &&
          (item.status !== 'A' ? (
            item.access?.out_at ? (
              <Text style={{color: cssVar.cAccent, fontSize: 10}}>
                Completado
              </Text>
            ) : (
              <View
                style={{
                  backgroundColor: cssVar.cWhiteV2,
                  borderRadius: 100,

                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}>
                <Text
                  style={{
                    color: cssVar.cBlack,
                    fontWeight: '500',
                    fontSize: 8,
                  }}>
                  Dejar salir
                </Text>
              </View>
            )
          ) : (
            <View
              style={{
                backgroundColor: cssVar.cAccent,
                borderRadius: 100,
                alignItems: 'center',

                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
              <Text
                style={{
                  color: cssVar.cBlack,
                  fontWeight: '500',
                  fontSize: 8,
                }}>
                Dejar entrar
              </Text>
            </View>
          ))
        }
        left={<Avatar name={getFullName(item.visit)} style={{}} />}
      />
    );
  };

  const ingresados = () => {
    let ingreados = 0;
    data?.guests?.map((invitado: any) => invitado?.access && ingreados++);
    return ingreados;
  };
  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    const day = new Date().toISOString().split('T')[0];
    const fechaInvitacion = item?.date_event?.slice(0, -9);

    data.push({
      l: 'Evento:',
      v: item?.title,
    });
    data.push({
      l: 'Estado:',
      v:
        fechaInvitacion < day
          ? 'Vencido'
          : item?.status == 'A'
          ? 'Activa'
          : item?.status == 'X'
          ? 'Anulado'
          : item?.status == 'O' || formState.allout
          ? 'Evento Termino'
          : item?.status == 'I' && !formState.allout && 'Todos Ingresaron',
      sv: {
        color:
          fechaInvitacion < day
            ? cssVar.cWhiteV2
            : item?.status == 'A'
            ? cssVar.cAccent
            : item?.status == 'X'
            ? cssVar.cError
            : cssVar.cWhiteV2,
      },
    });
    data.push({
      l: 'Residente:',
      v: getFullName(item?.owner),
    });
    data.push({
      l: 'Válido hasta:',
      v: getDateStrMes(item?.date_event),
    });

    setDetails({data: data});
  };

  useEffect(() => {
    _onDetail(data);
  }, [data]);
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
        {!openSelected ? (
          <>
            <Text
              style={{
                fontFamily: FONTS.medium,
                color: cssVar.cWhite,
              }}>
              Cantidad de invitados ingresados: {ingresados()} /
              {data?.guests?.length}
            </Text>
            <ScrollView style={{height: 480}}>
              <List
                data={data?.guests}
                renderItem={visitList}
                // refreshing={!loaded}
              />
            </ScrollView>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                gap: 5,
                alignItems: 'center',
                marginBottom: 5,
              }}
              onPress={() => {
                setOpenSelected(false);
                // setTab('E');
              }}>
              <Icon name={IconArrowLeft} color={cssVar.cWhite} />
              <Text
                style={{
                  color: cssVar.cWhite,
                  fontWeight: '600',
                  fontFamily: FONTS.medium,
                }}>
                Volver a los invitados
              </Text>
            </TouchableOpacity>
            <ItemList
              title={getFullName(selectedVisit?.visit)}
              subtitle={
                selectedVisit?.visit.ci
                  ? 'C.I.' + selectedVisit?.visit.ci
                  : 'C.I. (Sin registrar)'
              }
              left={<Avatar name={getFullName(selectedVisit?.visit)} />}
            />
            {!selectedVisit?.visit?.ci && (
              <>
                <Input
                  label={'Carnet de identidad'}
                  name={'ci'}
                  maxLength={10}
                  keyboardType="number-pad"
                  value={formState.ci}
                  required
                  error={errors}
                  onChange={(value: any) => handleChange('ci', value)}
                  // onBlur={() => onCheckC(true)}
                />
                <InputFullName
                  formState={formState}
                  errors={errors}
                  handleChangeInput={handleChange}
                  inputGrid={false}
                />
              </>
            )}
            {!selectedVisit?.access?.in_at ? (
              <TextArea
                label="Observaciones de entrada"
                placeholder="Ej: El visitante está ingresando con 1 mascota y 2 bicicletas."
                name={'obs_in'}
                value={formState['obs_in']}
                onChange={value => handleChange('obs_in', value)}
              />
            ) : (
              <TextArea
                label="Observaciones de Salida"
                placeholder="Ej: El visitante está saliendo con 3 cajas de embalaje"
                name="obs_out"
                value={formState?.obs_out}
                onChange={value => handleChange('obs_out', value)}
              />
            )}
            {!selectedVisit?.access?.in_at && data?.status !== 'X' && (
              <>
                <TabsButtons
                  tabs={[
                    {value: 'P', text: 'A pie'},
                    {value: 'V', text: 'En vehículo'},
                    {value: 'T', text: 'En taxi'},
                  ]}
                  sel={tab}
                  setSel={setTab}
                />
                {tab == 'V' && (
                  <Input
                    label="Placa"
                    type="text"
                    name="plate"
                    error={errors}
                    required={tab == 'V'}
                    value={formState['plate']}
                    onChange={(value: any) => {
                      handleChange('plate', value);
                    }}
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
                        fontFamily: FONTS.medium,
                      }}>
                      Datos del conductor:
                    </Text>
                    <Input
                      label="Carnet de identidad"
                      type="date"
                      name="ci_taxi"
                      required
                      maxLength={10}
                      error={errors}
                      value={formState['ci_taxi']}
                      // onBlur={() => onCheckCI(true)}
                      onBlur={() => onExistTaxi()}
                      onChange={(value: any) => handleChange('ci_taxi', value)}
                    />
                    <InputFullName
                      formState={formState}
                      errors={errors}
                      handleChangeInput={handleChange}
                      disabled={formState?.disbledTaxi}
                      prefijo={'_taxi'}
                    />
                    <Input
                      label="Placa"
                      type="text"
                      name="plate"
                      error={errors}
                      required={tab == 'T'}
                      value={formState['plate']}
                      onChange={(value: any) => handleChange('plate', value)}
                    />
                  </>
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

export default GroupQR;
