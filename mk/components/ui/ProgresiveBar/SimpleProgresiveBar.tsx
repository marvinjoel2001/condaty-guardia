import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cssVar } from '../../../styles/themes';

interface SimpleProgressiveBarProps {
  total: number;
  actualValue: number;
  color: string;
  percentageNumber?: boolean;
  style?: any;
}

const SimpleProgressiveBar = ({ total, actualValue, color ,percentageNumber,style }: SimpleProgressiveBarProps) => {
  const [percentage, setPercentage] = useState<number | null>(null);

  const calcPercentage = () => {
    if (total === 0) return 0;
    const percentage = (actualValue / total) * 100;
    return Math.round(percentage * 10) / 10;
  };

  useEffect(() => {
    let percent = calcPercentage();
    setPercentage(percent);
  }, [total, actualValue]);

  if (percentage === null) return null;

  return (
    <View style={[styles.container,style ]}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]}>
        {percentageNumber && <Text style={styles.percentageText}>{percentage}%</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    width: '100%',
    backgroundColor:cssVar.cBlackV3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  percentageText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SimpleProgressiveBar;
