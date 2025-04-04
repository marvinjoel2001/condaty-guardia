import React from 'react';
import {Text, View} from 'react-native';
import Input from '../../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../../mk/components/forms/InputFullName/InputFullName';
import {cssVar, FONTS} from '../../../../../mk/styles/themes';
import TabsButtons from '../../../../../mk/components/ui/TabsButton/TabsButton';
import InputNameCi from './InputNameCi';

interface SelectTransportProps {
  typeSearch: string;
  setTypeSearch: (value: string) => void;
  tabs: any;
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
  tabs,
}: SelectTransportProps) => {
  // console.log(formState,'fsttttt')
  return (
    <View>
      <TabsButtons tabs={tabs} sel={typeSearch} setSel={setTypeSearch} />

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

              <InputNameCi
                formStateName={formState}
                formStateCi={formState.ci_taxi}
                handleChangeInput={handleChangeInput}
                errors={errors}
                prefix="_taxi"
                onCheckCI={onCheckCI}
                disabledCi={disabledFields}
                disabledName={disabledFields}
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
