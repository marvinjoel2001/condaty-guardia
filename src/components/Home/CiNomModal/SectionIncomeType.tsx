import React, { useState, useEffect } from 'react';
import {Text, View, Keyboard, TouchableOpacity} from 'react-native';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import TabsButtons from '../../../../mk/components/ui/TabsButton/TabsButton';
import Input from '../../../../mk/components/forms/Input/Input';
import UploadFileV2 from '../../../../mk/components/forms/UploadFileV2';
import InputFullName from '../../../../mk/components/forms/InputFullName/InputFullName';
import useApi from '../../../../mk/hooks/useApi';
import useAuth from '../../../../mk/hooks/useAuth';
import ExistVisitModal from './ExistVisitModal';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { IconX } from '../../../icons/IconLibrary';
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
  const [openTaxiModal, setOpenTaxiModal] = useState(false);
  const [taxiFormState, setTaxiFormState] = useState({});

  useEffect(() => {
    if (tab === 'T' && !formState?.ci_taxi) {
      setOpenTaxiModal(true);
    }
  }, [tab, formState?.ci_taxi]);

  const handleClearTaxi = () => {
    setFormState((prev: any) => ({
      ...prev,
      ci_taxi: '',
      name_taxi: '',
      middle_name_taxi: '',
      last_name_taxi: '',
      mother_last_name_taxi: '',
      plate: '',
      ci_anverso_taxi: '',
      ci_reverso_taxi: '',
      disabledTaxi: false,
      disabledCI: false,
    }));
    setOpenTaxiModal(true);
  };
  return (
    <>
      <Text
        style={{
          fontFamily: FONTS.bold,
          color: cssVar.cWhite,
        }}
      >
        Tipo de ingreso
      </Text>
      <TabsButtons
        tabs={[
          { value: 'P', text: 'A pie' },
          { value: 'V', text: 'En vehículo' },
          { value: 'T', text: 'En taxi' },
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
      {tab == 'T' && formState?.ci_taxi && (
        <>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 4,
              color: cssVar.cWhite,
              fontFamily: FONTS.medium,
            }}
          >
            Datos del conductor:
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}>
              <Input
                label="Carnet de identidad"
                type="date"
                name="ci_taxi"
                required
                maxLength={10}
                error={errors}
                value={formState['ci_taxi']}
                disabled={formState?.disabledCI}
                onChange={(value: any) => handleChangeInput('ci_taxi', value)}
              />
            </View>
            <TouchableOpacity onPress={handleClearTaxi} style={{ paddingHorizontal: 5, marginTop: -10}}>
              <Icon name={IconX} size={20} color={cssVar.cAccent} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
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
              onUploadStateChange={isUploading => {
                // Si se sube un archivo, deshabilitar CI
                if (!isUploading && formState.ci_anverso_taxi) {
                  setFormState((prevState: any) => ({
                    ...prevState,
                    disabledCI: true,
                  }));
                } else if (!formState.ci_anverso_taxi) {
                  setFormState((prevState: any) => ({
                    ...prevState,
                    disabledCI: false,
                  }));
                }
              }}
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
              onUploadStateChange={isUploading => {
                // Si se sube un archivo, deshabilitar CI
                if (!isUploading && formState.ci_reverso_taxi) {
                  setFormState((prevState: any) => ({
                    ...prevState,
                    disabledCI: true,
                  }));
                } else if (!formState.ci_reverso_taxi) {
                  setFormState((prevState: any) => ({
                    ...prevState,
                    disabledCI: false,
                  }));
                }
              }}
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
      {openTaxiModal && (
        <ExistVisitModal
          open={openTaxiModal}
          formState={taxiFormState}
          setFormState={setTaxiFormState}
          item={formState}
          setItem={setFormState}
          onClose={() => setOpenTaxiModal(false)}
          setOpenNewAcomp={() => {}}
          type="taxi"
        />
      )}
    </>
  );
};

export default SectionIncomeType;