import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { cssVar, FONTS } from '../../../styles/themes';

interface CarouselProps {
  title?: string;
  data: any[];
  renderItem: (item: any, isSelected: boolean) => React.ReactNode;
  onSelectItem: (item: any) => void;  
}

const Carousel = ({ title, data, renderItem, onSelectItem }: CarouselProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
   
    if (!selectedId && data && data.length > 0) {
      setSelectedId(data[0].id);
      onSelectItem(data[0]); 
    }
  }, [data, selectedId, onSelectItem]);

  const handlePress = (item: any) => {
    if (selectedId !== item.id) {
      setSelectedId(item.id); 
      onSelectItem(item);  

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }), 
        Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }), 
      ]).start();
    }
  };

  const renderCarouselItem = ({ item }: any) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
        <Animated.View
          style={[
            theme.item,
            isSelected ? theme.selectedItem : null,
            { transform: [{ scale: isSelected ? scaleAnim : 1 }] },
          ]}
        >
          {renderItem(item, isSelected)} 
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ height: 250 }}>
      {title && <Text style={theme.title}>{title}</Text>}
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCarouselItem}
        contentContainerStyle={theme.carousel}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default Carousel;

const theme = StyleSheet.create({
  title: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    textAlign: 'left',
    fontSize: cssVar.sXxl,
  },
  carousel: {
    alignItems: 'center',
    paddingHorizontal: cssVar.spXl,
    paddingLeft: cssVar.spXl,
  },
  item: {
    width: 140,
    height: 138,
    marginHorizontal: 20,
    backgroundColor: cssVar.cBlack,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: cssVar.cHover,
    borderColor: cssVar.cWhiteV1,
    borderWidth: 1,
  },
});
