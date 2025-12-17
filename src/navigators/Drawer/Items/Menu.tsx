import React from 'react';
import { ScrollView, View } from 'react-native';
import { ThemeType } from '../../../../mk/styles/themes';
import { IconDepartments } from '../../../icons/IconLibrary';

import ItemMenu from './ItemMenu';
import { MenuProps } from '../../../types/menu-types';

const Menu: React.FC<MenuProps> = ({
  menuItems,
  activeItem,
  user,
  store,
  setStore,
}) => {
  if (activeItem === 'FooterTab') {
    activeItem = 'Home';
  }
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
            onPress={() => setStore({ ...store, openClient: true })}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default Menu;

const theme: ThemeType = {
  content: {
    flex: 1,
  },
};
