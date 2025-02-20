import {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import Card from '../Card/Card';
import ModalFull from '../ModalFull/ModalFull';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import Input from '../../forms/Input/Input';
import {TextArea} from '../../forms/TextArea/TextArea';
import React from 'react';

export type TypeDetails = {
  title?: string;
  data: any;
  onSave?: (e?: any) => void;
  buttonText?: string;
  buttonCancel?: string;
  item?: any;
};

export type ItemInfoType = {
  l: string;
  v: any;
  sl?: TypeStyles;
  sv?: TypeStyles;
};
interface PropsType {
  details: TypeDetails;
  open?: boolean;
  onClose?: () => void;
  onSave?: Function;
  type?: 'M' | 'C' | 'L' | 'D';
  children?: any;
}

const ItemInfo = ({
  details,
  open = false,
  onSave = () => {},
  onClose = () => {},
  type = 'M',
  children = null,
}: PropsType) => {
  const [formStateI, setFormStateI]: any = useState({});
  const [errors, setErrors]: any = useState({});
  const handleInputChange = (
    name: string,
    value: string,
    validar?: Function,
  ) => {
    setFormStateI({
      ...formStateI,
      [name]: value,
    });
  };

  const _save = () => {
    onSave(formStateI);
  };

  const componente = (e: any) => {
    switch (e.type) {
      case 'TextArea':
        return (
          <View
            style={{
              width: '100%',
            }}>
            <TextArea
              label={e.label}
              name={e.name}
              value={formStateI[e.name]}
              onChange={value => handleInputChange(e.name, value)}
              style={{backgroundColor: cssVar.cBlackV2}}
            />
          </View>
        );
      case 'Input':
      case 'Input':
        return (
          <View
            style={{
              width: '100%',
            }}>
            <Input
              label={e.label}
              type={e.type}
              keyboardType={e.keyboardType}
              name={e.name}
              error={errors}
              required={true}
              value={formStateI[e.name]}
              onChange={(value: any) =>
                handleInputChange(e.name, value, e.validation)
              }
              style={{backgroundColor: cssVar.cBlackV2}}
            />
          </View>
        );

      default:
        return null;
    }
  };
  useEffect(() => {
    if (open) {
      details?.data?.map((e: any, i: number) => {
        if (e.l == '<d>') setFormStateI({...e.v});
      });
    }
  }, [open]);

  const ListItem = () => {
    return (
      <>
        {details?.data?.map((e: any, i: number) => (
          <View style={{flexDirection: 'row', gap: 0}} key={i + 'detail'}>
            {['<d>', '<c>', '<hr>'].findIndex(i => i == e.l) != -1 ? (
              <>
                {e.l == '<c>' && componente(e.v)}
                {e.l == '<hr>' && <View style={theme.border} />}
              </>
            ) : (
              <View style={theme.containerText}>
                <Text
                  style={{
                    ...theme.textEl,
                    ...(e.sl || {}),
                  }}>
                  {e.l}
                </Text>
                <Text
                  style={{
                    ...theme.textEv,
                    ...(e.sv || {}),
                  }}>
                  {e.v}
                </Text>
              </View>
            )}
          </View>
        ))}
      </>
    );
  };

  if (type == 'M')
    return (
      <ModalFull
        open={open}
        onClose={onClose}
        title={details?.title || ''}
        buttonText={details?.buttonText}
        onSave={_save}
        buttonCancel={details?.buttonCancel}>
        <Card style={{flex: 1, flexDirection: 'column', gap: 16}}>
          <ListItem />
          {children}
        </Card>
      </ModalFull>
    );
  if (type == 'C')
    return (
      <Card style={{flex: 1, flexDirection: 'column'}}>
        <ListItem />
        {children}
      </Card>
    );
  if (type == 'D')
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <ListItem />
        {children}
      </View>
    );
  if (type == 'L')
    return (
      <>
        <ListItem />
        {children}
      </>
    );
};

export default ItemInfo;

const theme: ThemeType = {
  border: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cWhite,
    width: '100%',
  },
  containerText: {
    flexDirection: 'row',
    paddingBottom: cssVar.spS,
    paddingHorizontal: cssVar.spS,
  },
  textEl: {
    width: '50%',
    textAlign: 'right',
    paddingRight: cssVar.spXs,
    color: cssVar.cWhiteV3,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
  },
  textEv: {
    width: '50%',
    paddingLeft: cssVar.spXs,
    color: cssVar.cWhite,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
  },
};
