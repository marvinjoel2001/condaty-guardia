import {Text, Touchable, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import Card from '../Card/Card';
import {IconCheckSquare, IconCheckOff} from '../../../../src/icons/IconLibrary';
import Icon from '../Icon/Icon';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
// import ExpandableText from '../../../../src/components/ExpandableText';
import React from 'react';

interface PropsType {
  title?: string | any;
  subtitle?: any;
  subtitle2?: any;
  right?: any;
  left?: any;
  children?: any;
  date?: any;
  onPress?: () => void;
  style?: TypeStyles;
  widthMain?: any;
  check?: boolean | null;
  truncateSubtitle?: boolean;
  onPressTitle?: () => void;
  onLongPress?: () => void;
}

export const ItemList = (props: PropsType) => {
  const {
    title,
    subtitle,
    subtitle2,
    truncateSubtitle = false,
    right,
    left,
    children,
    date,
    style,
    onPressTitle,
    onLongPress,
    widthMain,
    check = null,
  } = props;

  return (
    <TouchableOpacity
      onPress={props.onPress ? props.onPress : onPressTitle}
      onLongPress={onLongPress ? () => onLongPress() : undefined}>
      <View
        style={{
          ...theme.itemList,
          // paddingHorizontal: 0,
          // borderRadius: 0,
          // marginBottom: 0,
          ...style,
        }}>
        <View style={theme.container}>
          {left && <View style={theme.left}>{left}</View>}
          <View
            style={{
              width: widthMain || 150,
              flexGrow: 1,
              overflow: 'hidden',
              flexWrap: 'nowrap',
            }}>
            <Text
              onPress={onPressTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={theme.title}>
              {title}
            </Text>
            {subtitle && (
              <Text
                ellipsizeMode={truncateSubtitle ? 'tail' : undefined}
                numberOfLines={truncateSubtitle ? 1 : undefined}
                style={theme.subtitle}>
                {subtitle}
              </Text>
            )}
            {subtitle2 && <Text style={theme.subtitle2}>{subtitle2}</Text>}
          </View>
          <View
            style={{
              ...theme.right,
              alignItems: check !== null ? 'center' : 'flex-end',
              flexDirection: check !== null ? 'row' : undefined,
            }}>
            {right}
            {check !== null ? (
              <Icon
                name={check ? IconCheckSquare : IconCheckOff}
                color={check ? cssVar.cAccent : 'transparent'}
                fillStroke={check ? undefined : cssVar.cWhiteV1}
                style={{alignItems: 'center', justifyContent: 'flex-end'}}
              />
            ) : null}
          </View>
        </View>
        {children && <View style={{}}>{children}</View>}
        {date && (
          <View style={theme.date}>
            {typeof date == 'string' ? (
              <Text style={theme.date}>{date}</Text>
            ) : (
              <Text>{date}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const theme: ThemeType = {
  itemList: {
    backgroundColor: cssVar.cWhiteV2,
    padding: 12,
    borderRadius: 12,
    // marginVertical: 4,
    marginBottom: 8,
  },
  container: {
    overflow: 'hidden',
    flexDirection: 'row',
    gap: cssVar.spS,
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontFamily: FONTS.medium,
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  title: {
    color: cssVar.cWhite,
    fontSize: cssVar.sM,
    fontFamily: FONTS.medium,
  },
  subtitle: {
    color: cssVar.cWhiteV1,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    textAlign: 'left',
  },
  subtitle2: {
    color: cssVar.cWhiteV1,
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
    textAlign: 'left',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    flexShrink: 1,
  },
  date: {
    alignItems: 'flex-end',
    textAlign: 'right',
    color: cssVar.cWhiteV1,
    paddingTop: cssVar.spXs,
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
  },
};
