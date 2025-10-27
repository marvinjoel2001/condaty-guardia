import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {cssVar, FONTS} from '../../../mk/styles/themes';
interface Props {
  user: any;
  stop: any;
  setOpenDropdown?: any;
  theme: any;
}
const HeadDashboardTitle = ({user, stop, setOpenDropdown, theme}: Props) => {
  
  const navigation: any = useNavigation();
  if (!user) return null;
  return (
    <View style={styles?.container}>
      <Avatar
        hasImage={user?.has_image}
        onClick={() => {
          navigation.navigate('Profile');
        }}
        src={getUrlImages('/GUARD-' + user?.id + '.webp?d=' + user?.updated_at)}
        name={getFullName(user, 'NsLm')}
      />

      <View style={{width: 200}}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{...styles?.text}}>
          {getFullName(user)}
        </Text>
      </View>
      <Text style={{...styles?.label }}>
        {user.client_id
          ? user.clients.find((e: any) => e.id == user.client_id).name
          : null}
      </Text>
    </View>
  );
};

export default HeadDashboardTitle;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: cssVar.cWhiteV1,
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
  },
  text: {
    color: cssVar.cWhite,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    textAlign: 'center'
  },
});