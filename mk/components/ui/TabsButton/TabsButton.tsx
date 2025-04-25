import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {cssVar, FONTS, TypeStyles} from '../../../styles/themes';

interface Tab {
  value: string;
  text: string;
  isNew?: boolean;
}

interface TabsButtonsProps {
  sel: string;
  tabs: Tab[];
  setSel: (value: string) => void;
  style?: TypeStyles;
  contentContainerStyles?: TypeStyles;
}

const TabsButtons = ({
  sel,
  tabs,
  setSel,
  style = {},
  contentContainerStyles = {},
}: TabsButtonsProps) => {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 8,
        ...style,
      }}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          ...contentContainerStyles,
        }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.value} onPress={() => setSel(tab?.value)}>
            <View
              style={{
                borderRadius: 18,
                paddingHorizontal: 18,
                paddingVertical: 6,
                backgroundColor: cssVar.cBlackV2,

                ...(sel === tab.value
                  ? {
                      backgroundColor: cssVar.cAccent,
                    }
                  : {}),
              }}>
              <Text
                style={{
                  color: cssVar.cWhiteV2,

                  fontSize: 14,
                  fontFamily: FONTS.medium,
                  ...(sel === tab.value
                    ? {
                        color: cssVar.cBlack,
                        fontFamily: FONTS.semiBold,
                      }
                    : {}),
                }}>
                {tab.text}
              </Text>
              {tab.isNew && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: cssVar.cError,
                    right: 8,
                    top: 4,
                    position: 'absolute',
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
export default TabsButtons;
