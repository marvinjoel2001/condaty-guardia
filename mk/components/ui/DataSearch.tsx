import {CSSProperties, useEffect, useRef, useState} from 'react';
import {TextInput, View, Platform} from 'react-native';
import {Text} from 'react-native';
import Icon from './Icon/Icon';
import {IconSearch, IconX} from '../../../src/icons/IconLibrary';
import {cssVar, ThemeType, TypeStyles} from '../../styles/themes';
import Input from '../forms/Input/Input';
import ControlLabel from '../forms/ControlLabel/ControlLabel';
import React from 'react';
interface DataSearchProps {
  setSearch: (search: string) => void;
  name?: string;
  value?: string;
  msg?: string;
  style?: TypeStyles;
  iconLeft?: any;
  focus?: boolean;
}

const DataSearch = ({
  setSearch,
  name = '',
  value = '',
  msg = '',
  style = {},
  focus = false,
  iconLeft,
}: DataSearchProps) => {
  const [active, setActive] = useState(false);
  const [searchBy, setSearchBy] = useState('');
  const [oldSearch, setOldSearch] = useState('');

  const onSearch = (v: string | false = false) => {
    let s = searchBy.trim();
    if (v !== false) {
      s = v.trim();
      setSearchBy(s);
    }
    if (s === '') setActive(false);
    if (s === oldSearch) return;
    setActive(true);
    setSearch(s);
    setOldSearch(s);
  };

  useEffect(() => {
    setSearchBy(value);
  }, [name]);

  const iconRight = () => {
    return (
      <View
        style={{
          marginTop: 1,
        }}>
        {!searchBy && !value && (
          <Icon name={IconSearch} size={20} color={cssVar.cBlackV2} />
        )}
        {((searchBy && searchBy) || value !== '') && (
          <Icon
            name={IconX}
            size={20}
            color={cssVar.cBlackV2}
            onPress={() => onSearch('')}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{...theme.container, ...style}}>
      {iconLeft && searchBy == '' && (
        <View style={theme.iconLeft}>{iconLeft}</View>
      )}
      <TextInput
        testID={'__searchBasic' + name}
        id={'__searchBasic' + name}
        style={{
          ...theme.dataSearch,
          padding: Platform.OS == 'ios' ? 12 : 5,
          paddingLeft: iconLeft && searchBy == '' ? 30 : 10,
        }}
        autoFocus={focus}
        onFocus={() => setActive(true)}
        returnKeyType="search"
        onBlur={() => setActive(false)}
        onChangeText={(e: string) => setSearchBy(e)}
        value={searchBy}
        placeholder="Buscar..."
        placeholderTextColor={cssVar.cBlackV2}
        onSubmitEditing={() => onSearch()}
      />
      <View style={theme.iconRight}>{iconRight()}</View>

      {/* {value !== '' && <Text style={theme.text}>{value}</Text>} */}
    </View>
  );
};

export default DataSearch;

const theme: ThemeType = {
  container: {
    position: 'relative',
  },
  dataSearch: {
    color: cssVar.cWhite,
    backgroundColor: 'transparent',
    borderRadius: cssVar.bRadiusS,
    borderWidth: 1,
    borderColor: cssVar.cBlackV2,
    marginBottom: cssVar.spS,
    fontSize: cssVar.sS,
  },
  iconLeft: {
    position: 'absolute',
    left: 6,
    top: 9,
    zIndex: 1000,
  },
  iconRight: {
    position: 'absolute',
    right: 6,
    top: 9,
  },
  text: {
    fontSize: cssVar.sXs,
    // position: 'absolute',
    color: cssVar.cWhite,
    // bottom: -12,
  },
};
