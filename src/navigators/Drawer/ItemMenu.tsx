import {Text, TouchableOpacity, View} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {useNavigation} from '@react-navigation/native';

interface PropsType {
  screen?: string | null;
  text: string;
  onPress?: any;
  icon?: string;
  color?: string;
  // iconFillStroke?: string | undefined;
  colorText?: string;
  activeItem?: string;
  reverse?: boolean;
}
const ItemMenu = ({
  screen = null,
  text,
  onPress = null,
  icon = '',
  activeItem = '',
  // iconFillStroke = undefined,
  reverse = false,
  colorText,
  color,
}: PropsType) => {
  const navigation: any = useNavigation();
  const isActive = activeItem === screen;
  const press = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate(screen);
    }
  };
  return (
    <TouchableOpacity
      style={[
        {
          paddingVertical: 12,
          marginHorizontal: 8,
        },
        // isActive && {
        //   backgroundColor: cssVar.cPrimary,
        // },
      ]}
      onPress={() => press()}>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 32,
          paddingVertical: 8,
          borderRadius: 8,
          gap: 10,
          alignItems: 'center',
          backgroundColor: isActive ? cssVar.cBlackV1 : cssVar.cBlack,
        }}>
        {icon != '' && (
          <Icon
            name={icon}
            color={!reverse ? 'transparent' : isActive ? cssVar.cWhite : color}
            fillStroke={
              reverse ? 'transparent' : isActive ? cssVar.cWhite : color
            }
          />
        )}
        <Text
          style={{
            color: colorText
              ? colorText
              : isActive
              ? cssVar.cWhite
              : cssVar.cBlackV2,
          }}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ItemMenu;
