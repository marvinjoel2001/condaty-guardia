import React, {useEffect, useRef, useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheckOff,
  IconCheckSquare,
} from '../../../../src/icons/IconLibrary';
import Input from '../Input/Input';
import Icon from '../../ui/Icon/Icon';
import {cssVar, FONTS, TypeStyles} from '../../../styles/themes';

interface SelectListProps {
  options?: Array<any> | Record<string, any> | any;
  readOnly?: boolean;
  disabled?: boolean;
  optionValue?: string;
  height?: number;
  value: any;
  optionLabel?: string | any;
  name: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  optionsDisabled?: Array<string>;
  error?: {[key: string]: string} | any;
  style?: TypeStyles;
  label?: string;
  search?: boolean;
  multiSelect?: boolean;
  filter?: boolean;
  isWidth?: number;
}

const Select = ({
  value,
  name,
  error = null,
  className = '',
  multiSelect = false,
  filter = false,
  options = [],
  optionLabel = 'name',
  optionValue = 'id',
  readOnly = false,
  disabled = false,
  required = false,
  placeholder = '',
  label = '',
  onBlur = () => {},
  onChange = (e: any) => {},
  isWidth = 100,
  style = {},
}: SelectListProps) => {
  const [selectValue, setSelectValue] = useState(
    value || (multiSelect ? [] : ''),
  );
  const [openOptions, setOpenOptions] = useState(false);
  const [selectedNames, setSelectedNames] = useState('');
  const [_options, setOptions] = useState<{[key: string]: any} | any[]>([]);
  const [search, setSearch] = useState('');
  const selectRef = useRef(null);

  const onChangeSearch = (value: string) => {
    setSearch(value);
    const filteredOptions = Array.isArray(options)
      ? options.filter((option: any) =>
          option[optionLabel].toLowerCase().includes(value.toLowerCase()),
        )
      : [];
    setOptions(filteredOptions);
  };

  useEffect(() => {
    setOptions(options);
    if (
      multiSelect &&
      Array.isArray(options) &&
      options.length > 0 &&
      Array.isArray(selectValue)
    ) {
      const selectedValues = options.filter((option: any) =>
        selectValue.includes(option.id),
      );
      const selectedDisplay =
        selectedValues.length > 2
          ? `${selectedValues.length} elementos seleccionados`
          : selectedValues.map((option: any) => option[optionLabel]).join(', ');
      setSelectedNames(selectedDisplay);
    }
  }, [selectValue, options]);

  const handleSelectClickElement = (element: any) => {
    setSelectValue(element);
    setOpenOptions(false);
    onChange({target: {name, value: element}});
  };

  const handleSelectMultiClickElement = (element: any) => {
    const selectedValues = Array.isArray(selectValue) ? [...selectValue] : [];
    const index = selectedValues.indexOf(element);
    if (index !== -1) {
      selectedValues.splice(index, 1);
    } else {
      selectedValues.push(element);
    }
    setSelectValue(selectedValues);
    onChange({target: {name, value: selectedValues}});
  };

  const handleSelectClickIcon = () => {
    setOpenOptions(!openOptions);
  };

  useEffect(() => {
    if (!multiSelect) {
      const valueText = Array.isArray(options)
        ? options.find((o: any) => o[optionValue] === value)
        : null;
      setSelectValue(valueText ? valueText[optionLabel] : '');
    }
  }, [value]);

  if (!options) return null;

  return (
    <View style={{...styles.select, width: `${isWidth}%`, ...style}}>
      <View ref={selectRef} pointerEvents={disabled ? 'none' : 'auto'}>
        <Input
          type={'text'}
          value={
            multiSelect
              ? selectedNames
              : Array.isArray(options)
              ? options.find((i: any) => i[optionValue] === value)?.[
                  optionLabel
                ] || ''
              : ''
          }
          onChange={onChange}
          readOnly={true}
          label={label}
          name={name}
          iconRight={
            <TouchableOpacity
              onPress={() => {
                if (!disabled) handleSelectClickIcon();
              }}
              style={{
                height: 58,
                width: 40,
                position: 'absolute',
                top: -16,
                right: 0,
                alignItems: 'flex-end',
                paddingTop: 15,
              }}>
              <Icon
                name={openOptions ? IconArrowUp : IconArrowDown}
                color={cssVar.cWhiteV1}
              />
            </TouchableOpacity>
          }
          placeholder={placeholder}
          required={required}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
        />
      </View>
      {openOptions && (
        <Modal
          transparent={true}
          animationType="none"
          visible={openOptions}
          onRequestClose={() => setOpenOptions(false)}>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setOpenOptions(false)}>
            <View
              style={[styles.modalContent, {maxHeight: filter ? 280 : 140}]}>
              {filter && (
                <TextInput
                  style={styles.search}
                  placeholderTextColor={cssVar.cWhiteV1}
                  value={search}
                  onChangeText={onChangeSearch}
                  placeholder={`Buscar ${placeholder || label}...`}
                />
              )}
              <ScrollView
                style={{flexGrow: 1}}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled">
                {Array.isArray(_options)
                  ? _options.map((option: any, key: number) => (
                      <TouchableOpacity
                        style={[
                          styles.option,
                          Array.isArray(selectValue)
                            ? selectValue.includes(option[optionValue])
                              ? styles.selected
                              : {}
                            : selectValue === option[optionValue]
                            ? styles.selected
                            : {},
                        ]}
                        key={option[optionValue] || key}
                        onPress={
                          !multiSelect
                            ? () =>
                                handleSelectClickElement(
                                  option[optionValue] || key,
                                )
                            : () =>
                                handleSelectMultiClickElement(
                                  option[optionValue] || key,
                                )
                        }>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: cssVar.spM,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={{color: cssVar.cWhite}}>
                            {option[optionLabel] || option.label}
                          </Text>
                          {multiSelect &&
                            (Array.isArray(selectValue) &&
                            selectValue.includes(option[optionValue]) ? (
                              <Icon
                                color={cssVar.cWhite}
                                name={IconCheckSquare}
                              />
                            ) : (
                              <Icon color={cssVar.cWhite} name={IconCheckOff} />
                            ))}
                        </View>
                      </TouchableOpacity>
                    ))
                  : Object.keys(_options).map((key: string) => (
                      <TouchableOpacity
                        key={key}
                        delayPressIn={0}
                        onPress={() =>
                          handleSelectClickElement(
                            _options[key][optionValue] || _options[key].label,
                          )
                        }>
                        <Text>
                          {_options[key][optionValue] || _options[key].label}
                        </Text>
                      </TouchableOpacity>
                    ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default Select;

const styles = StyleSheet.create({
  select: {
    // flex: 1,
    zIndex: 2,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: cssVar.cBlackV1,
    padding: 4,
    borderRadius: cssVar.bRadius,
    color: cssVar.cWhite,
  },
  option: {
    padding: cssVar.spS,
    color: cssVar.cWhite,
  },
  selected: {
    backgroundColor: cssVar.cBlackV2,
  },
  search: {
    color: cssVar.cWhite,
    borderBottomWidth: 0.5,
    borderColor: cssVar.cBlackV2,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    backgroundColor: cssVar.cBlackV1,
    paddingVertical: Platform.OS === 'ios' ? cssVar.spL : undefined,
    paddingHorizontal: cssVar.spM,
  },
});
