import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import { FONTS, cssVar } from '../../../mk/styles/themes';
import ItemList from '../../../mk/components/ui/ItemList/ItemList';
import DataSearch from '../../../mk/components/ui/DataSearch';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import ReservationModalDetail from './ReservationModalDetail';
import { statusReserv } from './reservationConstants';
import useApi from '../../../mk/hooks/useApi';
import { DAYS_SHORT, MONTHS } from '../../../mk/utils/dates';
import { getUrlImages } from '../../../mk/utils/strings';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = Number.parseInt(parts[0]);
  const month = Number.parseInt(parts[1]) - 1;
  const day = Number.parseInt(parts[2]);
  const date = new Date(year, month, day);

  const wDay = DAYS_SHORT[date.getDay()];
  const mName = MONTHS[month + 1];

  return `${wDay} ${day} de ${mName}, ${year}`;
};

const Reservations = () => {
  const [tab, setTab] = useState('P');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any>(null);

  const [params, setParams] = useState<any>({
    perPage: 20,
    page: 1,
    fullType: 'L',
  });

  const {
    data: responseData,
    reload,
    loaded,
  } = useApi('/reservations', 'GET', params);

  useEffect(() => {
    setParams((prev: any) => {
      const newParams = {
        ...prev,
      };

      if (tab === 'P') {
        // Para pendientes solo fullType='L', sin type
        delete newParams.type;
      } else {
        newParams.type = tab;
      }

      return newParams;
    });
  }, [tab]);

  useEffect(() => {
    reload({ payload: params });
  }, [params]);

  const formattedData = useMemo(() => {
    if (!responseData || !responseData.data) return [];
    return responseData.data.map((item: any) => {
      const statusInfo = statusReserv[item.status] || {
        statusText: 'Desconocido',
        statusColor: '#000',
        statusBg: '#fff',
      };

      let imageUrl = '';
      if (item.area?.images && item.area.images.length > 0) {
        imageUrl = getUrlImages(
          `/AREA-${item.area.id}-${item.area.images[0].id}.${item.area.images[0].ext}?${item.area.updated_at}`,
        );
      }

      return {
        id: item.id,
        title: item.area?.title || 'Sin título',
        date: formatDate(item.date_at),
        time: `${item.start_time?.slice(0, 5) || ''} - ${
          item.end_time?.slice(0, 5) || ''
        }`,
        status: statusInfo.statusText,
        statusCode: item.status,
        statusColor: statusInfo.statusColor,
        statusBg: statusInfo.statusBg,
        reserverName: `${item.owner?.name || ''} ${
          item.owner?.last_name || ''
        }`.trim(),
        unit: item.dpto?.nro || '',
        capacity: item.people_count,
        description: item.obs || '',
        original: item,
        image: imageUrl,
      };
    });
  }, [responseData]);

  const filteredData = useMemo(() => {
    let data = formattedData;
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(
        (item: any) =>
          item.title.toLowerCase().includes(lowerSearch) ||
          item.reserverName.toLowerCase().includes(lowerSearch) ||
          item.unit.toLowerCase().includes(lowerSearch),
      );
    }
    return data;
  }, [formattedData, search]);

  const handleReservationPress = (reservation: any) => {
    setSelectedRes(reservation);
    setModalOpen(true);
  };

  const getStatus = (code: string) => {
    return statusReserv[code] || statusReserv.UNKNOWN;
  };

  return (
    <Layout title="Reservas" scroll={true}>
      <TabsButtons
        style={{ marginVertical: 12 }}
        tabs={[
          { value: 'P', text: 'Pendientes' },
          { value: 'H', text: 'Historial' },
        ]}
        sel={tab}
        setSel={setTab}
      />

      <DataSearch setSearch={setSearch} style={{ marginBottom: 12 }} />

      {!loaded ? (
        <ActivityIndicator
          size="large"
          color={cssVar.cPrimary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <>
          {filteredData.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontFamily: FONTS.regular, color: '#666' }}>
                {tab === 'P'
                  ? 'No tienes reservas pendientes.'
                  : 'No tienes historial de reservas.'}
              </Text>
            </View>
          )}

          {filteredData.map((reservation: any) => {
            const status = getStatus(reservation.statusCode);
            return (
              <ItemList
                key={reservation.id}
                title={reservation.title}
                subtitle={reservation.date}
                subtitle2={reservation.time}
                left={
                  <Avatar
                    name={reservation.title}
                    hasImage={reservation.image ? 1 : 0}
                    src={reservation.image}
                  />
                }
                right={
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: status.statusBgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: status.statusTextColor },
                      ]}
                    >
                      {status.statusText}
                    </Text>
                  </View>
                }
                onPress={() => handleReservationPress(reservation)}
              />
            );
          })}
        </>
      )}

      <ReservationModalDetail
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reservation={selectedRes}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
});

export default Reservations;
