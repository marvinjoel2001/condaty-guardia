import React from 'react';
import {StyleSheet, View} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';

const Br = () => {
  return <View style={styles.container}></View>;
};

export default Br;
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: cssVar.cWhiteV2,
    marginBottom: 5,
  },
});
