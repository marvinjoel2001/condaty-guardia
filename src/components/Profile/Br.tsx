import React from 'react';
import {StyleSheet, View} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';
type TypeProps = {
  marginV?: number;
};
const Br = ({marginV = 8}: TypeProps) => {
  return <View style={[styles.container, {marginVertical: marginV}]}></View>;
};

export default Br;
const styles = StyleSheet.create({
  container: {
    height: 0.5,
    backgroundColor: cssVar.cWhiteV1,
    width: '100%',
  },
});
