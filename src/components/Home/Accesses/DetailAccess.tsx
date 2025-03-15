import React, {useContext, useEffect, useState} from 'react';
import useAuth from '../../../../mk/hooks/useAuth';
import ItemInfo, {
  ItemInfoType,
  TypeDetails,
} from '../../../../mk/components/ui/ItemInfo/ItemInfo';
import useApi from '../../../../mk/hooks/useApi';
import {getDateStrMes, getDateTimeStrMes} from '../../../../mk/utils/dates';
import {getFullName} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconCheck, IconCheckOff} from '../../../icons/IconLibrary';
import ItemListDate from './shares/ItemListDate';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import List from '../../../../mk/components/ui/List/List';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';

interface PropsType {
  open: boolean;
  close: any;
  id: any;
  reload: any;
  edit?: any;
  screenParams?: any;
}

const DetailAccess = ({
  reload,
  open,
  close,
  edit,

  id,
  screenParams,
}: PropsType) => {
  const [details, setDetails] = useState<TypeDetails>({title: '', data: []});
  const [acompSelect, setAcompSelect]: any = useState([]);
  const [formState, setFormState]: any = React.useState({});
  // const {theme} = useContext(ThemeContext);
  const [_id, setID] = useState(0);
  const [acompanantes, setAcompanantes]: any = useState([]);
  const {showToast, setStore} = useAuth();
  const {execute} = useApi();
  const [dataScreen, setDataScreen]: any = screenParams;
  

  const getData = async (id: number) => {
    // console.log(id, "ID");
    const {data,error} = await execute(
      '/accesses',
      'GET',
      {
        fullType: 'DET',
        searchBy: id,
      },
       false,2
    );

    if (data?.success) {
      setFormState((old: any) => data.data);

      _onDetail(data.data);
   
      console.log("DATAAAA", JSON.stringify(data.data, null, 5));
    } else {
      showToast(data?.message, 'error');
      console.log('Error:', error);
      return;
    }
  };
  console.log(formState,'sasasas')
  useEffect(() => {
    getData(id);
    setID(0);
  }, [id, open]);

  useEffect(() => {
    if (dataScreen && formState) {
      const item = formState.find((item: any) => item.id == dataScreen);
      if (item) {
        _onDetail(item);
      }
      setDataScreen(null);
    }
  }, [dataScreen, formState]);

  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const _onDetail = async (_item: any) => {
    let item = _item;
    let canS = false;
    if (item?.in_at && !item?.out_at) {
      canS = true;
    }
    if (!canS) {
      item?.accesses?.map((acon: any) => {
        if (acon.in_at && !acon.out_at) {
          canS = true;
        }
      });
    }
    if (item?.access_id) {
      const paramsInitialA = {
        perPage: 1,
        page: 1,
        sortBy: 'accesses.created_at,in_at',
        type_list: 'AD',
        cols: 'accesses.*',
        orderBy: 'desc,desc',
        joins: 'visits|owners',
        relations:
          'invitation|visit|owner|other:id,other_type_id|other.otherType:id,name|guardia|out_guard|accesses.visit',
        searchBy: _item?.access_id,
      };
    
      // const {data: row} = await execute('/accesses', 'GET', paramsInitialA);
      
      const {data:row} = await execute(
        '/accesses',
        'GET',
        {
          fullType: 'AD',
          searchBy: _item?.access_id,
        },
      );
      
      if (row?.success == true) {
        item = row?.data;
        setFormState(item);
      }
    }
    setID(item?.id);
    item?.accesses?.sort((a: any, b: any) => {
      if (a.taxi < b.taxi) {
        return -1;
      }
    });

    const _data: ItemInfoType[] = [];
    let v = '';
    let buttonText = '';
    // setFormState({...item, id: item?.id});
    if (item?.type == 'O') {
      _data.push({
        l: 'Tipo de acceso',
        v: 'QR Llave Virtual',
      });
      _data.push({
        l: 'Fecha de ingreso',
        v: getDateTimeStrMes(item?.in_at),
      });
      _data.push({
        l: 'Residente',
        v: getFullName(item?.owner),
      });
      _data.push({
        l: 'Guardia de entrada',
        v: getFullName(item?.guardia),
      });
    } else {
      v = item?.out_at
        ? 'Completado'
        : !item?.confirm_at
        ? 'Por confirmar'
        : item?.in_at
        ? 'Por Salir'
        : item?.confirm == 'Y'
        ? 'Por Entrar'
        : 'Denegado';
      _data.push({
        l: 'Estado',
        v: v,
        sv: {
          color: v == 'Denegado' ? cssVar.cError : cssVar.cWhite,
        },
      });

      _data.push({
        l: 'Tipo de acceso',
        v:
          item?.type == 'P'
            ? 'Pedido-' + item?.other?.other_type.name
            : item?.type == 'I'
            ? 'QR Individual'
            : item?.type == 'C'
            ? 'Sin QR'
            : item?.type == 'G'
            ? 'QR Grupal'
            : 'QR Llave Virtual',
      });
      if (item?.type === 'I' || item?.type === 'G') {
        if (item?.type === 'G') {
          _data.push({l: 'Evento', v: item?.invitation?.title});
        }
        _data.push({
          l: 'Fecha de invitación',
          v: getDateStrMes(item?.invitation?.date_event),
        });

        item?.invitation?.obs &&
          _data.push({l: 'Descripción', v: item?.invitation?.obs});
      }
      if (item?.type == 'P') {
        _data.push({l: 'Conductor', v: getFullName(item?.visit)});
      } else {
        // _data.push({l: "Visitante", v: item?.visit?.name});
      }

      if (item?.plate && !item?.taxi) _data.push({l: 'Placa', v: item?.plate});

      if (item?.in_at && item?.out_at) {
        _data.push({l: 'Visitó a', v: getFullName(item?.owner)});
      } else {
        _data.push({l: 'Visita a', v: getFullName(item?.owner)});
      }

      if (v == 'Denegado') {
        _data.push({
          l: 'Fecha de denegación',
          v: getDateStrMes(item?.confirm_at),
        });
        _data.push({l: 'Motivo', v: item?.obs_confirm});
      }

      if (item?.out_at) {
        _data.push({l: 'Guardia de entrada', v: getFullName(item?.guardia)});
        item?.out_guard &&
          item?.guardia?.id != item?.out_guard?.id &&
          _data.push({
            l: 'Guardia de salida',
            v: getFullName(item?.out_guard),
          });
        (item?.obs_in ||
          item?.obs_out ||
          item?.obs_confirm ||
          item?.obs_guard) &&
          item?.obs_guard;
        item?.obs_guard &&
          _data.push({l: 'Obs. de solicitud', v: item?.obs_guard});
        item?.obs_in && _data.push({l: 'Obs. de entrada', v: item?.obs_in});
        item?.obs_out && _data.push({l: 'Obs. de salida', v: item?.obs_out});
      } else {
        (item?.obs_in || item?.obs_out || item?.obs_confirm) && item?.obs_in
          ? _data.push({l: 'Obs. de entrada', v: item?.obs_in})
          : item?.obs_out
          ? _data.push({l: 'Obs. de salida', v: item?.obs_out})
          : '';
      }

      if (item?.accesses) setAcompanantes(item?.accesses);

      edit &&
        (buttonText = canS
          ? 'Dejar salir'
          : item?.confirm_at && item?.confirm == 'Y'
          ? !item?.in_at
            ? 'Dejar entrar'
            : ''
          : '');
    }

    const buttonCancel = '';
    setDetails({
      data: _data,
      title: 'Detalle de acceso',
      buttonText,
      buttonCancel,
    });
    //setOpenDetail(true);
  };
  const handleSelectAcomp = (id: any) => {
    const isSelected = acompSelect.some((a: any) => a.id === id);

    if (!isSelected) {
      const updatedAcompanantes = [...acompSelect, {id}];
      setAcompSelect((old: any) => updatedAcompanantes);
    } else {
      const updatedAcompanantes = acompSelect.filter((a: any) => a.id !== id);
      setAcompSelect((old: any) => updatedAcompanantes);
    }
  };

  const RightItem = ({acompanante, isSelected}: any) => {
    return (
      <>
        {details.buttonText != '' &&
        !acompanante?.out_at &&
        acompanante?.in_at ? (
          <Icon
            name={isSelected ? IconCheck : IconCheckOff}
            color={isSelected ? cssVar.cSuccess : 'transparent'}
            fillStroke={!isSelected ? cssVar.cWhite : ''}
          />
        ) : (
          ''
        )}
      </>
    );
  };

  const Horas1 = ({acompanante, fecha = ''}: any) => {
    return (
      <ItemListDate
        inDate={acompanante?.in_at}
        outDate={acompanante?.out_at}
        // date={fecha}
      />
    );
  };

  let taxiAnt = '';
  const acompanatesList = (acompanante: any) => {
    let mensaje = '';
    if (acompanante.taxi !== taxiAnt) {
      taxiAnt = acompanante.taxi;
      if (acompanante.taxi == 'C') {
        mensaje = `Conductor`;
      } else {
        mensaje = `Acompañantes`;
      }
    }

    const isSelected = acompSelect.some((a: any) => a.id === acompanante.id);
    return (
      <>
        {mensaje !== '' && <Text style={styles.label}>{mensaje}</Text>}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleSelectAcomp(acompanante.id)}>
          <ItemList
            style={{backgroundColor: cssVar.cBlackV1}}
            title={getFullName(acompanante?.visit)}
            subtitle={'C.I. ' + acompanante.visit?.ci}
            subtitle2={
              acompanante.taxi == 'C' ? 'Placa: ' + acompanante.plate : ''
            }
            left={<Avatar name={getFullName(acompanante.visit)} />}
            right={
              <RightItem
                acompanante={acompanante}
                isSelected={isSelected}
                fecha={formState?.in_at}
              />
            }
            date={<Horas1 acompanante={acompanante} fecha={formState?.in_at} />}
          />
        </TouchableOpacity>
      </>
    );
  };

  const onIn = async (acceso: any) => {
    // console.log("acceso", acceso);
    const {data: In, error: err} = await execute('/accesses/enter', 'POST', {
      id: formState?.id,
      obs_in: formState?.obs_in,
    });
    if (In?.success == true) {
      reload();
      close();
      showToast('El visitante ingresó', 'success');
    } else {
      showToast(err, 'error');
    }
  };
  const onOut = async (acceso: any) => {
    let idAcom: any = [];
    acompSelect.map((acom: any) => {
      idAcom.push(acom.id);
    });

    if (idAcom.length == 0) {
      showToast('Necesita seleccionar', 'warning');
      return;
    }
    const {data: In, error: err} = await execute(
      '/accesses/exit',
      'POST',
      {
        ids: idAcom,
        obs_out: formState?.obs_out,
      },
      false,
      3,
    );
    if (In?.success == true) {
      reload();
      close();
      setAcompSelect([]);
      showToast('El visitante salió', 'success');
    } else {
      showToast(err, 'error');
    }
  };

  const isSelected = acompSelect.some((a: any) => a.id === formState?.id);
  return (
    <ItemInfo
      details={
        formState?.id != _id ? {title: 'Detalle de acceso', data: []} : details
      }
      onSave={details.buttonText == 'Dejar entrar' ? onIn : onOut}
      onClose={() => {
        close();
        setAcompSelect([]);
      }}
      open={open}>
      {formState?.id != _id ? (
        <>
          <ActivityIndicator
            style={{height: 220}}
            color={cssVar.cSuccess}
            size="large"
          />
        </>
      ) : (
        <>
          {details.buttonText != '' &&
            formState?.accesses?.length > 0 &&
            formState?.in_at &&
            !formState?.out_at &&
            formState?.confirm_at && (
              <Text
                style={{
                  color: cssVar.cWhiteV2,
                  fontFamily: 'Poppins Regular',
                  marginVertical: 6,
                }}>
                Seleccione para dejar salir:
              </Text>
            )}
          {formState?.type != 'O' && (
            <>
              <Text style={styles.label}>Visitante</Text>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleSelectAcomp(formState?.id)}>
                <ItemList
                  title={getFullName(formState?.visit)}
                  subtitle={'C.I. ' + formState?.visit?.ci}
                  style={{
                    backgroundColor: cssVar.cBlackV1,
                  }}
                  subtitle2={
                    formState?.accesses?.length == 0 && formState?.plate
                      ? 'Placa: ' + formState?.plate
                      : ''
                  }
                  left={<Avatar name={getFullName(formState?.visit)} />}
                  right={
                    <RightItem
                      acompanante={formState}
                      isSelected={isSelected}
                    />
                  }
                  date={
                    <Horas1 acompanante={formState} fecha={formState?.in_at} />
                  }
                />
              </TouchableOpacity>
            </>
          )}
          {formState?.type != 'O' && (
            <List
              data={acompanantes}
              emptyLabel=""
              renderItem={acompanatesList}
            />
          )}

          {details.buttonText == 'Dejar entrar' && (
            <TextArea
              label="Observaciones de Entrada"
              name="obs_in"
              value={formState?.obs_in}
              onChange={value => handleInputChange('obs_in', value)}
              style={{backgroundColor: cssVar.cBlack}}
            />
          )}
          {details.buttonText == 'Dejar salir' && (
            <TextArea
              label="Observaciones de Salida"
              name="obs_out"
              value={formState?.obs_out}
              onChange={value => handleInputChange('obs_out', value)}
              style={{backgroundColor: cssVar.cBlack}}
            />
          )}
        </>
      )}
    </ItemInfo>
  );
};

export default DetailAccess;

const styles = StyleSheet.create({
  label: {
    color: cssVar.cWhiteV2,
    fontSize: 12,
    fontFamily: FONTS.light,
  },
});
