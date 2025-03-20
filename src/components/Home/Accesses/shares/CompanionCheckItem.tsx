// CompanionCheckItem.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';

import ItemListDate from './ItemListDate';
import { ItemList } from '../../../../../mk/components/ui/ItemList/ItemList';
import { getFullName } from '../../../../../mk/utils/strings';
import Avatar from '../../../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../../../mk/components/ui/Icon/Icon';
import { IconCheck, IconCheckOff } from '../../../../icons/IconLibrary';
import { cssVar } from '../../../../../mk/styles/themes';


interface CompanionCheckItemProps {
  companion: any;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const CompanionCheckItem: React.FC<CompanionCheckItemProps> = ({ companion, isSelected, onToggle }) => {
  return (
    <TouchableOpacity onPress={() => onToggle(companion.id)}>
      <ItemList
        title={getFullName(companion?.visit)}
        subtitle={'C.I. ' + companion?.visit?.ci}
        left={<Avatar name={getFullName(companion?.visit)} />}
        right={
          <Icon
            name={isSelected ? IconCheck : IconCheckOff}
            color={isSelected ? cssVar.cSuccess : 'transparent'}
          />
        }
        date={<ItemListDate inDate={companion?.in_at} outDate={companion?.out_at} />}
      />
    </TouchableOpacity>
  );
};

export default CompanionCheckItem;
