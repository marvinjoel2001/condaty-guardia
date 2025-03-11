import React, {useEffect, useContext, useState} from "react";
import useAuth from "../../../../mk/hooks/useAuth";
import Icon from "../../../../mk/components/ui/Icon/Icon";
import { IconCheck, IconCheckOff, IconDelivery, IconOther, IconTaxi } from "../../../icons/IconLibrary";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getDateStrMes, getDateTimeStrMes } from "../../../../mk/utils/dates";
import { getFullName, getUrlImages } from "../../../../mk/utils/strings";
import Avatar from "../../../../mk/components/ui/Avatar/Avatar";
import { cssVar, FONTS } from "../../../../mk/styles/themes";
import DataSearch from "../../../../mk/components/ui/DataSearch";
import List from "../../../../mk/components/ui/List/List";
import { ItemInfoType, TypeDetails } from "../../../../mk/components/ui/ItemInfo/ItemInfo";
import ItemListDate from "../ItemListDate/ItemListDate";
import { ItemList } from "../../../../mk/components/ui/ItemList/ItemList";
import DetailAccess from "./DetailAccess";
import SearchBar from "../../SearchBar/SearchBar";


type Props = {
  api: {data: any; reload: Function; execute: Function; loaded: boolean};
  parametros: any;
  screenParams?: [any, Function];
  lista?: [];
  isHome?: boolean;
  setOpenDropdown?: any;
  edit?: boolean;
};
const Accesses = ({
  api,
  parametros,
  lista = [],
  screenParams = [null, () => {}],
  isHome,
  setOpenDropdown,
  edit,
}: Props) => {
  // const {theme} = useContext(ThemeContext);
  const [errors, setErrors]: any = React.useState({});
  const [formState, setFormState]: any = React.useState({});
  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };
  const [dataScreen, setDataScreen]: any = screenParams;
  const [params, setParams] = parametros;
  const {data, reload, execute, loaded} = api;
  const [openDetail, setOpenDetail] = useState(false);
  const [details, setDetails] = useState<TypeDetails>({title: "", data: []});
  const [search, setSearch] = useState("");
  const {showToast, setStore} = useAuth();
  const [acompanantes, setAcompanantes]: any = useState([]);
  const [acompSelect, setAcompSelect]: any = useState([]);
  const onSearch = (search: string) => {
    setSearch(search);
  };

  let taxiAnt = "";

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
        {details.buttonText != "" &&
        !acompanante?.out_at &&
        acompanante?.in_at ? (
          <Icon
            name={isSelected ? IconCheck : IconCheckOff}
            color={isSelected ? cssVar.cAccent : "transparent"}
            fillStroke={!isSelected ? cssVar.cWhite : ""}
          />
        ) : (
          ""
        )}
      </>
    );
  };

  const Horas1 = ({acompanante, fecha = ""}: any) => {
    return (
      <ItemListDate
        data1={acompanante?.in_at}
        data2={acompanante?.out_at}
        date={fecha}
      />
    );
  };

  const acompanatesList = (acompanante: any) => {
    let mensaje = "";
    if (acompanante.taxi !== taxiAnt) {
      taxiAnt = acompanante.taxi;
      if (acompanante.taxi == "C") {
        mensaje = `Conductor`;
      } else {
        mensaje = `Acompañantes`;
      }
    }

    const isSelected = acompSelect.some((a: any) => a.id === acompanante.id);
    return (
      <>
        {mensaje !== "" && <Text style={styles.label}>{mensaje}</Text>}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleSelectAcomp(acompanante.id)}>
          <ItemList
            style={{backgroundColor: cssVar.cBlackV1}}
            title={getFullName(acompanante?.visit)}
            subtitle={"C.I. " + acompanante.visit?.ci}
            subtitle2={
              acompanante.taxi == "C" ? "Placa: " + acompanante.plate : ""
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
  
  useEffect(() => {
    if (dataScreen && data?.data) {
      const item = data.data.find((item: any) => item.id == dataScreen);
      if (item) {
        _onDetail(item);
      }
      setDataScreen(null);
    }
  }, [dataScreen, data?.data]);

  const _onDetail = async (_item: any) => {
    let item = _item;
    let canS = false;
    if (item?.in_at && !item.out_at) {
      canS = true;
    }
    if (!canS) {
      item?.accesses?.map((acon: any) => {
        if (acon.in_at && !acon.out_at) {
          canS = true;
        }
      });
    }
    if (item.access_id) {
      if (lista.length > 0) {
        item = lista.find((e: any) => e.id == _item.access_id);
      } else {
        item = data?.data.find((e: any) => e.id == _item.access_id);
      }
      if (!item) {
        const paramsInitialA = {
          perPage: 50,
          page: 1,
          sortBy: "accesses.created_at,in_at",
          cols: "accesses.*",
          orderBy: "desc,desc",
          joins: "visits|owners",
          relations:
            "invitation|visit|owner|other:id,other_type_id|other.otherType:id,name|guardia|out_guard|accesses.visit",
          searchBy: "id,=," + _item.access_id,
        };

        const {data: row} = await api.execute(
          "/accesses",
          "GET",
          paramsInitialA,
          false,
          2,
        );
        if (row?.success == true) {
          item = row?.data[0];
        }
      }
    }
    item?.accesses?.sort((a: any, b: any) => {
      if (a.taxi < b.taxi) {
        return -1;
      }
    });

    const _data: ItemInfoType[] = [];
    let v = "";
    let buttonText = "";
    setFormState({...item, id: item?.id});
    if (item?.type == "O") {
      _data.push({
        l: "Tipo de acceso",
        v: "QR Llave Virtual",
      });
      _data.push({
        l: "Fecha de ingreso",
        v: getDateTimeStrMes(item?.in_at),
      });
      _data.push({
        l: "Residente",
        v: getFullName(item.owner),
      });
      _data.push({
        l: "Guardia de entrada",
        v: getFullName(item.guardia),
      });
    } else {
      v = item?.out_at
        ? "Completado"
        : !item?.confirm_at
        ? "Por confirmar"
        : item?.in_at
        ? "Por Salir"
        : item?.confirm == "Y"
        ? "Por Entrar"
        : "Denegado";
      _data.push({
        l: "Estado",
        v: v,
        sv: {
          color:
            v == "Denegado"
              ? cssVar.cError
              : cssVar.cWhite,
        },
      });

      _data.push({
        l: "Tipo de acceso",
        v:
          item?.type == "P"
            ? "Pedido-" + item?.other?.other_type.name
            : item?.type == "I"
            ? "QR Individual"
            : item?.type == "C"
            ? "Sin QR"
            : item?.type == "G"
            ? "QR Grupal"
            : "QR Llave Virtual",
      });
      if (item?.type === "I" || item?.type === "G") {
        if (item.type === "G") {
          _data.push({l: "Evento", v: item.invitation?.title});
        }
        _data.push({
          l: "Fecha de invitación",
          v: getDateStrMes(item.invitation?.date_event),
        });

        item.invitation?.obs &&
          _data.push({l: "Descripción", v: item.invitation?.obs});
      }
      if (item?.type == "P") {
        _data.push({l: "Conductor", v: getFullName(item.visit)});
      } else {
        // _data.push({l: "Visitante", v: item?.visit?.name});
      }

      if (item?.plate && !item.taxi) _data.push({l: "Placa", v: item.plate});

      if (item?.in_at && item.out_at) {
        _data.push({l: "Visitó a", v: getFullName(item?.owner)});
      } else {
        _data.push({l: "Visita a", v: getFullName(item?.owner)});
      }

      if (v == "Denegado") {
        _data.push({
          l: "Fecha de denegación",
          v: getDateStrMes(item?.confirm_at),
        });
        _data.push({l: "Motivo", v: item?.obs_confirm});
      }

      if (item?.out_at) {
        _data.push({l: "Guardia de entrada", v: getFullName(item?.guardia)});
        item?.out_guard &&
          item?.guardia?.id != item?.out_guard?.id &&
          _data.push({
            l: "Guardia de salida",
            v: getFullName(item?.out_guard),
          });
        (item?.obs_in ||
          item?.obs_out ||
          item?.obs_confirm ||
          item?.obs_guard) &&
          item?.obs_guard;
        item?.obs_guard &&
          _data.push({l: "Obs. de solicitud", v: item?.obs_guard});
        item?.obs_in && _data.push({l: "Obs. de entrada", v: item?.obs_in});
        item?.obs_out && _data.push({l: "Obs. de salida", v: item?.obs_out});
      } else {
        (item?.obs_in || item?.obs_out || item?.obs_confirm) && item?.obs_in
          ? _data.push({l: "Obs. de entrada", v: item?.obs_in})
          : item?.obs_out
          ? _data.push({l: "Obs. de salida", v: item?.obs_out})
          : "";
      }

      if (item?.accesses) setAcompanantes(item.accesses);

      edit &&
        (buttonText = canS
          ? "Dejar salir"
          : item?.confirm_at && item?.confirm == "Y"
          ? !item.in_at
            ? "Dejar entrar"
            : ""
          : "");
    }

    const buttonCancel = "";
    setDetails({
      data: _data,
      title: "Detalle de acceso",
      buttonText,
      buttonCancel,
    });
    setOpenDetail(true);
  };
  const icono = (item: any) => {
    let icon: any = "";
    if (item.type == "P" && item.other?.otherType?.name == "Taxi") {
      icon = IconTaxi;
    }
    if (item.type == "P" && item.other?.otherType?.name == "Mensajeria") {
      icon = IconOther;
    }
    if (item.type == "P" && item.other?.otherType?.name == "Delivery") {
      icon = IconDelivery;
    }
    if (item.type == "P" && item.other?.otherType?.name == "Otro") {
      icon = IconOther;
    }

    if (item.type == "P") {
      <Icon
        style={{
          backgroundColor: cssVar.cWhite,
          padding: 8,
          borderRadius: 50,
        }}
        name={icon}
        color={cssVar.cBlack}
        size={24}
      />;
    }
    return (
      <Avatar
        src={getUrlImages(
          item.type == "O"
            ? "/OWN-" + item.owner_id + ".png?d=" + item.updated_at
            : "/VISIT-" + item.visit?.id + ".png?d=" + item.updated_at,
        )}
        name={
          item.type == "O" ? getFullName(item.owner) : getFullName(item.visit)
        }
      />
    );
  };

  const subtitle = (item: any) => {
    if (item.type == "O") {
      return "uso LLAVE VIRTUAL QR";
    }

    if (item.type == "P" && item.other?.otherType?.name == "Taxi") {
      return "Recogió a: " + getFullName(item.owner);
    }
    if (item.type == "P" && item.other?.otherType?.name == "Mensajeria") {
      return "Entregó a: " + getFullName(item.owner);
    }
    if (item.type == "P" && item.other?.otherType?.name == "Delivery") {
      return "Entregó a: " + getFullName(item.owner);
    }
    if (item.type == "P" && item.other?.otherType?.name == "Otro") {
      return "Para: " + getFullName(item.owner);
    }
    // Denegado por
    if (item?.confirm === "N" && item?.obs_confirm) {
      return "Denegado por: " + getFullName(item.owner);
    }
    if (!item?.in_at) {
      return "Visita a: " + getFullName(item.owner);
    }

    return "Visitó a: " + getFullName(item.owner);
  };

  const right = (item: any) => {
    if (!item?.in_at && !item?.confirm_at) {
      return (
        <Text style={{...styles.text, fontSize: 10}}>
          Esperando Confirmación
        </Text>
      );
    }
    if (!item?.in_at && item?.confirm_at && item?.confirm == "Y") {
      return (
        edit && (
          <TouchableOpacity
            style={{
              backgroundColor:cssVar.cAccent,
              borderRadius: 10,
            }}
            onPress={() => {
              _onDetail(item);
            }}
            accessibilityLabel={"Dejar entrar a " + getFullName(item.visit)}>
            <Text
              style={styles.leaveButton}>
              Dejar entrar
            </Text>
          </TouchableOpacity>
        )
      );
    }

    if (item?.type != "O" && item?.in_at && !item?.out_at) {
      return (
        edit && (
          <TouchableOpacity
            style={{...styles.button, borderRadius: 10}}
            onPress={() => {
              _onDetail(item);
            }}
            accessibilityLabel={"Ver detalles de " + getFullName(item.visit)}>
            <Text
              style={{
                color: styles.button?.borderColor,
                paddingHorizontal: 10,
                paddingVertical: 4,
                fontSize: 10,
                fontFamily: FONTS.regular,
              }}>
              Dejar salir
            </Text>
          </TouchableOpacity>
        )
      );
    }

    if (!item?.in_at && item?.confirm_at && item?.confirm == "N") {
      return (
        <Text
          style={{
            ...styles.text,
            fontSize: 10,
            color: cssVar.cError,
          }}>
          No Autorizado
        </Text>
      );
    }
  };
  const horas = (item: any) => {
    return (
      <ItemListDate
        data1={item.in_at}
        data2={item.type != "O" ? item.out_at : null}
        date={antFec}
      />
    );
  };
  let antFec = "";
  const Item = (item: any) => {

    if (
      search != "" &&
      ("" + getFullName(item.visit))
        .toLowerCase()
        .indexOf(search.toLowerCase()) < 0
    )
      return null;

    return (
      <>
        {/* {sep} */}
        <TouchableOpacity
          accessibilityLabel={
            "Ver detalles de " +
            (item.type == "O"
              ? getFullName(item?.owner)
              : getFullName(item?.visit))
          }
          onPress={() => {
            // _onDetail(item);
            setFormState({...formState, id: item.id});

            setOpenDetail(true);
          }}>
          <ItemList
            title={
              item.type == "O"
                ? getFullName(item?.owner)
                : getFullName(item?.visit)
            }
            subtitle={subtitle(item)}
            left={icono(item)}
            right={right(item)}
            date={horas(item)}
            widthMain={150}
          />
        </TouchableOpacity>
      </>
    );
  };

  const isSelected = acompSelect.some((a: any) => a.id === formState?.id);
  // item?.type == "O"

  return (
    <>
      {!isHome ? (
        <SearchBar
          search={search}
          name="Accesos"
          onSearch={onSearch}
          setOpenDropdown={setOpenDropdown}
        />
      ) : (
        <DataSearch setSearch={onSearch} name="Accesos" value={search} />
      )}

      {data?.data.length == 0 ? (
        <View
          style={styles.center}>
          <Text style={styles.label}>Aquí se verá tu lista</Text>
        </View>
      ) : (
        <List
          style={{}}
          data={data?.data}
          renderItem={Item}
          refreshing={!loaded}
        />
      )}
      <DetailAccess
        id={formState?.id}
        open={openDetail}
        close={() => setOpenDetail(false)}
        reload={reload}
        edit={edit}
        screenParams={screenParams}
      />
    </>
  );
};

export default Accesses;


const styles = StyleSheet.create({
  
    container: {
      backgroundColor: cssVar.cBlackV2,
      borderRadius: 16,
      padding: 12,
      marginVertical: 8,
    },
    label: {
      color: cssVar.cWhiteV2,
      fontSize: 12,
      fontFamily: FONTS.light,
    },
    text: {
      color: cssVar.cWhite,
      fontSize: 14,
      fontFamily: FONTS.regular,
    },
    button: {
      backgroundColor: "transparent",
      color: cssVar.cWhiteV2,
      borderWidth: 1,
      borderColor: cssVar.cWhiteV2,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center", 
    },
    leaveButton:{
      color: cssVar.cBlack,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginTop: 1,
      fontSize: 10,
      fontFamily: FONTS.regular,
    }
})