import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {cssVar} from '../../styles/themes';

type ScaleProps = {
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  title?: string;
  description?: string;
  value: any;
};

const Scale: React.FC<ScaleProps> = ({
  min,
  max,
  onValueChange,
  minLabel,
  maxLabel,
  title = '',
  description = '',
  value = null,
}) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(value);

  useEffect(() => {
    setSelectedValue(value); // Actualiza cuando cambia `value`
  }, [value]);

  const handlePress = (value: number) => {
    setSelectedValue(value);
    onValueChange(value);
  };

  // Reset selected value when relevant props change
  // useEffect(() => {
  //   setSelectedValue(null);
  // }, [min, max, minLabel, maxLabel, title, description]);
  // console.log(selectedValue);

  return (
    <View style={styles.container}>
      {/* Título */}
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Etiquetas mín/máx */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{minLabel}</Text>
        <Text style={styles.label}>{maxLabel}</Text>
      </View>

      {/* Escala */}
      <View style={styles.scaleContainer}>
        {/* Números */}
        {Array.from({length: max - min + 1}, (_, i) => i + min).map(value => (
          <View key={value} style={styles.itemContainer}>
            <TouchableOpacity
              style={[
                styles.circle,
                selectedValue === value && styles.selectedCircle,
              ]}
              onPress={() => handlePress(value)}
              activeOpacity={0.8}
            />
            <Text
              style={[
                styles.numberLabel,
                selectedValue === value && styles.selectedLabel,
              ]}>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cssVar.cWhite,
    textAlign: 'left',
  },
  description: {
    fontSize: 14,
    color: cssVar.cBlackV2,
    textAlign: 'left',
    marginVertical: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: cssVar.cBlackV2,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    paddingHorizontal: cssVar.spXs,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cssVar.cWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: cssVar.cSuccess,
    borderWidth: 0,
    transform: [{scale: 1.2}],
  },
  numberLabel: {
    marginTop: 8,
    fontSize: 12,
    color: cssVar.cBlackV2,
  },
  selectedLabel: {
    color: cssVar.cSuccess,
    fontWeight: 'bold',
  },
});

export default Scale;
