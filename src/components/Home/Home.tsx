import {StyleSheet, Text, View} from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import React, {useContext, useState} from 'react';
import useAuth from '../../../mk/hooks/useAuth';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {useNavigation} from '@react-navigation/native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconGenericQr, IconNoQr} from '../../icons/IconLibrary';
import DropdawnAccess from './DropdawnAccess/DropdawnAccess';
import CameraQr from './CameraQr/CameraQr';
import HeadDashboardTitle from '../HeadDashboardTitle/HeadDashboardTitle';
import { ThemeContext } from '../../../mk/contexts/ThemeContext';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';

const Home = () => {
  const [formstate, setFormState]: any = useState({});
  const [openSlide, setOpenSlide] = useState(true);
  const [typeSearch, setTypeSearch] = useState("I");
  const navigate: any = useNavigation();
  const {logout, user} = useAuth();
  const [openCamera, setOpenCamera] = useState(false);
  const [openCiNom, setOpenCiNom] = useState(false);
  const [setOpenDropdown] = useState(false);
  let stop = false;
  const {theme} = useContext(ThemeContext);
  const customTitle = () => {
    return (
      <View>
       <HeadDashboardTitle
            user={user}
            setOpenDropdown={setOpenDropdown}
            stop={stop}
            theme={theme}
          />
      </View>
    );
  };
  return (
    <>
    <Layout title="Home" customTitle={customTitle()}  style={openSlide ? {paddingBottom: 40} : {paddingBottom: 30}}>

          <TabsButtons
              tabs={[
                {value: "I", text: "Pendientes"},
                {value: "A", text: "Accesos"},
                {value: "P", text: "Pedidos"},
              ]}
              sel={typeSearch}
              setSel={setTypeSearch}
              contentContainerStyles={styles.contentContainerTab}
              style={{
                justifyContent: "center",
                flex: 1,
                alignContent: "center",
              }}
          
            />
        


        <Text>assa</Text>
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
  container: {
   flex:1,
   backgroundColor:'red',
   justifyContent: 'center',
   alignItems: 'center',
   display:'flex'
  },
contentContainerTab:{
  width: "100%",
  alignSelf: "center",
  justifyContent: "center",
},
  title: {
    color: cssVar.cWhite,
    textAlign: 'center',
  },
  client: {
    color: cssVar.cWhiteV2,
    textAlign: 'center',
  },
});
