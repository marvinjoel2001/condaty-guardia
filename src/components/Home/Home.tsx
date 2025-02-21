import {StyleSheet, Text, View} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import Input from '../../../mk/components/forms/Input/Input';
import React, {useState} from 'react';
import useAuth from '../../../mk/hooks/useAuth';
import Button from '../../../mk/components/forms/Button/Button';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {cssVar} from '../../../mk/styles/themes';
import {useNavigation} from '@react-navigation/native';

const Home = () => {
  const [formstate, setFormState]: any = useState({});
  const navigate: any = useNavigation();
  const {logout, user} = useAuth();

  const customTitle = () => {
    return (
      <View>
        <Avatar
          h={48}
          w={48}
          src={getUrlImages('/GUA-' + user?.id + '.png?d=' + user?.updated_at)}
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
    <Layout title="Home" customTitle={customTitle()}>
      <Button onPress={() => logout()}>Logout</Button>
      <Input
        name="value"
        value={formstate.value}
        label="Carnet de identidad"
        onChange={value => setFormState({value: value})}
      />
    </Layout>
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
