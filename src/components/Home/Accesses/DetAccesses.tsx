import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Card from '../../../../mk/components/ui/Card/Card';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import useApi from '../../../../mk/hooks/useApi';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconCheck,
  IconCheckOff,
  IconDelivery,
  IconExpand,
  IconOther,
  IconTaxi,
} from '../../../icons/IconLibrary';
import useAuth from '../../../../mk/hooks/useAuth';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import ModalAccessExpand from './ModalAccessExpand';
import Br from '../../Profile/Br';
import Button from '../../../../mk/components/forms/Button/Button';
import Modal from '../../../../mk/components/ui/Modal/Modal';

const typeInvitation: any = {
  I: 'QR Individual',
  G: 'QR Grupal',
  C: 'Sin QR',
  O: 'Llave virtual',
  P: 'Pedido',
  F: 'QR Frecuente',
};
const DetAccesses = ({id, open, close, reload}: any) => {
  const {showToast, waiting} = useAuth();
  const {execute} = useApi();
  const [data, setData]: any = useState(null);
  const [acompanSelect, setAcompSelect]: any = useState([]);
  const [formState, setFormState]: any = useState({});
  const [openEnterSinQR, setOpenEnterSinQR]: any = useState(false);
  const [openDecline, setOpenDecline] = useState<string | null>(null);
  const [errors, setErrors] = useState({});
  const [openDet, setOpenDet]: any = useState({
    open: false,
    id: null,
    type: '',
    invitation: null,
  });

  const getData = async () => {
    try {
      const {data} = await execute(
        '/accesses',
        'GET',
        {
          fullType: 'DET',
          searchBy: id,
        },
        false
      );

      if (data.success && data.data.length > 0) {
        const accessData = data.data[0];
        if (accessData.access_id) {
          const {data: linkedData} = await execute('/accesses', 'GET', {
            fullType: 'DET',
            searchBy: accessData.access_id,
          });

          if (linkedData.success && linkedData.data.length > 0) {
            setData(linkedData.data[0]);
          }
        } else {
          setData(accessData);
        }
      }
    } catch (error) {
      showToast('Error al obtener los datos', 'error');
    }
  };

  const getStatus = (acceso: any = null) => {
    const _data = acceso || data;

    if (!_data?.in_at && !_data?.out_at && !_data?.confirm_at) return 'S';
    if (!_data?.in_at && !_data?.out_at && _data.confirm) return _data.confirm;
    if (_data?.in_at && !_data?.out_at) return 'I';

    if (_data?.out_at) {
      if (!_data?.accesses || _data.accesses.length === 0) return 'C';
      const todosHanSalido = _data.accesses.every((acomp: any) => acomp.out_at);
      return todosHanSalido ? 'C' : 'I';
    }
    if (_data?.confirm === 'N') return 'N';
    return '';
  };

  const status = getStatus();
  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  const saveEntry = async () => {
    const {data: result} = await execute(
      '/accesses/enter',
      'POST',
      {
        id: data?.id,
        obs_in: formState?.obs_in || '',
      },
      false    );
    if (result?.success) {
      if (reload) reload();
      close();
    } else {
      showToast('Error al dejar entrar', 'error');
    }
  };

  const saveExit = async () => {
    let ids = [];

    if (
      Object.values(acompanSelect).every(value => !value) &&
      data?.accesses?.length > 0
    ) {
      showToast('Debe seleccionar para dejar salir', 'error');
      return;
    }

    if (data?.accesses?.length > 0) {
      ids = Object.keys(acompanSelect)
        .filter(id => acompanSelect[id])
        .map(id => Number(id));
    } else {
      ids.push(data?.id);
    }

    const {data: result} = await execute('/accesses/exit', 'POST', {
      ids,
      obs_out: formState?.obs_out || '',
    });
    if (result?.success) {
      if (reload) reload();
      close();
      showToast('El visitante salió', 'success');
    } else {
      showToast('Error al dejar salir', 'error');
    }
  };
  const handleSave = async () => {
    if (status === 'C' || status === 'N') {
      close();
      return;
    }
    if (status === 'I') {
      saveExit();
    } else {
      saveEntry();
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormState({...formState, [name]: value});
  };

  const getButtonText = () => {
    const buttonTexts: Record<string, string> = {
      I: 'Dejar salir',
      Y: 'Dejar ingresar',
      S: '',
      C: '',
      N: 'Cerrar',
    };
    return buttonTexts[status] || '';
  };

  const labelAccess = () => {
    if (data?.type === 'O') {
      return 'Llave virtual';
    }
    if (status === 'I') {
      return 'Visitó a';
    }
    if (status === 'N') {
      return 'Residente';
    }

    return 'Visita a';
  };

  const cardDetail = () => {
    if (status != 'I') {
      return (
        <Card>
          <Text style={styles.labelAccess}>{labelAccess()}</Text>
          <ItemList
            title={getFullName(data?.owner)}
            subtitle={
              data?.owner?.dpto?.length
                ? 'Unidad: ' +
                  data?.owner?.dpto?.[0]?.nro +
                  ', ' +
                  data?.owner?.dpto?.[0]?.description
                : ''
            }
            left={
              <Avatar
                hasImage={data?.owner?.has_image}
                name={getFullName(data?.owner)}
                src={getUrlImages(
                  '/OWNER-' +
                    data?.owner?.id +
                    '.webp?d=' +
                    data?.owner?.updated_at,
                )}
              />
            }
            right={
              data?.type !== 'C' ? (
                <Icon
                  name={IconExpand}
                  color={cssVar.cWhiteV1}
                  onPress={() =>
                    setOpenDet({
                      open: true,
                      id: data?.invitation_id,
                      invitation: {...data?.invitation, owner: data?.owner},
                      type: 'I',
                    })
                  }
                />
              ) : null
            }
          />
          {data?.confirm == 'N' && data?.obs_confirm && (
            <KeyValue
              style={{marginTop: 12}}
              keys="Motivo del rechazo"
              value={data?.obs_confirm}
            />
          )}
          <Br />
          <View>{detailVisit(data)}</View>
        </Card>
      );
    } else {
      return (
        <>
          <Card>
            <Text style={styles.labelAccess}>{labelAccess()}</Text>
            <ItemList
              title={getFullName(data?.owner)}
              subtitle={
                data?.owner?.dpto?.length
                  ? 'Unidad: ' +
                    data?.owner?.dpto?.[0]?.nro +
                    ', ' +
                    data?.owner?.dpto?.[0]?.description
                  : ''
              }
              left={
                <Avatar
                  hasImage={data?.owner?.has_image}
                  name={getFullName(data?.owner)}
                  src={getUrlImages(
                    '/OWNER-' +
                      data?.owner?.id +
                      '.webp?d=' +
                      data?.owner?.updated_at,
                  )}
                />
              }
              right={
                data?.type !== 'C' ? (
                  <Icon
                    name={IconExpand}
                    color={cssVar.cWhiteV1}
                    onPress={() =>
                      setOpenDet({
                        open: true,
                        id: data?.invitation_id,
                        invitation: {...data?.invitation, owner: data?.owner},
                        type: 'I',
                      })
                    }
                  />
                ) : null
              }
            />
          </Card>
          {data?.accesses?.length > 0 && (
            <Text
              style={{
                color: cssVar.cWhite,
                fontSize: 16,
                fontFamily: FONTS.medium,
              }}>
              Selecciona al visitante que esté por salir
            </Text>
          )}
          <Card>
            <View>{detailVisit(data)}</View>
          </Card>
        </>
      );
    }
  };

  const toggleVisitSelection = (visitId: any) => {
    setAcompSelect({
      ...acompanSelect,
      [visitId]: !acompanSelect[visitId],
    });
  };

  const getCheckVisit = (
    visit: any,
    isSelected: boolean,
    type: 'A' | 'T' | 'I',
  ) => {
    const status = getStatus(visit);
    if (status == 'C') {
      return <Icon name={IconExpand} color={cssVar.cWhiteV1} />;
    }
    if (status == 'S' || status == 'N') return null;

    return (
      <Icon
        name={isSelected ? IconCheck : IconCheckOff}
        color={isSelected ? cssVar.cAccent : 'transparent'}
        fillStroke={isSelected ? 'transparent' : cssVar.cWhiteV1}
        onPress={() => toggleVisitSelection(visit?.id)}
      />
    );
  };

  const rightDetailVisit = (data: any, isSelected: any) => {
    if (data?.out_at) {
      return <Icon name={IconExpand} color={cssVar.cWhiteV1} />;
    }
    if (data?.accesses?.length == 0 || !data?.in_at) {
      return;
    }

    return getCheckVisit(data, isSelected, 'I');
  };
  const getAvatarVisit = (item: any) => {
    if (item?.type != 'P') {
      return (
        <Avatar
          name={getFullName(item.visit)}
          hasImage={item?.visit?.has_image}
        />
      );
    } else {
      const icon =
        item?.other?.other_type_id == 1
          ? IconDelivery
          : item?.other?.other_type_id == 2
          ? IconTaxi
          : IconOther;
      return (
        <View
          style={{
            padding: 8,
            backgroundColor: cssVar.cWhiteV1,
            borderRadius: '50%',
          }}>
          <Icon name={icon} color={cssVar.cPrimary} />
        </View>
      );
    }
  };
  const detailVisit = (data: any) => {
    let visit = data.visit ? data.visit : data.owner;

    const isSelected = acompanSelect[data?.id || '0'];
    const acompData = data?.accesses.filter((item: any) => item.taxi != 'C');
    const taxi = data?.accesses.filter((item: any) => item.taxi == 'C');

    return (
      <View>
        {data?.type !== 'O' && (
          <>
            <Text style={styles.labelAccess}>
              {status !== 'I' ? 'Visitante' : 'Detalle del visitante'}
            </Text>
            <ItemList
              key={data?.visit?.id}
              title={getFullName(visit)}
              onPress={() => {
                if (data?.out_at) {
                  setOpenDet({
                    open: true,
                    id: data?.id,
                    type: 'V',
                  });
                } else {
                  toggleVisitSelection(data?.id);
                }
              }}
              style={{marginBottom: 12}}
              subtitle={
                'C.I: ' +
                visit?.ci +
                (data?.plate && taxi?.length === 0
                  ? ' - Placa: ' + data?.plate
                  : '')
              }
              left={getAvatarVisit(data)}
              right={rightDetailVisit(data, isSelected)}
            />
          </>
        )}
        {!data?.out_at && (
          <>
            {data?.confirm != 'N' && (
              <KeyValue
                keys="Tipo de visita"
                value={typeInvitation[data?.type] || '-/-'}
              />
            )}
            {data?.in_at && (
              <KeyValue
                keys="Fecha y hora de ingreso"
                value={getDateTimeStrMes(data?.in_at) || '-/-'}
              />
            )}

            {getStatus() === 'S' || getStatus() === 'Y' ? (
              <KeyValue
                keys={'Notificado por'}
                value={getFullName(data?.guardia)}
              />
            ) : (
              data?.guardia &&
              data?.confirm != 'N' && (
                <KeyValue
                  keys={'Guardia de ingreso'}
                  value={getFullName(data?.guardia)}
                />
              )
            )}
            {data?.in_at && (
              <KeyValue
                keys="Observación de ingreso"
                value={data?.obs_in || '-/-'}
              />
            )}
            {data?.confirm_at && (
              <KeyValue
                keys={data?.confirm == 'Y' ? 'Aprobado por' : 'Rechazado por'}
                value={
                  <View
                    style={{
                      backgroundColor:
                        data?.rejected_guard_id !== null
                          ? '#F37F3D33'
                          : cssVar.cHoverSuccess,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                    }}>
                    <Text
                      style={{
                        color:
                          data?.rejected_guard_id !== null
                            ? cssVar.cAlertMedio
                            : cssVar.cSuccess,
                        fontSize: 12,
                      }}>
                      {data?.rejected_guard_id !== null
                        ? 'Guardia'
                        : 'Residente'}
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {acompData?.length > 0 && (
          <>
            {data?.type !== 'O' && <Br />}
            <Text style={styles.labelAccess}>Acompañantes</Text>
            {acompData.map((item: any) => (
              <ItemList
                key={item?.id}
                onPress={() => {
                  if (getStatus(item) == 'C' && status !== 'Y') {
                    setOpenDet({
                      open: true,
                      id: item?.id,
                      type: 'V',
                    });
                  } else if (status !== 'Y') {
                    toggleVisitSelection(item?.id);
                  }
                }}
                title={getFullName(item?.visit)}
                subtitle={'C.I:' + item?.visit?.ci}
                left={
                  <Avatar
                    name={getFullName(item?.visit)}
                    hasImage={item?.visit?.has_image}
                  />
                }
                right={
                  status === 'Y'
                    ? null
                    : getCheckVisit(item, acompanSelect[item?.id || '0'], 'A')
                }
              />
            ))}
          </>
        )}
        {taxi?.length > 0 && (
          <>
            <Br />
            <Text style={styles.labelAccess}>Taxista</Text>
            {taxi.map((item: any) => (
              <ItemList
                key={item?.id}
                onPress={() => {
                  if (getStatus(item) == 'C' && status !== 'Y') {
                    setOpenDet({
                      open: true,
                      id: item?.id,
                      type: 'V',
                    });
                  } else if (status !== 'Y') {
                    toggleVisitSelection(item?.id);
                  }
                }}
                title={getFullName(item?.visit)}
                subtitle={
                  'C.I:' + item?.visit?.ci + ' - ' + 'Placa: ' + item?.plate
                }
                left={
                  <Avatar
                    name={getFullName(item?.visit)}
                    hasImage={item?.visit?.has_image}
                  />
                }
                right={
                  status === 'Y'
                    ? null
                    : getCheckVisit(item, acompanSelect[item?.id || '0'], 'T')
                }
              />
            ))}
          </>
        )}
      </View>
    );
  };

  const getObs = () => {
    const status = getStatus();
    if (status == 'Y')
      return (
        <TextArea
          label="Observaciones de entrada"
          name="obs_in"
          value={formState?.obs_in}
          onChange={(e: any) => handleInputChange('obs_in', e)}
          placeholder="Ej: El visitante está ingresando con 2 mascotas"
        />
      );
    if (status == 'I')
      return (
        <TextArea
          label="Observaciones de salida"
          name="obs_out"
          value={formState?.obs_out}
          onChange={(e: any) => handleInputChange('obs_out', e)}
        />
      );
    return null;
  };

  const validate = () => {
    let errors: any = {};

    if (openEnterSinQR) {
      if (!formState?.obs_in || formState?.obs_in?.trim() === '') {
        errors.obs_in = 'Observaciones es requerido';
      }
    }

    if (openDecline) {
      if (!formState?.obs_confirm || formState?.obs_confirm?.trim() === '') {
        errors.obs_confirm = 'El motivo es requerido';
      }
    }

    setErrors(errors);
    return errors;
  };

  const onGuardRespond = async (confirm = 'N') => {
    const validationErrors = validate();

    if (!formState?.obs_confirm) {
      return;
    }
    const {data: confirma} = await execute('/accesses/confirm', 'POST', {
      confirm,
      id: data.id,
      obs_confirm: formState?.obs_confirm,
    });

    if (confirma?.success === true) {
      if (reload) {
        reload();
      }
      setOpenDecline(null);
      close();

      if (openDecline !== 'N') {
        showToast('Tu visita fue aprobada con éxito', 'success');
      } else {
        showToast('Visita rechazada', 'info');
      }
    } else {
      showToast('Ocurió un error', 'error');
    }
  };

  return (
    <ModalFull
      onClose={close}
      open={open}
      title={status != 'I' ? 'Visitante sin QR' : 'Detalle del ingreso'}
      onSave={handleSave}
      buttonText={getButtonText()}
      buttonExtra={
        status == 'S' &&
        !data?.in_at &&
        waiting <= 0 && (
          <View
            style={{
              display: 'flex',
              width: '100%',
              gap: '3%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{width: '35%'}}>
              <Button
                style={{}}
                variant="secondary"
                onPress={() => setOpenDecline('N')}>
                Rechazar
              </Button>
            </View>
            <View style={{width: '62%'}}>
              <Button
                style={{
                  backgroundColor: cssVar.cAccent,
                  borderColor: cssVar.cAccent,
                }}
                onPress={() => setOpenDecline('Y')}>
                Dejar ingresar
              </Button>
            </View>
          </View>
        )
      }>
      {!data ? (
        <Loading />
      ) : (
        <>
          {cardDetail()}
          {getObs()}
        </>
      )}
      {openDet.open && (
        <ModalAccessExpand
          open={openDet.open}
          type={openDet.type}
          invitation={openDet.invitation}
          id={openDet.id}
          onClose={() =>
            setOpenDet({open: false, id: null, type: '', invitation: null})
          }
        />
      )}

      {openDecline != null && (
        <Modal
          title={openDecline == 'Y' ? 'Dejar Ingresar' : 'Rechazar Ingreso'}
          open={openDecline !== null}
          buttonText="Enviar"
          onSave={() => onGuardRespond(openDecline)}
          onClose={() => setOpenDecline(null)}>
          <Text style={{color: cssVar.cWhite, marginBottom: 12}}>
            Por favor indica el motivo
          </Text>
          <TextArea
            required
            lines={4}
            name="obs_confirm"
            onChange={value => handleInputChange('obs_confirm', value)}
            label="Motivo"
            value={formState?.obs_confirm}
            error={errors}
            expandable={true}
          />
        </Modal>
      )}
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  label: {
    color: cssVar.cWhiteV1,
    fontSize: 12,
    fontFamily: FONTS.light,
  },
  labelAccess: {
    color: cssVar.cWhite,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});

export default DetAccesses;
