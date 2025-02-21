import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';

import {useContext} from 'react';
import {cssVar, FONTS, TypeStyles} from '../../../styles/themes';

interface Tab {
  value: string;
  text: string;
}

interface TabsButtonsProps {
  sel: string;
  tabs: Tab[];
  setSel: (value: string) => void;
  style?: TypeStyles;
}

const TabsButtons = ({sel, tabs, setSel, style = {}}: TabsButtonsProps) => {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 8,
        paddingLeft: 16,
        ...style,
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // contentContainerStyle={{
        //   gap: style.gap || theme.TabsButtons?.container.gap,
        //   backgroundColor: "red",
        //   flex: 1,
        // }}
        contentContainerStyle={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 8,
        }}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setSel(tab.value)}
            style={{}}>
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
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
export default TabsButtons;
