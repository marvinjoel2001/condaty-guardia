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
  grow?: boolean;
  wrap?: boolean;
}

const TabsButtons = ({
  sel,
  tabs,
  setSel,
  style = {},
  grow = true,
  wrap = false,
}: TabsButtonsProps) => {
  const renderItem = (tab: Tab) => (
    <TouchableOpacity
      key={tab.value}
      onPress={() => setSel(tab.value)}
      style={{
        flex: grow ? 1 : 0,
      }}>
      <View
        style={{
          borderRadius: 8,
          // paddingHorizontal: 18,
          padding: 8,
          backgroundColor: cssVar.cHoverBlackV2,
          borderWidth: 0.5,
          borderColor: cssVar.cWhiteV1,
          ...(sel === tab.value
            ? {
                backgroundColor: cssVar.cHoverSuccess,

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
  );

  return (
    <View
      style={{
        width: '100%',
        ...style,
        marginVertical: 12,
      }}>
      {wrap ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
          {tabs.map(renderItem)}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            gap: 8,
            flexGrow: grow ? 1 : 0,
          }}>
          {tabs.map(renderItem)}
        </ScrollView>
      )}
    </View>
  );
};

export default TabsButtons;
