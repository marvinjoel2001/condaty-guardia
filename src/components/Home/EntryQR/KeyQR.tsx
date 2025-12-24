import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import { getFullName, getUrlImages } from '../../../../mk/utils/strings';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import { TextArea } from '../../../../mk/components/forms/TextArea/TextArea';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import Input from '../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import useApi from '../../../../mk/hooks/useApi';
import { AccompaniedAdd } from './AccompaniedAdd';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { IconSimpleAdd, IconX } from '../../../icons/IconLibrary';
import List from '../../../../mk/components/ui/List/List';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import ExistVisitModal from '../CiNomModal/ExistVisitModal';
import SectionIncomeType from '../CiNomModal/SectionIncomeType';

type PropsType = {
  formState: any;
  setFormState: Function;
  handleChange: Function;
  data: any;
  errors: any;
  setTab?: any;
  setErrors: any;
  tab?: any;
};
const KeyQR = ({
  formState,
  setFormState,
  handleChange,
  data,
  errors,
  setTab,
  setErrors,
  tab,
}: PropsType) => {
  const [details, setDetails] = useState<TypeDetails>({
    data: [],
  });
  const [formStateA, setFormStateA] = useState({});
  const { execute } = useApi();
  const [openAcom, setOpenAcom] = useState(false);
  const [openExistVisit, setOpenExistVisit] = useState(false);

  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    data.push({
      l: 'Propietario:',
      v: getFullName(item.invitation),
    });
    data.push({
      l: 'Estado:',
      v: item.invitation?.status === 'A' ? 'LLAVE VALIDA' : 'LLAVE NO VALIDA',
      sv: {
        color:
          item.invitation?.status !== 'A' ? cssVar.cError : cssVar.cSuccess,
        marginBottom: 3,
      },
    });
    data.push({
      l: 'CI:',
      v: item.invitation?.ci,
    });
    {
      item.invitation?.dpto &&
        data.push({
          l: 'Dpto:',
          v: item.invitation?.dpto[0]?.nro || 'Sin unidad',
        });
    }
    {
      item.invitation?.phone &&
        data.push({
          l: 'Teléfono:',
          v: item.invitation?.phone,
        });
    }

    setDetails({ data: data });
  };

  useEffect(() => {
    _onDetail({ ...data });
  }, [data]);
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
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      }));
      return;
    }
    const { data: existData } = await execute('/visits', 'GET', {
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
        ci_anverso_taxi: existData.data.url_image_a,
        ci_reverso_taxi: existData.data.url_image_r,
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
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      }));
    }
  };
  const onDelAcom = (acom: { ci: string }) => {
    const acomps = formState?.acompanantes || [];
    const newAcomps = acomps.filter(
      (item: { ci: string }) => item.ci !== acom.ci,
    );
    setFormState({ ...formState, acompanantes: newAcomps });
  };
  const acompanantesList = (acompanante: any) => {
    if (!acompanante) return null;
    return (
      <ItemList
        title={getFullName(acompanante)}
        subtitle={'C.I. ' + (acompanante.ci || 'N/A')}
        subtitle2={
          acompanante.obs_in
            ? 'Observaciones de entrada: ' + acompanante.obs_in
            : ''
        }
        left={<Avatar name={getFullName(acompanante)} hasImage={0} />}
        right={
          <Text
            onPress={() => onDelAcom(acompanante)}
            style={{
              color: cssVar.cAccent,
              fontSize: 12,
              fontFamily: FONTS.semiBold,
            }}
          >
            Eliminar
          </Text>
        }
      />
    );
  };
  return (
    <View style={{ marginTop: 20 }}>
      {!data?.invitation || Object.keys(data?.invitation).length === 0 ? (
        <Text
          style={{
            textAlign: 'center',
            color: cssVar.cError,
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          Llave QR no encontrada o no válida.
        </Text>
      ) : (
        <>
          <Avatar
            hasImage={data?.invitation?.has_image}
            h={180}
            fontSize={44}
            w={180}
            name={getFullName(data?.invitation)}
            src={getUrlImages(
              '/OWNER-' +
                data?.invitation?.id +
                '.webp?d=' +
                data?.invitation?.updated_at,
            )}
          />
          {data?.hasArrears && (
            <View
              style={{
                backgroundColor: '#3a1c1c',
                borderRadius: 8,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 10,
                width: '100%',
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: cssVar.cError,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: cssVar.cError,
                    fontSize: 14,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  !
                </Text>
              </View>
              <Text
                style={{
                  color: '#ff6666',
                  fontSize: 16,
                  fontFamily: FONTS.regular,
                }}
              >
                Residente con Mora
              </Text>
            </View>
          )}
          <ItemInfo type="C" details={details} />

          <TouchableOpacity
            style={styles.boxAcompanante}
            onPress={() => setOpenExistVisit(true)}
          >
            <Icon name={IconSimpleAdd} size={16} color={cssVar.cAccent} />
            <Text
              style={{
                color: cssVar.cAccent,
                fontFamily: FONTS.semiBold,
              }}
            >
              Agregar acompañante
            </Text>
          </TouchableOpacity>
          {(formState?.acompanantes?.length || 0) > 0 && (
            <>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: FONTS.semiBold,
                  marginVertical: 4,
                  color: cssVar.cWhite,
                }}
              >
                Acompañantes:
              </Text>
              <List
                style={{ marginBottom: 12 }}
                data={formState?.acompanantes}
                renderItem={acompanantesList}
              />
            </>
          )}
          {/* <Text
            style={{
              fontFamily: FONTS.bold,
              color: cssVar.cWhite,
            }}>
            Tipo de ingreso
          </Text>
          <TabsButtons
            tabs={[
              {value: 'P', text: 'A pie'},
              {value: 'V', text: 'En vehículo'},
              {value: 'T', text: 'En taxi'},
            ]}
            sel={tab}
            setSel={setTab}
          />
          <View>
            {tab === 'V' && (
              <Input
                label="Placa del vehículo"
                type="text"
                name="plate"
                error={errors}
                required={tab === 'V'}
                value={formState?.plate || ''}
                onChange={(value: string) =>
                  handleChange('plate', value.toUpperCase())
                }
                autoCapitalize="characters"
              />
            )}
            {tab === 'T' && (
              <>
                <Text style={styles.subSectionTitle}>Datos del conductor</Text>
                <Input
                  label="Carnet de identidad"
                  name="ci_taxi"
                  keyboardType="numeric"
                  maxLength={10}
                  error={errors}
                  required
                  value={formState?.ci_taxi || ''}
                  onBlur={onExistTaxi}
                  onChange={(value: string) => handleChange('ci_taxi', value)}
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
                  name="plate"
                  error={errors}
                  required={tab === 'T'}
                  value={formState?.plate || ''}
                  onChange={(value: string) =>
                    handleChange('plate', value.toUpperCase())
                  }
                  autoCapitalize="characters"
                />
              </>
            )}
          </View> */}
          <SectionIncomeType
            tab={tab}
            handleChangeInput={handleChange}
            setTab={setTab}
            formState={formState}
            errors={errors}
            setErrors={setErrors}
            setFormState={setFormState}
          />
          {!data?.invitation?.access && (
            <TextArea
              label="Observaciones de entrada"
              placeholder="Ej: El residente está ingresando con 1 mascota y 2 bicicletas."
              name="obs_in"
              value={formState['obs_in']}
              onChange={value => handleChange('obs_in', value)}
            />
          )}
        </>
      )}
      {openExistVisit && (
        <ExistVisitModal
          open={openExistVisit}
          formState={formStateA}
          setFormState={setFormStateA}
          item={formState}
          setItem={setFormState}
          onClose={() => setOpenExistVisit(false)}
          setOpenNewAcomp={setOpenAcom}
        />
      )}
      {openAcom && (
        <AccompaniedAdd
          open={openAcom}
          onClose={() => {
            setOpenAcom(false);
          }}
          item={formState}
          setItem={setFormState}
          formState={formStateA}
          setFormState={setFormStateA}
        />
      )}
    </View>
  );
};

export default KeyQR;

const styles = StyleSheet.create({
  subSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhite,
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
