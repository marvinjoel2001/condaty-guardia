import {StyleSheet, Text, View} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import React, {useState} from 'react';
import useAuth from '../../../mk/hooks/useAuth';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {useNavigation} from '@react-navigation/native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconGenericQr, IconNoQr} from '../../icons/IconLibrary';
import DropdawnAccess from './DropdawnAccess/DropdawnAccess';
import CameraQr from './CameraQr/CameraQr';

const Home = () => {
  const [formstate, setFormState]: any = useState({});
  const navigate: any = useNavigation();
  const {logout, user} = useAuth();
  const [openCamera, setOpenCamera] = useState(false);
  const [openCiNom, setOpenCiNom] = useState(false);

  const customTitle = () => {
    return (
      <View>
        <Avatar
          h={48}
          w={48}
          src={getUrlImages(
            '/GUARD-' + user?.id + '.webp?d=' + user?.updated_at,
          )}
          onClick={() => navigate.navigate('Profile')}
          name={getFullName(user)}
        />
        <Text style={styles.title}>{getFullName(user)}</Text>
        <Text style={styles.client}>
          {user.client_id
            ? user.clients.find((e: any) => e.id == user.client_id).name
            : null}
        </Text>
      </View>
    );
  };
  return (
    <>
      <Layout title="Home" style={{flex: 1}} customTitle={customTitle()}>
        {openCamera && (
          <CameraQr open={openCamera} onClose={() => setOpenCamera(false)} />
        )}
      </Layout>
      <DropdawnAccess
        onPressQr={() => setOpenCamera(true)}
        onPressCiNom={() => {}}
      />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  title: {
    color: cssVar.cWhite,
    textAlign: 'center',
  },
  client: {
    color: cssVar.cWhiteV2,
    textAlign: 'center',
  },
});
