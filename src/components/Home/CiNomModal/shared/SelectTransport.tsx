import React from 'react';
import {Text, View} from 'react-native';
import Input from '../../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../../mk/components/forms/InputFullName/InputFullName';
import {cssVar, FONTS} from '../../../../../mk/styles/themes';
import TabsButtons from '../../../../../mk/components/ui/TabsButton/TabsButton';

interface SelectTransportProps {
  typeSearch: string;
  setTypeSearch: (value: string) => void;
  formState: any;
  errors: any;
  handleChangeInput: (name: string, value: any) => void;
  onCheckCI?: (isTaxi?: boolean) => void;
  disabledFields?: boolean;
}

const SelectTransport = ({
  typeSearch,
  setTypeSearch,
  formState,
  errors,
  handleChangeInput,
  onCheckCI,
  disabledFields = false,
}: SelectTransportProps) => {
  return (
    <View>
      <TabsButtons
        tabs={[
          {value: 'P', text: 'A pie'},
          {value: 'V', text: 'En vehículo'},
          {value: 'T', text: 'En taxi'},
        ]}
        sel={typeSearch}
        setSel={setTypeSearch}
      />

      {!disabledFields && (
        <>
          {typeSearch === 'V' && (
            <Input
              label="Placa"
              type="text"
              name="plate"
              error={errors}
              required={typeSearch === 'V'}
              value={formState['plate']}
              onChange={(value: any) => handleChangeInput('plate', value)}
            />
          )}
          {typeSearch === 'T' && (
            <>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: FONTS.medium,
                  marginBottom: 4,
                  color: cssVar.cWhiteV1,
                }}>
                Datos del conductor:
              </Text>
              <Input
                label="Carnet de identidad"
                type="date"
                name="ci_taxi"
                error={errors}
                required={true}
                maxLength={10}
                value={formState['ci_taxi']}
                onBlur={() => onCheckCI && onCheckCI(true)}
                onChange={(value: any) => handleChangeInput('ci_taxi', value)}
              />
              <InputFullName
                formState={formState}
                errors={errors}
                handleChangeInput={handleChangeInput}
                prefijo="_taxi"
              />
              <Input
                label="Placa Taxi"
                type="text"
                name="plate"
                error={errors}
                required={typeSearch === 'T'}
                value={formState['plate']}
                onChange={(value: any) => handleChangeInput('plate', value)}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

export default SelectTransport;