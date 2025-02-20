import {Text, View} from 'react-native';
import Avatar from '../ui/Avatar/Avatar';
import {getUrlImages} from '../../utils/strings';
import {cssVar, ThemeType} from '../../styles/themes';
import Icon from '../ui/Icon/Icon';
// import {IconPost} from '../../../src/icons/IconLibrary';
import React from 'react';

interface TypeProps {
  count: number;
  list: any;
  onTop: any;
}

const ToastNotif = ({count, list, onTop}: TypeProps) => {
  const displayedList = list.slice(0, 3);
  const update_at = new Date().toISOString();

  return (
    <View style={theme.container}>
      <View onTouchEnd={onTop} style={theme.content}>
        {/* <Icon
          style={{marginRight: 8, marginTop: 4}}
          name={IconPost}
          // size={20}
          color={cssVar.cWhite}
        /> */}
        {displayedList.map((item: any, index: number) => (
          <Avatar
            h={34}
            w={34}
            style={{marginLeft: -8}}
            key={index}
            src={getUrlImages('/CAND-' + item + '.webp?d=' + update_at)}
          />
        ))}
        <Text style={theme.text}>
          +{count} {count == 1 ? 'post nuevo' : 'posts nuevos'}
        </Text>
      </View>
    </View>
  );
};
const theme: ThemeType = {
  container: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    top: 10,
    overflow: 'visible',
    zIndex: 9999,
  },
  content: {
    backgroundColor: cssVar.cAccent,
    paddingVertical: cssVar.spXs,
    paddingHorizontal: cssVar.spS,
    flexDirection: 'row',
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    height: 48,
  },
  text: {
    marginLeft: cssVar.spXs,
    color: cssVar.cWhite,
  },
};

export default ToastNotif;
