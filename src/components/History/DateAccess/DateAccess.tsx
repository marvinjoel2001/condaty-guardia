import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconArrowLeft, IconArrowRight} from '../../../icons/IconLibrary';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {
  formatToDayDDMMYYYYHHMM,
  getDateTimeStrMes,
} from '../../../../mk/utils/dates';

type Props = {
  access: any;
};

const DateAccess = ({access}: Props) => {
  let invitationIsPast = false;

  if (
    access &&
    access.invitation &&
    typeof access.invitation.date_event === 'string'
  ) {
    const eventDateStr = access.invitation.date_event;
    try {
      const [datePart] = eventDateStr.split(' ');
      if (datePart) {
        const [year, month, day] = datePart.split('-').map(Number);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const eventEndDate = new Date(year, month - 1, day, 23, 59, 59, 999);
          const currentDate = new Date();

          if (currentDate > eventEndDate) {
            invitationIsPast = true;
          }
        }
      }
    } catch (e) {}
  }

  if (invitationIsPast && !access?.in_at) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.expiredText}>Expirado</Text>
      </View>
    );
  }

  if (!access?.in_at && !access?.out_at) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.deniedText}>Rechazado</Text>
      </View>
    );
  }

  return (
    <View style={styles.accessTimesContainer}>
      <View style={styles.timeRow}>
        <Icon size={12} name={IconArrowRight} color={cssVar.cAccent} />
        <Text style={styles.timeText}>
          {getDateTimeStrMes(access?.in_at) || 'No ha ingresado'}
        </Text>
      </View>
      <View style={styles.timeRow}>
        <Icon size={12} name={IconArrowLeft} color={cssVar.cError} />
        <Text style={styles.timeText}>
          {getDateTimeStrMes(access?.out_at) || 'No ha salido'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  expiredText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: cssVar.cError,
    backgroundColor: cssVar.cError + '20',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  deniedText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: cssVar.cError,
  },
  accessTimesContainer: {
    marginTop: 4,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  timeText: {
    color: cssVar.cWhiteV1,
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
});

export default DateAccess;
