import React from 'react';
import {ScrollView, View} from 'react-native';
import {ThemeType} from '../../../../mk/styles/themes';
import {IconDepartments} from '../../../icons/IconLibrary';
import {User} from '../../../types/user-types';
import ItemMenu from './ItemMenu';
import {ItemMenuProps} from '../../../types/menu-types';

type Props = {
  menuItems: ItemMenuProps[];
  activeItem?: string;
  user: User | null;
  store: any;
  setStore: Function;
};

const Menu: React.FC<Props> = ({menuItems, activeItem, user, store, setStore}) => {
  return (
    <View style={theme.content}>
      <ScrollView>
        {menuItems.map((item, index) => (
          <ItemMenu
            key={`menu-item-${index}`}
            screen={item.screen}
            text={item.text}
            icon={item.icon}
            activeItem={activeItem}
            reverse={item.reverse}
            color={item.color}
            colorText={item.colorText}
            onPress={item.onPress}
          />
        ))}

        {user?.clients && user.clients.length > 1 && (
          <ItemMenu
            text="Cambiar Condominio"
            icon={IconDepartments}
            onPress={() => setStore({...store, openClient: true})}
          />
        )}
      </ScrollView>
    </View>
  );
};

const theme: ThemeType = {
  content: {
    flex: 1,
  },
};

export default Menu;