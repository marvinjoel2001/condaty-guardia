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
}

const TabsButtons = ({sel, tabs, setSel, style = {}}: TabsButtonsProps) => {
  return (
    <View
      style={{
        width: '100%',
        ...style,
        marginVertical: 12,
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 8,
          flexGrow: tabs.length <= 4 ? 1 : 0,
        }}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setSel(tab.value)}
            style={{
              flex: tabs.length <= 4 ? 1 : 0,
            }}>
            <View
              style={{
                borderRadius: 8,
                paddingHorizontal: 18,
                paddingVertical: 8,
                backgroundColor: cssVar.cHoverBlackV2,
                ...(sel === tab.value
                  ? {
                      backgroundColor: cssVar.cFillSidebar,
                      borderWidth: 1,
                      borderColor: cssVar.cSidebar,
                    }
                  : {}),
              }}>
              <Text
                style={{
                  color: cssVar.cWhiteV1,
                  fontSize: 14,
                  fontFamily: FONTS.regular,
                  textAlign: 'center',
                  ...(sel === tab.value
                    ? {
                        color: cssVar.cWhite,
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
