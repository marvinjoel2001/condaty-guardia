import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Modal from '../../../mk/components/ui/Modal/Modal';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../mk/components/ui/Icon/Icon';
import { cssVar, FONTS } from '../../../mk/styles/themes';
import { IconCalendar, IconClock, IconGroup } from '../../icons/IconLibrary';
import { statusReserv } from './reservationConstants';
import useApi from '../../../mk/hooks/useApi';
import { getUrlImages } from '../../../mk/utils/strings';
import { DAYS_SHORT, MONTHS } from '../../../mk/utils/dates';

type Props = {
  open: boolean;
  onClose: () => void;
  reservation: any;
};

const ReservationModalDetail = ({ open, onClose, reservation }: Props) => {
  const params = useMemo(
    () => ({ searchBy: reservation?.id, fullType: 'DET' }),
    [reservation?.id],
  );
  const {
    data: responseData,
    loaded,
    reload,
  } = useApi('/reservations', 'GET', params);
  const loading = !loaded;

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && reservation?.id) {
      setImageError(false);
      reload({ payload: params });
    }
  }, [open, reservation?.id]);

  const detailData = useMemo(() => {
    if (!responseData?.data?.length) return null;
    const item = responseData.data[0];

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
      );
      const dayOfWeek = DAYS_SHORT[date.getDay()];
      const dayNum = date.getDate();
      const monthName = MONTHS[date.getMonth() + 1];
      return `${dayOfWeek}, ${dayNum} ${monthName}`;
    };

    let imageUrl = '';
    if (item.area?.images && item.area.images.length > 0) {
      // Asumiendo patrón de imagen de área
      imageUrl = getUrlImages(
        `/AREA-${item.area.id}-${item.area.images[0].id}.${item.area.images[0].ext}?${item.area.updated_at}`,
      );
    }

    return {
      title: item.area?.title || 'Sin título',
      description: item.obs || item.area?.description || '',
      statusCode: item.status,
      reserverName: `${item.owner?.name || ''} ${
        item.owner?.last_name || ''
      }`.trim(),
      unit: item.dpto?.nro || '',
      capacity: item.people_count,
      date: formatDate(item.date_at),
      time: `${item.start_time?.slice(0, 5) || ''} - ${
        item.end_time?.slice(0, 5) || ''
      }`,
      image: imageUrl,
      // For avatar fallback
      ownerHasImage: item.owner?.has_image,
      ownerId: item.owner?.id,
      ownerUpdatedAt: item.owner?.updated_at,
    };
  }, [responseData]);

  if (!open) return null;

  const getStatus = (code: string) => {
    return statusReserv[code] || statusReserv.UNKNOWN;
  };

  const status = detailData
    ? getStatus(detailData.statusCode)
    : statusReserv.UNKNOWN;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalles de reserva"
      iconClose={true}
      overlayClose={true}
      headerStyles={{ borderBottomWidth: 0 }}
      containerStyles={{ backgroundColor: cssVar.cBlack }}
    >
      {loading || !detailData ? (
        <View
          style={{
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={cssVar.cPrimary} />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Header Image */}
          <View style={styles.imageContainer}>
            {detailData.image && !imageError ? (
              <Image
                source={{ uri: detailData.image }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: cssVar.cBlackV2,
                }}
              >
                <Text
                  style={{
                    color: cssVar.cWhite,
                    fontFamily: FONTS.medium,
                    fontSize: 16,
                  }}
                >
                  Sin imagen
                </Text>
              </View>
            )}
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{detailData.title}</Text>
          <Text style={styles.description}>{detailData.description}</Text>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: status.statusBgColor,
                alignSelf: 'flex-start',
                marginBottom: 16,
              },
            ]}
          >
            <Text
              style={[styles.statusText, { color: status.statusTextColor }]}
            >
              {status.statusText}
            </Text>
          </View>

          {/* Reservada por */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>Reservada por</Text>
            <View style={styles.reserverRow}>
              <Avatar
                name={detailData.reserverName}
                hasImage={detailData.ownerHasImage}
                src={
                  detailData.ownerHasImage
                    ? getUrlImages(
                        `/OWNER-${detailData.ownerId}.webp?d=${detailData.ownerUpdatedAt}`,
                      )
                    : undefined
                }
                w={40}
                h={40}
                style={{ marginRight: 12 }}
              />
              <View>
                <Text style={styles.reserverName}>
                  {detailData.reserverName}
                </Text>
                <Text style={styles.reserverUnit}>{detailData.unit}</Text>
              </View>
            </View>
          </View>

          {/* Información */}
          <View style={styles.lastSectionBox}>
            <Text style={styles.sectionLabel}>Información</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name={IconCalendar} color={cssVar.cWhiteV1} size={18} />
                <Text style={styles.infoText}>{detailData.date}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name={IconGroup} color={cssVar.cWhiteV1} size={18} />
                <Text style={styles.infoText}>
                  {detailData.capacity} personas
                </Text>
              </View>
            </View>
            <View style={styles.infoRowSecondary}>
              <View style={styles.infoItem}>
                <Icon
                  name={IconClock}
                  color={cssVar.cWhiteV1}
                  size={18}
                  viewBox="0 0 32 32"
                />
                <Text style={styles.infoText}>{detailData.time}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
    width: '100%',
    backgroundColor: cssVar.cBlackV2,
  },
  title: {
    fontSize: cssVar.sL,
    fontFamily: FONTS.bold,
    color: cssVar.cWhite,
    marginBottom: 8,
  },
  description: {
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
    color: cssVar.cWhiteV1,
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionBox: {
    backgroundColor: cssVar.cBlackV2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  lastSectionBox: {
    backgroundColor: cssVar.cBlackV2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionLabel: {
    fontSize: cssVar.sM,
    fontFamily: FONTS.medium,
    color: cssVar.cWhite,
    marginBottom: 12,
  },
  reserverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reserverName: {
    fontSize: cssVar.sM,
    fontFamily: FONTS.medium,
    color: cssVar.cWhite,
  },
  reserverUnit: {
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
    color: cssVar.cWhiteV1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  infoRowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    color: cssVar.cWhiteV1,
  },
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

export default ReservationModalDetail;
