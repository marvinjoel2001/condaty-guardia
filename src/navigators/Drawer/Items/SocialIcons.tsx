import React from 'react';
import {View} from 'react-native';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {cssVar, ThemeType} from '../../../../mk/styles/themes';
import {openLink} from '../../../../mk/utils/utils';
import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconYoutube,
  IconTikTok,
} from '../../../icons/IconLibrary';
import {SocialIcon} from '../../../types/social-types';

type Props = {
  icons?: SocialIcon[];
};

const defaultIcons: SocialIcon[] = [
  { icon: IconFacebook, link: 'https://facebook.com/condaty.bo' },
  { icon: IconInstagram, link: 'https://instagram.com/condaty.bo' },
  { icon: IconLinkedin, link: 'https://www.linkedin.com/company/condatybo' },
  { icon: IconYoutube, link: 'https://youtube.com/@CondatybyFos' },
  { icon: IconTikTok, link: 'https://tiktok.com/@condaty.bo' },
];

export const SocialIcons: React.FC<Props> = ({icons = defaultIcons}) => {
  return (
    <View style={theme.socialIconsContainer}>
      {icons.map((item, index) => (
        <Icon
          key={`social-icon-${index}`}
          name={item.icon}
          color={cssVar.cWhiteV1}
          onPress={() => openLink(item.link)}
        />
      ))}
    </View>
  );
};

export default SocialIcons;

const theme: ThemeType = {
    socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: cssVar.spM,
    borderTopWidth: 1,
    borderTopColor: cssVar.cBlackV2,
  }
}
