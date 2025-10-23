import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Modal as ModalRN,
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import Button from '../../forms/Button/Button';
import {AuthContext} from '../../../contexts/AuthContext';
import Toast from '../Toast/Toast';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import Form from '../../forms/Form/Form';
import HeadTitle from '../../layout/HeadTitle';
import {SafeAreaView as SafeAreaViewAndroid} from 'react-native-safe-area-context';

type PropsType = {
  children: any;
  onClose: (e: any) => void;
  open: boolean;
  onSave?: (e: any) => void;
  onShow?: () => void;
  title?: any;
  style?: TypeStyles;
  buttonText?: string;
  buttonCancel?: string;
  buttonExtra?: any;
  id?: string;
  styleFooter?: TypeStyles;
  iconClose?: boolean;
  right?: any;
  disabled?: boolean;
  enScroll?: boolean;
  reload?: any;
  scrollViewHide?: boolean;
  onBack?: () => void;
  headerHide?: boolean;
};

const ModalFull = ({
  children,
  onClose,
  open,
  onSave = () => {},
  title = '',
  style = {},
  buttonText = '',
  buttonCancel = '',
  buttonExtra = null,
  id = '',
  styleFooter = {},
  iconClose = true,
  disabled = false,
  enScroll = false,
  reload = false,
  scrollViewHide = false,
  headerHide = false,
  onShow,
  right,
  onBack,
}: PropsType) => {
  const {toast, showToast}: any = useContext(AuthContext);
  const scrollViewRef: any = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(open);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [open]);

  useEffect(() => {
    if (open && enScroll) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: false});
      }, 100);
    }
  }, [open, children]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  if (!visible) return null;

  return (
    <ModalRN
      animationType="none"
      transparent={true}
      visible={visible}
      presentationStyle="overFullScreen"
      onShow={onShow}
      onRequestClose={() => {
        if (!iconClose) onClose('x');
      }}>
      <Animated.View
        style={{
          flex: 1,
          opacity: opacityAnim,
          backgroundColor: cssVar.cBlack,
        }}>
        <SafeAreaViewAndroid style={{flex: 1, backgroundColor: cssVar.cBlack}}>
          <SafeAreaView style={{flex: 1}}>
            <Form>
              <View style={{...theme.container}}>
                {!headerHide && (
                  <HeadTitle
                    title={title}
                    onBack={onBack ? onBack : () => onClose('x')}
                    onlyBack={open}
                    right={right}
                    iconClose={iconClose}
                    modalLayout={true}
                  />
                )}
                {scrollViewHide ? (
                  children
                ) : (
                  <ScrollView
                    ref={scrollViewRef}
                    refreshControl={
                      reload ? (
                        <RefreshControl
                          progressBackgroundColor={cssVar.cBlack}
                          colors={[cssVar.cAccent]}
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          tintColor={cssVar.cAccent}
                        />
                      ) : undefined
                    }
                    style={{
                      ...theme.body,
                      ...style,
                    }}>
                    {children}
                  </ScrollView>
                )}
                {(buttonText || buttonCancel || buttonExtra) && (
                  <View
                    style={{
                      ...theme.footer,
                      ...styleFooter,
                    }}>
                    {buttonText && (
                      <Button
                        variant="primary"
                        disabled={disabled}
                        onPress={(e: any) => {
                          e.stopPropagation();
                          onSave(id);
                        }}>
                        {buttonText}
                      </Button>
                    )}
                    {buttonCancel && (
                      <Button
                        variant="secondary"
                        onPress={(e: any) => {
                          e.stopPropagation();
                          onClose('cancel');
                        }}>
                        {buttonCancel}
                      </Button>
                    )}
                    {buttonExtra && buttonExtra}
                  </View>
                )}
              </View>
            </Form>
            <Toast toast={toast} showToast={showToast} />
          </SafeAreaView>
        </SafeAreaViewAndroid>
      </Animated.View>
    </ModalRN>
  );
};

const theme: ThemeType = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: cssVar.cBlack,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: cssVar.cBlack,
    borderBottomWidth: cssVar.bWidth,
    borderBottomColor: cssVar.cBlackV3,
  },
  headerText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sL,
    fontFamily: FONTS.bold,
    flexGrow: 1,
  },
  body: {
    padding: cssVar.spM,
    color: cssVar.cWhiteV3,
    width: '100%',
  },
  footer: {
    width: '100%',
    gap: cssVar.spS,
    marginBottom: cssVar.spM,
    paddingTop: cssVar.spS,
    flexDirection: 'row-reverse',
    paddingHorizontal: cssVar.spM,
    borderTopWidth: 0.5,
    borderTopColor: cssVar.cWhiteV1,
  },
};

export default ModalFull;
