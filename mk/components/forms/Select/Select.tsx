import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  FlatList,
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
const PAGE_SIZE = 30; // cantidad de ítems por carga
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
  const [search, setSearch] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const selectRef = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options)) return options;
    if (!search || !filter) return options;

    return options.filter((option: any) =>
      option[optionLabel]?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search, filter, optionLabel]);

  const [visibleData, setVisibleData] = useState(
    filteredOptions.slice(0, PAGE_SIZE),
  );

  const selectedNames = useMemo(() => {
    if (
      !multiSelect ||
      !Array.isArray(options) ||
      !Array.isArray(selectValue)
    ) {
      return '';
    }

    const selectedValues = options.filter((option: any) =>
      selectValue.includes(option[optionValue]),
    );

    return selectedValues.length > 2
      ? `${selectedValues.length} elementos seleccionados`
      : selectedValues.map((option: any) => option[optionLabel]).join(', ');
  }, [selectValue, options, multiSelect, optionValue, optionLabel]);

  const displayValue = useMemo(() => {
    if (multiSelect) return selectedNames;

    if (!Array.isArray(options)) return '';

    const found = options.find((i: any) => i[optionValue] === value);
    return found?.[optionLabel] || '';
  }, [multiSelect, selectedNames, options, optionValue, value, optionLabel]);

  const onChangeSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const handleToggleModal = useCallback(() => {
    if (disabled) return;
    setOpenOptions(prev => !prev);
  }, [disabled]);

  const handleSelectClickElement = useCallback(
    (element: any) => {
      setSelectValue(element);
      setOpenOptions(false);
      onChange({target: {name, value: element}});
    },
    [name, onChange],
  );

  const handleSelectMultiClickElement = useCallback(
    (element: any) => {
      setSelectValue((prev: any) => {
        const selectedValues = Array.isArray(prev) ? [...prev] : [];
        const index = selectedValues.indexOf(element);

        const newValues =
          index !== -1
            ? selectedValues.filter((_, i) => i !== index)
            : [...selectedValues, element];

        onChange({target: {name, value: newValues}});
        return newValues;
      });
    },
    [name, onChange],
  );

  useEffect(() => {
    if (openOptions) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [openOptions, fadeAnim, scaleAnim]);
  useEffect(() => {
    setVisibleData(filteredOptions.slice(0, PAGE_SIZE));
  }, [filteredOptions]);

  const handleLoadMore = () => {
    if (visibleData.length < filteredOptions.length) {
      const nextItems = filteredOptions.slice(
        visibleData.length,
        visibleData.length + PAGE_SIZE,
      );
      setVisibleData((prev: any) => [...prev, ...nextItems]);
    }
  };
  const renderOption = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const isSelected = Array.isArray(selectValue)
        ? selectValue.includes(item[optionValue])
        : selectValue === item[optionValue];

      return (
        <TouchableOpacity
          style={[styles.option, isSelected && styles.selected]}
          key={item[optionValue] + index || index + 'options'}
          onPress={() =>
            multiSelect
              ? handleSelectMultiClickElement(item[optionValue])
              : handleSelectClickElement(item[optionValue])
          }>
          <View style={styles.optionContent}>
            <Text style={styles.optionText}>
              {item[optionLabel] || item.label}
            </Text>
            {multiSelect && (
              <Icon
                color={cssVar.cWhite}
                name={isSelected ? IconCheckSquare : IconCheckOff}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [
      selectValue,
      multiSelect,
      handleSelectClickElement,
      handleSelectMultiClickElement,
    ],
  );
  useEffect(() => {
    if (!openOptions) {
      setSearch('');
    }
  }, [openOptions]);

  if (!options) return null;

  return (
    <View style={{...styles.select, width: `${isWidth}%`, ...style}}>
      <TouchableOpacity
        ref={selectRef}
        onPress={() => {
          handleToggleModal();
        }}
        activeOpacity={0.7}
        style={{pointerEvents: disabled ? 'none' : 'auto'}}>
        <View pointerEvents="none">
          <Input
            type={'text'}
            value={displayValue}
            onChange={onChange}
            readOnly={true}
            label={label}
            name={name}
            iconRight={
              <TouchableOpacity
                onPress={handleToggleModal}
                style={styles.iconButton}>
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
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="none"
        visible={openOptions}
        onRequestClose={() => setOpenOptions(false)}
        statusBarTranslucent>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpenOptions(false)}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                overflow: 'visible',
                maxHeight: filter ? 280 : 140,
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <TouchableOpacity
              style={{
                flexGrow: 1,
                maxHeight: filter ? 260 : 140,
              }}
              activeOpacity={1}>
              {filter && (
                <TextInput
                  style={styles.search}
                  placeholderTextColor={cssVar.cWhiteV1}
                  value={search}
                  onChangeText={onChangeSearch}
                  placeholder={`Buscar ${placeholder || label}...`}
                  autoFocus={false}
                />
              )}
              <FlatList
                data={visibleData}
                renderItem={renderOption}
                keyExtractor={(item, index) =>
                  String(item[optionValue] ?? index) + index
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.4}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={15}
                windowSize={5}
                maxToRenderPerBatch={20}
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Select;

const styles = StyleSheet.create({
  select: {
    zIndex: 2,
    position: 'relative',
  },
  iconButton: {
    height: 58,
    width: 40,
    position: 'absolute',
    top: -16,
    right: 0,
    alignItems: 'flex-end',
    paddingTop: 15,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flexGrow: 1,
  },
  option: {
    padding: cssVar.spS,
  },
  selected: {
    backgroundColor: cssVar.cBlackV2,
  },
  optionContent: {
    flexDirection: 'row',
    gap: cssVar.spM,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    color: cssVar.cWhite,
    flex: 1,
  },
  search: {
    color: cssVar.cWhite,
    borderBottomWidth: 0.5,
    borderColor: cssVar.cBlackV2,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    backgroundColor: cssVar.cBlackV1,
    paddingVertical: Platform.OS === 'ios' ? cssVar.spL : cssVar.spM,
    paddingHorizontal: cssVar.spM,
    marginBottom: 4,
  },
});
