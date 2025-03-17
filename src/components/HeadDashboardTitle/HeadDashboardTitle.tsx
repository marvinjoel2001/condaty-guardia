import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";

import {useNavigation} from "@react-navigation/native";
import { getFullName, getUrlImages } from "../../../mk/utils/strings";
import Avatar from "../../../mk/components/ui/Avatar/Avatar";
import { cssVar, FONTS } from "../../../mk/styles/themes";
interface Props {
  user: any;
  stop: any;
  setOpenDropdown: any;
  theme: any;
}
const HeadDashboardTitle = ({user, stop, setOpenDropdown, theme}: Props) => {
  // console.log(user,'user 2')
  const navigation: any = useNavigation();
  if (!user) return null;
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}>
      <TouchableOpacity
        style={{width: 48, height: 48}}
        onPress={() => {
          navigation.navigate("Perfil");
        }}
        accessibilityLabel="ir al Perfil">
        <Avatar
          src={getUrlImages("/GUARD-" + user?.id + ".webp?d=" + user?.updated_at)}
          name={getFullName(user)}
        />
      </TouchableOpacity>
      <View style={{width: 200}}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{...styles?.text, textAlign: "center"}}>
          {getFullName(user)}
        </Text>
      </View>
      <Text style={{...styles?.label, fontSize: 12, textAlign: "center"}}>
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
      backgroundColor: cssVar.cBlackV2,
      borderRadius: 16,
      padding: 12,
      marginVertical: 8,
    },
    label: {
      color: cssVar.cWhiteV2,
      fontSize: 12,
      fontFamily: FONTS.light,
    },
    text: {
      color: cssVar.cWhite,
      fontSize: 14,
      fontFamily: FONTS.regular,
    },
  
})
