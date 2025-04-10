import React from 'react';
import {Image, SafeAreaView, View} from 'react-native';

const Splash = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Image
        source={require('../../images/Splash.png')}
        resizeMode="contain"
        style={{width: '100%', height: '100%'}}
      />
    </SafeAreaView>
  );
};

export default Splash;
