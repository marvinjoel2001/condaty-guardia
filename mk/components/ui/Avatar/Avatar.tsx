import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {initialsName} from '../../../utils/strings';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import {IconUser} from '../../../../src/icons/IconLibrary';
import Icon from '../Icon/Icon';
import {cRandomcolors} from '../../../utils/randomColors';
import ImageExpandableModal from '../ImageExpandableModal/ImageExpandableModal';

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
  borderColor?: string;
  borderWidth?: number;
  expandable?: boolean;
  hasImage?: string | number;
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
  hasImage,
  verify = false,
  circle = true,
  borderColor = 'transparent',
  borderWidth = 0,
  expandable = false,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const hasValidSrc = src && src.indexOf('undefined') === -1;
  const shouldShowInitials = !hasValidSrc || hasImage === 0 || imageError;
  const shouldShowImage = !shouldShowInitials;
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const getBackgroundColor = (nameString: string) => {
    if (!nameString || nameString.length === 0) {
      return cRandomcolors[0];
    }
    const index = nameString.length % cRandomcolors.length;
    return cRandomcolors[index];
  };

  const backgroundColor = getBackgroundColor(name);

  const handlePress = () => {
    if (expandable && src && !imageError) {
      setModalVisible(true);
    } else if (onClick) {
      onClick();
    }
  };

  const view = (
    <View style={{alignItems: 'center'}}>
      <TouchableOpacity
        activeOpacity={onClick || (expandable && src && !imageError) ? 0.2 : 1}
        style={{
          ...theme.avatar,
          width: w,
          height: h,
          backgroundColor:
            src && shouldShowImage ? 'transparent' : backgroundColor,
          borderColor: borderColor,
          borderWidth: borderWidth,
          borderRadius: circle ? w / 2 : cssVar.bRadiusS,
          ...style,
        }}
        onPress={handlePress}>
        {src && shouldShowImage ? (
          <Image
            source={{uri: shouldShowImage ? src : undefined}}
            style={{
              width: w,
              height: h,
              borderRadius: circle ? w / 2 : 0,
            }}
            resizeMode="cover"
            onError={e => {
              error();
              setImageError(true);
            }}
            onLoad={() => {
              setImageError(false);
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
    </View>
  );

  return (
    <View style={theme.container}>
      {view}
      {expandable && src && !imageError && (
        <ImageExpandableModal
          visible={modalVisible}
          imageUri={src}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
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
  },
  text: {
    color: cssVar.cBlackV1,
    fontSize: cssVar.sM,
    fontFamily: FONTS.bold,
  },
};
