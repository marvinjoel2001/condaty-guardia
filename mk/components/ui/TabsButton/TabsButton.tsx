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
        {tabs.map(tab => {
          const isActive = sel === tab.value;
          return (
            <TouchableOpacity key={tab.value} onPress={() => setSel(tab?.value)}>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: isActive ? 0.5 : 0,
                  borderColor: isActive ? cssVar.cSuccess : cssVar.cBlackV2,
                  backgroundColor: isActive ? 'rgba(36, 105, 80, 0.84)' : cssVar.cHoverBlackV2,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: isActive ? FONTS.bold : FONTS.regular,
                    color: isActive ? cssVar.cWhite : cssVar.cWhiteV1,
                    textAlign: 'center',
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
          );
        })}
      </ScrollView>
    </View>
  );
};
export default TabsButtons;