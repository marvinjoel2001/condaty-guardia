import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconArrowLeft, IconArrowRight} from '../../../icons/IconLibrary';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';

type Props = {
  access: any;
};

const DateAccess = ({access}: Props) => {
  let invitationIsPast = false;

  if (access && access.invitation && typeof access.invitation.date_event === 'string') {
    const eventDateStr = access.invitation.date_event;
    try {
      const [datePart] = eventDateStr.split(" ");
      if (datePart) {
        const [year, month, day] = datePart.split("-").map(Number);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          // Establece la fecha del evento al final de ese día para la comparación
          const eventEndDate = new Date(year, month - 1, day, 23, 59, 59, 999);
          const currentDate = new Date();

          if (currentDate > eventEndDate) {
            invitationIsPast = true;
          }
        }
      }
    } catch (e) {
      // Ignora errores de parseo de fecha, se mostrará la vista por defecto
    }
  }

  // Mostrar "Expirado" solo si la invitación ha pasado Y no hay hora de entrada registrada
  if (invitationIsPast && !access?.in_at) {
    return (
      <View style={styles.expiredContainer}>
        <Text style={styles.expiredText}>Expirado</Text>
      </View>
    );
  }

  // Si hay hora de entrada, o la invitación no ha pasado (y no hay entrada), mostrar tiempos de acceso
  return (
    <View
      style={{
        marginTop: 4,
      }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}>
        <Icon size={12} name={IconArrowRight} color={cssVar.cAccent} />
        <Text
          style={{
            color: cssVar.cWhiteV1,
            fontSize: 10,
          }}>
          {getDateTimeStrMes(access?.in_at, true) || 'No ha ingresado'}
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}>
        <Icon size={12} name={IconArrowLeft} color={cssVar.cError} />
        <Text
          style={{
            color: cssVar.cWhiteV1,
            fontSize: 10,
          }}>
          {getDateTimeStrMes(access?.out_at, true) || 'No ha salido'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  expiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 10, // El HTML original no especifica un gap para el contenedor del texto expirado solo
    backgroundColor: '#da5d5d',
    paddingVertical: 2, // Ajustado para que coincida con p-1 del HTML (4px total)
    paddingHorizontal: 6, // Similar a p-1
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  expiredText: {
    fontWeight: 'normal',
    fontSize: 10,
    color: '#e46055', // El color del texto es #e46055, no el del fondo
  },
});

export default DateAccess;