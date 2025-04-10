import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import {initialsName} from '../../../utils/strings';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import {IconUser} from '../../../../src/icons/IconLibrary';
import Icon from '../Icon/Icon';
import {cRandomcolors} from '../../../utils/randomColors';
// import FastImage from 'react-native-fast-image';
// import {usePusher} from '../../../contexts/PusherContext';

interface AvatarProps {
  src?: string | null;
  name?: string;
  w?: number;
  h?: number;
  style?: TypeStyles;
  onClick?: any;
  error?: () => void;
  emptyIcon?: boolean;
  fontSize?: number;
  sizeIconVerify?: number;
  sizeIconDiamond?: number;
  bottomDiamond?: number;
  verify?: boolean;
  level?: any;
  circle?: boolean;
  borderColor?: string; // Color del borde
  borderWidth?: number; // Grosor del borde
}

const Avatar = ({
  src = null,
  name = '',
  w = 40,
  h = 40,
  style = {},
  onClick = null,
  error = () => {},
  emptyIcon = false,
  fontSize = cssVar.sM,
  sizeIconVerify = 16,
  verify = false,
  circle = true,
  borderColor = 'transparent', // Valor por defecto para el borde
  borderWidth = 0, // Valor por defecto para el grosor del borde
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  // const {connect} = usePusher();

  const getBackgroundColor = (name: string) => {
    const index = name.length % cRandomcolors.length;
    return cRandomcolors[index];
  };

  const backgroundColor = getBackgroundColor(name);

  const view = (
    <View style={{alignItems: 'center'}}>
      <TouchableOpacity
        activeOpacity={onClick ? 0.2 : 1}
        style={{
          ...theme.avatar,
          width: w,
          height: h,
          backgroundColor: backgroundColor,
          borderColor: borderColor, // Agregar color del borde
          borderWidth: borderWidth, // Agregar grosor del borde
          borderRadius: w / 2, // Asegurar que el borde sea circular
          ...style,
        }}
        onPress={() => onClick && onClick()}>
        {src && !imageError ? (
          <Image
            source={{uri: src}}
            style={{
              width: w,
              height: h,
              borderRadius: circle ? w / 2 : 0, // Asegurar que la imagen sea circular
            }}
            resizeMode="cover"
            onError={e => {
              // console.log('Error al cargar la imagen', e);
              error();
              setImageError(true);
            }}
            onLoad={async () => {
              setImageError(false);
              // if (level && level != '') console.log('Imagen cargada');
              // const a = await connect();
            }}
          />
        ) : !emptyIcon ? (
          <Text style={{...theme.text, fontSize: fontSize}}>
            {initialsName(name)}
          </Text>
        ) : (
          <Icon
            name={IconUser}
            color={cssVar.cBlackV2}
            fillStroke={cssVar.cBlackV2}
            size={w - 8}
          />
        )}
      </TouchableOpacity>

      {/* {verify && (
        <Icon
          name={IconVerify}
          color={cssVar.cSuccess}
          size={sizeIconVerify}
          style={{position: 'absolute', top: -4, right: 0}}
        />
      )} */}
    </View>
  );

  return <View style={theme.container}>{view}</View>;
};

export default Avatar;

const theme: ThemeType = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  text: {
    color: cssVar.cBlackV1,
    fontSize: cssVar.sM,
    fontFamily: FONTS.bold,
  },
};
