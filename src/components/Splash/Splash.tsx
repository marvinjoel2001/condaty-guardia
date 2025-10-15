import React from "react";
import {Text, View} from "react-native";
import { IconCondatySplash } from "../../icons/IconLibrary";
import {cssVar, FONTS} from "../../../mk/styles/themes";
import Icon from "../../../mk/components/ui/Icon/Icon";

const Splash = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: cssVar.cPrimary,
      }}>
      <View
        style={{flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
        <Icon name={IconCondatySplash} viewBox="0 0 98 98" size={98} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          marginBottom: 30,
        }}>
        <Text
          style={{
            fontSize: 20,
            color: cssVar.cWhite,
            fontFamily: FONTS.regular,
          }}>
          <Text style={{fontFamily: FONTS.bold, color: cssVar.cWhite}}>
            Tecnología,
          </Text>
            {' '}que une
          <Text style={{fontFamily: FONTS.bold, color: cssVar.cWhite}}>
            {' '}vecinos
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Splash;
