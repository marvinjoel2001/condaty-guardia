import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Modal as ModalRN,
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Keyboard,
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
  typeAnimation?: 'slide' | 'fade' | 'book';
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
  typeAnimation = 'fade', // El valor predeterminado es 'slide'
  scrollViewHide = false,
  headerHide = false,
  onShow,
  right,
  onBack,
}: PropsType) => {
  const {toast, showToast}: any = useContext(AuthContext);
  const scrollViewRef: any = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (open) {
      if (enScroll) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: false});
        }, 100);
      }
    }
  }, [open, children]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ModalRN
      animationType={typeAnimation === 'book' ? 'none' : typeAnimation}
      transparent={true}
      onShow={onShow}
      visible={open}
      presentationStyle="overFullScreen"
      onRequestClose={() => {
        iconClose ? null : onClose('x');
      }}>
      <SafeAreaViewAndroid style={{flex: 1, backgroundColor: cssVar.cBlack}}>
        <SafeAreaView style={{flex: 1}}>
          <Form>
            <View
              style={{
                ...theme.container,
              }}>
              {!headerHide && (
                <HeadTitle
                  title={title}
                  onBack={onBack ? onBack : () => onClose('x')}
                  onlyBack={open}
                  right={right}
                  iconClose={iconClose}
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
                    borderTopWidth: cssVar.bWidth,
                  }}>
                  {buttonText && (
                    // <View
                    //   onTouchEnd={e => {
                    //     e.stopPropagation();
                    //     onSave(id);
                    //   }}
                    //   style={{height: 50, flexGrow: 1, flexBasis: 0}}>
                    <Button
                      variant="primary"
                      disabled={disabled}
                      style={{flexGrow: 1, flexBasis: 0}}
                      onPress={(e: any) => {
                        e.stopPropagation();
                        onSave(id);
                      }}>
                      {buttonText}
                    </Button>
                    // </View>
                  )}
                  {buttonCancel && (
                    // <View
                    //   onTouchEnd={e => {
                    //     e.stopPropagation();
                    //     onClose('cancel');
                    //   }}
                    //   style={{height: 50, flexGrow: 1, flexBasis: 0}}>
                    <Button
                      variant="secondary"
                      style={{flexGrow: 1, flexBasis: 0}}
                      onPress={(e: any) => {
                        e.stopPropagation();
                        onClose('cancel');
                      }}>
                      {buttonCancel}
                    </Button>
                    // </View>
                  )}
                  {buttonExtra && (
                    // <View style={{paddingHorizontal: cssVar.spM}}>
                    <View style={{flexGrow: 1, flexBasis: 0}}>
                      {buttonExtra}
                    </View>
                  )}
                </View>
              )}
            </View>
          </Form>
          <Toast toast={toast} showToast={showToast} />
        </SafeAreaView>
      </SafeAreaViewAndroid>
    </ModalRN>
  );
};

const theme: ThemeType = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: cssVar.cBlack,
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 10,
    overflow: 'hidden',
    // alignItems: 'center',
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
    // flexGrow: 1,
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
