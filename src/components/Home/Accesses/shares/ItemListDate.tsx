import {StyleSheet, Text, View} from 'react-native';
import Icon from '../../../../../mk/components/ui/Icon/Icon';
import {IconArrowLeft, IconArrowRight} from '../../../../icons/IconLibrary';
import {cssVar, FONTS} from '../../../../../mk/styles/themes';
import {getDateTimeStrMes} from '../../../../../mk/utils/dates';

interface PropsType {
  inDate?: string | null;
  outDate?: string | null;
}

const ItemListDate = ({inDate = null, outDate = null}: PropsType) => {
  return (
    <View style={styles.container}>
      <View style={{width: '86%'}}>
        {inDate && (
          <View style={styles.center}>
            <Icon size={20} name={IconArrowRight} color={cssVar.cSuccess} />
            <Text style={styles.fecha}>{getDateTimeStrMes(inDate, true)}</Text>
          </View>
        )}
        {outDate && (
          <View style={styles.center}>
            <Icon size={20} name={IconArrowLeft} color={cssVar.cError} />
            <Text style={styles.fecha}>{getDateTimeStrMes(outDate, true)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-end',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fecha: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: cssVar.cWhiteV2,
  },
});
export default ItemListDate;
