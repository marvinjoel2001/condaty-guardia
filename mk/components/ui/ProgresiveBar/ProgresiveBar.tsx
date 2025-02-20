import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {formatNumber} from '../../../utils/numbers';
import {cssVar} from '../../../styles/themes';

interface ProgresiveBarProps {
  total: number;
  actualValue: number;
  topLabels?: boolean;
  bottomLabels?: boolean;
  titleTotal?: string;
  titleActualValue?: string;
  style?: any;
}

const ProgresiveBar = ({
  topLabels,
  bottomLabels,
  total,
  actualValue,
  titleTotal,
  titleActualValue,
  style,
}: ProgresiveBarProps) => {
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
    <View style={{position: 'relative', ...style}}>
      {topLabels && (
        <View style={[styles.percentageLabels, {alignItems: 'center'}]}>
          <Text
            style={
              percentage < 15
                ? {width: `${percentage}%`, position: 'absolute', left: 4}
                : {
                    position: 'absolute',
                    marginRight: 4,
                    color: cssVar.cBlackV2,
                    width: `${percentage}%`,
                    right: 10,
                  }
            }>
            {titleActualValue}
          </Text>

          <Text style={styles.percentageLabelsText}>0</Text>
          <Text style={{...styles.percentageLabelsText, textAlign: 'center'}}>
            {formatNumber(total / 2, 0)}
          </Text>
          <Text style={{...styles.percentageLabelsText, textAlign: 'right'}}>
            {titleTotal} {formatNumber(total, 0)}
          </Text>
        </View>
      )}

      <View style={styles.progresiveBar}>
        <View style={[styles.barFill, {width: `${percentage}%`}]}>
          {percentage > 0 && <Text>{percentage} %</Text>}
        </View>
      </View>

      {bottomLabels && (
        <View style={styles.percentageLabels}>
          <Text style={styles.percentageLabelsText}>0%</Text>
          <Text style={{...styles.percentageLabelsText, textAlign: 'center'}}>
            50%
          </Text>
          <Text style={{...styles.percentageLabelsText, textAlign: 'right'}}>
            100%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  progresiveBar: {
    backgroundColor: cssVar.cBlackV3,
    width: '100%',
    height: cssVar.spXxl,
    borderRadius: cssVar.bRadiusL,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: cssVar.cAccent,
    height: '100%',
    borderRadius: cssVar.bRadiusL,
    justifyContent: 'center',
    alignItems: 'center',
    color: cssVar.cBlack,
  },
  percentageLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: cssVar.spXs,
    marginBottom: cssVar.spXs,
  },
  percentageLabelsText: {
    color: cssVar.cBlackV2,
    flex: 1,
  },
  lineBar: {
    color: cssVar.cBlackV2,
    borderLeftWidth: 1,
    borderLeftColor: cssVar.cSuccess,
    height: '100%',
    position: 'absolute',
    bottom: 20,
    zIndex: 10,
  },
});

export default ProgresiveBar;
