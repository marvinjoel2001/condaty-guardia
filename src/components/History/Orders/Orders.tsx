import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Ya no se necesita date-fns directamente aquí si DateAccess lo maneja.
// import { format, parseISO } from 'date-fns';
// import { es } from 'date-fns/locale';

import List from '../../../../mk/components/ui/List/List';
import { ItemList } from '../../../../mk/components/ui/ItemList/ItemList';
import { getFullName, getUrlImages } from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import { IconDownload } from '../../../icons/IconLibrary'; // Para la función de exportar
import { cssVar } from '../../../../mk/styles/themes'; // Usado por IconDownload y DateAccess
import OrdersDetail from './OrdersDetail';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import { openLink } from '../../../../mk/utils/utils';
import DateAccess from '../DateAccess/DateAccess'; // ¡Importante! Usaremos este componente.

// --- Funciones Auxiliares (Optimizadas) ---

const getInitials = (owner: any): string => {
  if (!owner) return '??';
  const name = owner.name || '';
  const lastName = owner.last_name || '';
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getOrderTypeName = (typeId: number | string): string => {
  const id = Number(typeId);
  switch (id) {
    case 1: return 'Delivery';
    case 2: return 'Taxi';
    default: return 'Otro';
  }
};

const avatarColors = [
  '#f7b267', '#fde298', '#b0eeb0', '#a9cce3',
  '#f6c8a6', '#c8a6f6', '#f9d6d5', '#d4e1f2',
  '#ffcbcb', '#cbf2ff', '#e2cbff', '#cbffe2'
];

const getAvatarColor = (owner: any): string => {
  if (!owner || (!owner.id && !owner.name)) return avatarColors[0];
  const str = String(owner.id || owner.name);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

// Las funciones parseApiDate y formatOrderDateTime ya no son necesarias aquí,
// ya que DateAccess y getDateTimeStrMes se encargarán de ello.

// --- Tipos y Componente ---

type Props = {
  data: any[];
  loaded: boolean;
};

export const Orders = ({ data, loaded }: Props) => {
  const [openDetail, setOpenDetail] = useState({ open: false, id: null as number | string | null });
  const [search, setSearch] = useState('');
  const { execute } = useApi();

  const renderItem = (item: any) => {
    if (search && search !== '') {
      if (
        !getFullName(item?.owner).toLowerCase().includes(search.toLowerCase())
      ) {
        return null;
      }
    }

    const ownerFullName = getFullName(item?.owner);
    const orderTypeString = "Pedido: " + getOrderTypeName(item?.other_type_id);

    return (
      <ItemList
        onPress={() => setOpenDetail({ open: true, id: item.id })}
        key={item.id}
        title={ownerFullName}
        subtitle={orderTypeString}
        left={
          <Avatar
            name={ownerFullName}
            src={
              !item?.visit
                ? getUrlImages(
                    '/OWNER-' + item?.owner?.id + '.webp?d=' + item?.owner?.updated_at,
                  )
                : ''
            }
          />
        }
        right={<DateAccess access={item.access} />}
        style={styles.customItemListStyle}
      />
    );
  };

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const onExport = async () => {
    const { data: file } = await execute('/others', 'GET', {
      perPage: -1, page: 1, fullType: 'L', section: 'ACT', _export: 'pdf',
    });
    if (file?.success == true) {
      openLink(getUrlImages('/' + file?.data.path));
    }
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.searchContainer}>
        <DataSearch
          setSearch={onSearch}
          name="orders"
          value={search}
          style={{ flex: 1 }}
        />
        {/* <Icon
          name={IconDownload}
          onPress={onExport}
          fillStroke={cssVar.cWhiteV2}
          color={'transparent'}
        /> */}
      </View>
      <List data={data} renderItem={renderItem} refreshing={loaded} />
      {openDetail.open && (
        <OrdersDetail
          open={openDetail.open}
          onClose={() => setOpenDetail({ open: false, id: null })}
          id={openDetail?.id as number | null}
        />
      )}
    </View>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  customItemListStyle: {
    backgroundColor: '#414141',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    // marginVertical: 5, // ItemList ya tiene un marginVertical por defecto
  },
  avatarView: { // Usado en 'leftElement'
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { // Usado en 'leftElement'
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
  // Ya no se necesitan estilos para datesView, dateRow, statusDot, dateTimeText
  // porque DateAccess se encarga de su propia presentación.
});