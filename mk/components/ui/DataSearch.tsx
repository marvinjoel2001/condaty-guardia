import {CSSProperties, useEffect, useRef, useState} from 'react';
import {TextInput, View, Platform} from 'react-native';
import {Text} from 'react-native';
import Icon from './Icon/Icon';
import {IconSearch, IconX} from '../../../src/icons/IconLibrary';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';
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
          <Icon name={IconSearch} size={20} color={cssVar.cWhiteV2} />
        )}
        {((searchBy && searchBy) || value !== '') && (
          <Icon
            name={IconX}
            size={20}
            color={cssVar.cWhiteV2}
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
        placeholderTextColor={cssVar.cWhiteV2}
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
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cBlackV2,
    borderRadius: cssVar.bRadiusS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    backgroundColor: cssVar.cBlackV2,
    color: cssVar.cWhite,
    paddingVertical: 16,
    paddingHorizontal: cssVar.spM,
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
    top: 14,
  },
  text: {
    fontSize: cssVar.sXs,
    // position: 'absolute',
    color: cssVar.cWhite,
    // bottom: -12,
  },
};
