import React from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { cssVar } from '../../../styles/themes'

interface TabsArray {
  label: string;
  value: string;
}
interface CardsTabsButtonProps {
  tabsArr: TabsArray[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

const CardsTabsButton = ({tabsArr,selectedFilter,setSelectedFilter}:CardsTabsButtonProps) => {
    const CardFilter = ({label, isSelected, onPress}: any) => (
        <TouchableOpacity
          style={{
            marginHorizontal: cssVar.spXs,
            paddingHorizontal: cssVar.spL,
            paddingVertical: cssVar.spS,
            borderRadius: cssVar.bRadiusL,
            backgroundColor: isSelected ? cssVar.cWhite : cssVar.cHover,
          }}
          onPress={() => {
            onPress();
          }}>
          <Text
            style={{
              color: isSelected ? cssVar.cBlack : cssVar.cBlackV2,
            }}>
            {label}
          </Text>
        </TouchableOpacity>
      );
  return (
    <ScrollView
          style={{paddingLeft: cssVar.spM, paddingTop: cssVar.spS}}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {
          // [
          //   {label: 'Todas', value: 'T'},
          //   {label: 'No leídos', value: 'N'},
          // ]
          tabsArr.map(filter => (
            <CardFilter
              key={filter.value}
              label={filter.label}
              isSelected={selectedFilter === filter.value}
              onPress={() => setSelectedFilter(filter.value)}
            />
          ))}
        </ScrollView>
  )
}

export default CardsTabsButton