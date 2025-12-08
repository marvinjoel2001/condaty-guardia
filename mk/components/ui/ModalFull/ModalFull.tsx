import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Button from '../../forms/Button/Button';
import {AuthContext} from '../../../contexts/AuthContext';
import Toast from '../Toast/Toast';
import {cssVar, TypeStyles} from '../../../styles/themes';
import Form from '../../forms/Form/Form';
import HeadTitle from '../../layout/HeadTitle';
import {SafeAreaView as SafeAreaViewAndroid} from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

type PropsType = {
  children: React.ReactNode;
  onClose: (e: any) => void;
  open: boolean;
  onSave?: (e: any) => void;
  onShow?: () => void;
  title?: string;
  style?: TypeStyles;
  buttonText?: string;
  buttonCancel?: string;
  buttonExtra?: React.ReactNode;
  id?: string;
  styleFooter?: TypeStyles;
  iconClose?: boolean;
  right?: React.ReactNode;
  disabled?: boolean;
  enScroll?: boolean;
  reload?: () => Promise<void>;
  scrollViewHide?: boolean;
  onBack?: () => void;
  headerHide?: boolean;
  disableFormPress?: boolean;
};

const ModalFull = memo(
  ({
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
    reload,
    scrollViewHide = false,
    headerHide = false,
    onShow,
    right,
    onBack,
    disableFormPress = false,
  }: PropsType) => {
    const {toast, showToast}: any = useContext(AuthContext);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [visible, setVisible] = useState(open);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      if (open) {
        setVisible(true);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 150,
            mass: 0.7,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false));
      }
    }, [open]);

    useEffect(() => {
      if (open && enScroll) {
        const timeout = setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: false});
        }, 100);
        return () => clearTimeout(timeout);
      }
    }, [open, children, enScroll]);

    const onRefresh = useCallback(async () => {
      if (!reload) return;
      setRefreshing(true);
      await reload();
      setRefreshing(false);
    }, [reload]);

    if (!visible) return null;

    return (
      <Modal
        style={{margin: 0}}
        coverScreen
        isVisible={visible}
        onBackdropPress={() => !iconClose && onClose('x')}
        onBackButtonPress={() => !iconClose && onClose('x')}
        onShow={onShow}
        animationIn="fadeIn"
        animationOut="fadeOut">
        <SafeAreaViewAndroid style={{flex: 1}}>
          <SafeAreaView style={{flex: 1}}>
            <Form pressable={!disableFormPress}>
              <View style={theme.container}>
                {!headerHide && (
                  <HeadTitle
                    title={title}
                    onBack={onBack ?? (() => onClose('x'))}
                    onlyBack={open}
                    right={right}
                    iconClose={iconClose}
                    modalLayout
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
                    style={[theme.body, style]}
                    contentContainerStyle={{paddingBottom: 20}}
                    keyboardShouldPersistTaps="handled">
                    <TouchableOpacity activeOpacity={1} style={{flex: 1}}>
                      {children}
                    </TouchableOpacity>
                  </ScrollView>
                )}

                {(buttonText || buttonCancel || buttonExtra) && (
                  <View style={[theme.footer, styleFooter]}>
                    {buttonText && (
                      <Button
                        variant="primary"
                        disabled={disabled}
                        onPress={(e: any) => {
                          onSave(id);
                        }}>
                        {buttonText}
                      </Button>
                    )}
                    {buttonCancel && (
                      <Button
                        variant="secondary"
                        onPress={(e: any) => {
                          onClose('cancel');
                        }}>
                        {buttonCancel}
                      </Button>
                    )}
                    {buttonExtra}
                  </View>
                )}
              </View>
            </Form>
            <Toast toast={toast} showToast={showToast} />
          </SafeAreaView>
        </SafeAreaViewAndroid>
        {/* </Animated.View> */}
      </Modal>
    );
  },
);

const theme = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: cssVar.cBlack,
    overflow: 'hidden',
    width: '100%',
  },
  body: {
    padding: cssVar.spM,
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
});

export default ModalFull;
