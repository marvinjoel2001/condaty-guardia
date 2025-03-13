import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ItemList } from '../../../mk/components/ui/ItemList/ItemList'
import ItemListDate from './ItemListDate/ItemListDate'
import List from '../../../mk/components/ui/List/List'
import { getFullName, getUrlImages } from '../../../mk/utils/strings'
import Avatar from '../../../mk/components/ui/Avatar/Avatar'
import { IconDelivery, IconOther, IconTaxi } from '../../icons/IconLibrary'
import Icon from '../../../mk/components/ui/Icon/Icon'
import { cssVar, FONTS } from '../../../mk/styles/themes'

const AccessList = ({data , right , left , subtitle ,title,hours}:any) => {
    


  
  
    // const icon = (item: any) => {
    //     const isOrder = item.type === "P";
    //     const orderIcons: Record<string, any> = {
    //       Taxi: IconTaxi,
    //       Mensajeria: IconOther,
    //       Delivery: IconDelivery,
    //       Otro: IconOther,
    //     };
      
    //     if (isOrder) {
    //       const iconName = orderIcons[item.other?.otherType?.name] || IconOther;
      
    //       return (
    //         <Icon
    //           style={{
    //             backgroundColor: cssVar.cWhite,
    //             padding: 8,
    //             borderRadius: 50,
    //           }}
    //           name={iconName}
    //           color={css}
    //           size={24}
    //         />
    //       );
    //     }
      
    //     // Caso default para no pedidos
    //     const avatarSrc = getUrlImages(
    //       item.type === "O"
    //         ? `/OWN-${item.owner_id}.png?d=${item.updated_at}`
    //         : `/VISIT-${item.visit?.id}.png?d=${item.updated_at}`
    //     );
      
    //     return (
    //       <Avatar
    //         src={avatarSrc}
    //         name={item.type === "O" ? getFullName(item.owner) : getFullName(item.visit)}
    //       />
    //     );
    //   };

    //   const right = (item: any) => {
    //     const commonTextStyle = { fontSize: 10, fontFamily: FONTS.regular };
      
    //     const handlePress = () => _onDetail(item);
      
    //     if (!item?.in_at && !item?.confirm_at) {
    //       return (
    //         <Text style={commonTextStyle}>
    //           Esperando Confirmación
    //         </Text>
    //       );
    //     }
      
    //     if (!item?.in_at && item?.confirm_at) {
    //       if (item?.confirm === "Y" && edit) {
    //         return (
    //           <TouchableOpacity
    //             style={{ 
    //               // ...theme.buttons?.primary, 
    //               borderRadius: 10 }}
    //             onPress={handlePress}
    //             accessibilityLabel={`Dejar entrar a ${getFullName(item.visit)}`}
    //           >
    //             <Text style={{
    //               ...commonTextStyle,
    //               color: cssVar.cAccent,
    //               paddingHorizontal: 8,
    //               paddingVertical: 4,
    //               marginTop: 1,
    //             }}>
    //               Dejar entrar
    //             </Text>
    //           </TouchableOpacity>
    //         );
    //       } else if (item?.confirm === "N") {
    //         return (
    //           <Text style={{ ...commonTextStyle, color: cssVar.cError }}>
    //             No Autorizado
    //           </Text>
    //         );
    //       }
    //     }
      
    //     if (item?.type !== "O" && item?.in_at && !item?.out_at && edit) {
    //       return (
    //         <TouchableOpacity
    //           style={{ 
    //             // ...theme.buttons?.secondary,
    //              borderRadius: 10 }}
    //           onPress={handlePress}
    //           accessibilityLabel={`Ver detalles de ${getFullName(item.visit)}`}
    //         >
    //           <Text style={{
    //             ...commonTextStyle,
    //             paddingHorizontal: 10,
    //             paddingVertical: 4,
    //             // color: theme.buttons?.secondary?.borderColor,
    //           }}>
    //             Dejar salir
    //           </Text>
    //         </TouchableOpacity>
    //       );
    //     }
      
    //     return null;
    //   };
       
    //   const hours = (item: any) => {
    //     return (
    //       <ItemListDate
    //         data1={item.in_at}
    //         data2={item.type != "O" ? item.out_at : null}
    //         date={antFec}
    //       />
    //     );
    //   };
    const Item = (item: any) => {

        // if (
        //   search != "" &&
        //   ("" + getFullName(item.visit))
        //     .toLowerCase()
        //     .indexOf(search.toLowerCase()) < 0
        // )
        //   return null;
    
        return (
          <>
            {/* {sep} */}
            <TouchableOpacity
              accessibilityLabel={
                "Ver detalles de " +
                // (item.type == "O"
                //   ? getFullName(item?.owner)
                //   : getFullName(item?.visit))
                title(item)
              }
            //   onPress={() => {
            //     // _onDetail(item);
            //     setFormState({...formState, id: item.id});
    
            //     setOpenDetail(true);
            //   }}
              >
              <ItemList
                title={
                 
                    // getFullName(item.type == "O" ? item.owner : item.visit)
                    title(item)
                }
                subtitle={subtitle(item)}
                left={left(item)}
                right={right(item)}
                date={hours(item)}
                widthMain={150}
              />
            </TouchableOpacity>
          </>
        );
      };






  return (
    <List
    style={{}}
    data={data?.data}
    renderItem={Item}
    refreshing={!loaded}
  />

  )
}

export default AccessList