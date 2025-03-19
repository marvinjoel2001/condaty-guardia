import React, { useState } from 'react'
import Icon from '../../../../../mk/components/ui/Icon/Icon';
import { IconCheck, IconCheckOff } from '../../../../icons/IconLibrary';
import { cssVar } from '../../../../../mk/styles/themes';
import ItemListDate from './ItemListDate';
import { TypeDetails } from '../../../../../mk/components/ui/ItemInfo/ItemInfo';




const checkVisits = () => {
 const [details, setDetails] = useState<TypeDetails>({title: '', data: []});


  const RightItem = ({acompanante, isSelected}: any) => {
    return (
      <>
        {details.buttonText != '' &&
        !acompanante?.out_at &&
        acompanante?.in_at ? (
          <Icon
            name={isSelected ? IconCheck : IconCheckOff}
            color={isSelected ? cssVar.cSuccess : 'transparent'}
            fillStroke={!isSelected ? cssVar.cWhite : ''}
          />
        ) : (
          ''
        )}
      </>
    );
  };

  const Hours = ({acompanante, fecha = ''}: any) => {
    return (
      <ItemListDate
        inDate={acompanante?.in_at}
        outDate={acompanante?.out_at}
        // date={fecha}
      />
    );
  };
  return (
    <div>checkVisits</div>
  )
}

export default checkVisits