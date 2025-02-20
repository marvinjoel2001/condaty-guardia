import {Text, View} from 'react-native';
import {TypeStyles} from '../../../styles/themes';

type Props = {
  showHead?: boolean;
  headers: Array<PropsHeaders>;
  data: Array<any>;
  style?: TypeStyles;
  styleHead?: TypeStyles;
};
type PropsHeaders = {
  id: string;
  label: string;
  style?: TypeStyles;
  styleHead?: TypeStyles;
  f?: Function;
};
const SimpleTable = ({
  showHead = true,
  headers,
  data,
  style = {},
  styleHead = {},
}: Props) => {
  return (
    <View
      style={{
        flexDirection: 'column',
        // margin: 16,
      }}>
      {showHead && (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            ...style,
            ...styleHead,
          }}>
          {headers.map((c, i) => (
            <View
              key={'col' + i}
              style={{
                ...c.style,
                ...c.styleHead,
              }}>
              <Text
                style={{
                  ...c.style,
                  ...c.styleHead,
                }}>
                {c.label}
              </Text>
            </View>
          ))}
        </View>
      )}
      {data?.map((f, i2) => (
        <View
          key={'fil' + i2}
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            ...style,
          }}>
          {headers.map((c, i) => (
            <View
              key={'cel' + i2 + '_' + i}
              style={{
                ...c.style,
              }}>
              <Text
                style={{
                  ...c.style,
                }}>
                {c.f && typeof c.f === 'function' ? c.f(f[c.id], f) : f[c.id]}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default SimpleTable;
