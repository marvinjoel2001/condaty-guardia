import React from 'react';
import {Text, View} from 'react-native';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import Input from '../../../../mk/components/forms/Input/Input';
import UploadFileV2 from '../../../../mk/components/forms/UploadFileV2';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import useApi from '../../../../mk/hooks/useApi';
import useAuth from '../../../../mk/hooks/useAuth';
interface SectionIncomeTypeProps {
  tab: any;
  handleChangeInput: any;
  setTab: (value: string) => void;
  formState: any;
  setFormState: any;
  setErrors: any;
  errors: any;
}

const SectionIncomeType = ({
  tab,
  handleChangeInput,
  setTab,
  formState,
  setFormState,
  setErrors,
  errors,
}: SectionIncomeTypeProps) => {
  const {execute} = useApi();
  const {showToast} = useAuth();

  const onExistTaxi = async () => {
    if (formState?.ci_taxi === '') {
      return;
    }
    if (formState?.ci_taxi == formState?.ci) {
      showToast('El ci del visitante y el taxi son iguales', 'error');
      setFormState({
        ...formState,
        ci_taxi: '',
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disabledTaxi: false,
      });
      return;
    }
    if (
      formState?.acompanantes?.find(
        (item: {ci: string}) => item.ci === formState?.ci_taxi,
      )
    ) {
      showToast('El ci del taxi ya está registrado como acompañante', 'error');
      setFormState({
        ...formState,
        ci_taxi: '',
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: '',
        disabledTaxi: false,
      });
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
        disabledTaxi: true,
        ci_anverso_taxi: existData?.data?.url_image_a,
        ci_reverso_taxi: existData?.data?.url_image_r,
      }));
    } else {
      setFormState((prevState: any) => ({
        ...prevState,
        name_taxi: '',
        last_name_taxi: '',
        middle_name_taxi: '',
        mother_last_name_taxi: '',
        plate: prevState.tab === 'T' ? '' : prevState.plate,
        disabledTaxi: false,
        ci_anverso_taxi: '',
        ci_reverso_taxi: '',
      }));
    }
  };

  //   const onExistTaxi = async () => {
  //     if (formState?.ci_taxi == formState?.ci) {
  //       return setErrors({errors, ci_taxi: 'El ci ya fue añadido'});
  //     }
  //     const {data: exist} = await execute('/visits', 'GET', {
  //       perPage: 1,
  //       page: 1,
  //       exist: '1',
  //       fullType: 'L',
  //       ci_visit: formState?.ci_taxi,
  //     });
  //     setErrors({errors, ci_taxi: ''});
  //     if (exist?.data) {
  //       setFormState({
  //         ...formState,
  //         ci_taxi: exist?.data.ci,
  //         name_taxi: exist?.data.name,
  //         middle_name_taxi: exist?.data.middle_name,
  //         last_name_taxi: exist?.data.last_name,
  //         mother_last_name_taxi: exist?.data.mother_last_name,
  //         plate: exist?.data.plate,
  //         disbledTaxi: true,
  //         ci_anverso_taxi: exist?.data.url_image_a,
  //         ci_reverso_taxi: exist?.data.url_image_r,
  //       });,
  //     } else {
  //       setFormState({
  //         ...formState,
  //         name_taxi: '',
  //         last_name_taxi: '',
  //         middle_name_taxi: '',
  //         mother_last_name_taxi: '',
  //         ci_anverso_taxi: '',
  //         ci_reverso_taxi: '',
  //         plate: '',
  //         disbledTaxi: false,
  //       });
  //     }
  //   };

  return (
    <>
      <Text
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
      {tab == 'V' && (
        <>
          <Input
            label="Placa"
            autoCapitalize="characters"
            type="text"
            name="plate"
            error={errors}
            required={tab == 'V'}
            value={formState['plate']}
            onChange={(value: any) => {
              handleChangeInput('plate', value);
            }}
          />
          <UploadFileV2
            variant="V2"
            style={{
              marginBottom: 12,
            }}
            setFormState={setFormState}
            formState={formState}
            label="Placa del vehículo"
            name="plate_vehicle"
            global
          />
        </>
      )}
      {tab == 'T' && (
        <>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 4,
              color: cssVar.cWhite,
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
            onBlur={() => onExistTaxi()}
            onChange={(value: any) => handleChangeInput('ci_taxi', value)}
          />

          <View style={{flexDirection: 'row', gap: 12}}>
            <UploadFileV2
              variant="V2"
              style={{
                marginBottom: 12,
              }}
              setFormState={setFormState}
              formState={formState}
              label="Carnet anverso taxi"
              name="ci_anverso_taxi"
              global
            />
            <UploadFileV2
              variant="V2"
              style={{
                marginBottom: 12,
              }}
              setFormState={setFormState}
              formState={formState}
              label="Carnet reverso taxi"
              name="ci_reverso_taxi"
              global
            />
          </View>
          <InputFullName
            formState={formState}
            errors={errors}
            handleChangeInput={handleChangeInput}
            disabled={formState?.disabledTaxi}
            prefijo={'_taxi'}
            inputGrid={true}
          />
          <Input
            label="Placa"
            autoCapitalize="characters"
            type="text"
            name="plate"
            error={errors}
            required={tab == 'T'}
            value={formState['plate']}
            onChange={(value: any) => handleChangeInput('plate', value)}
          />
          <UploadFileV2
            variant="V2"
            style={{
              marginBottom: 12,
            }}
            setFormState={setFormState}
            formState={formState}
            label="Placa del taxi"
            name="plate_vehicle"
            global
          />
        </>
      )}
    </>
  );
};

export default SectionIncomeType;
