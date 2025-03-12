import React, {useContext, useEffect, useState} from "react";
import { TypeDetails } from "../../../../mk/components/ui/ItemInfo/ItemInfo";
import useAuth from "../../../../mk/hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { onExist } from "../../../../mk/utils/dbtools";
import { getFullName } from "../../../../mk/utils/strings";
import { getDateTimeStrMes } from "../../../../mk/utils/dates";
import { TouchableOpacity } from "react-native";
import { ItemList } from "../../../../mk/components/ui/ItemList/ItemList";


type Props = {
  api: {data: any; reload: Function; execute: Function; loaded: boolean};
  parametros: any;
  screenParams?: [any, Function];
  isHome?: boolean;
  setOpenDropdown?: any;
};
const Orders = ({
  api,
  parametros,
  screenParams = [null, () => {}],
  isHome,
  setOpenDropdown,
}: Props) => {
//   const {theme} = useContext(ThemeContext);
  const [formState, setFormState]: any = React.useState({});
  const [errors, setErrors]: any = React.useState({});
  const [typeSearch, setTypeSearch] = useState("B");
  const handleInputChange = (name: string, value: string) => {
    setFormState((old: any) => ({
      ...old,
      [name]: value,
    }));
  };
  const [openDetail, setOpenDetail] = useState(false);
  const [details, setDetails] = useState<TypeDetails>({title: "", data: []});
  const [params, setParams] = parametros;
  const [dataScreen, setDataScreen]: any = screenParams;
  const {data, reload, execute, loaded} = api;
  const {showToast, setStore} = useAuth();
  const [search, setSearch] = useState("");
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [errorsA, setErrorsA]: any = useState({});
  const [formStateA, setFormStateA]: any = useState({});
  const [acompSelect, setAcompSelect]: any = useState([]);
  const navigator: any = useNavigation();
  const onSearch = (search: string) => {
    setSearch(search);
  };
  const onCheckCIA = async () => {
    let ci = formStateA.ci;
    const acomList = formState.acompanantes || [];
    setErrorsA({});
    const result = await onExist({
      execute,
      field: "ci",
      value: ci,
      module: "visits",
      cols: "id,name,middle_name,last_name,mother_last_name,ci",
    });
    if (formStateA.ci === formState.ci) {
      setErrorsA({ci: "Ci del invitado"});
      return;
    }
    let ciList = acomList.find((acom: any) => acom.ci == formStateA.ci);

    if (ciList) {
      setErrorsA({ci: "El ci ya fue añadido"});
      return;
    }
    if (result !== false) {
      setFormStateA({
        ...formStateA,
        name: result.name,
        middle_name: result.middle_name,
        last_name: result.last_name,
        mother_last_name: result.mother_last_name,
        nameDisabled: true,
      });
    } else {
      setFormStateA({
        ...formStateA,
        name: "",
        middle_name: "",
        last_name: "",
        mother_last_name: "",
        nameDisabled: false,
      });
    }
  };
  const onCheckCI = async () => {
    let ci = formState.ci;

    setErrors({});
    setErrorsA({});
    const result = await onExist({
      execute,
      field: "ci",
      value: ci,
      module: "visits",
      cols: "id,name,middle_name,last_name,mother_last_name,ci",
    });

    if (result !== false) {
      setFormState({
        ...formState,
        name: result.name,
        middle_name: result.middle_name,
        last_name: result.last_name,
        mother_last_name: result.mother_last_name,
        nameDisabled: true,
      });
    } else {
      setFormState({
        ...formState,
        name: "",
        middle_name: "",
        last_name: "",
        mother_last_name: "",
        nameDisabled: false,
      });
    }
  };
  useEffect(() => {
    if (dataScreen && data?.data) {
      const item = data.data.find((item: any) => item.id == dataScreen);
      if (item) {
        _onDetail(item);
      } else {
        navigator.navigate("Historial", {act: "pedido", id: dataScreen});
      }
    }
    setDataScreen(null);
  }, [dataScreen]);

  const onSavePedido = async () => {
    const item = formState;
    const salida = item.access?.access?.some((a: any) => a.out_at == null);
    // console.log("item", item.access?.access);

    const url = "/accesses";
    if (item.access_id || salida) {
      let method = "POST";
      let idAcom: any = [];
      acompSelect.map((acom: any) => {
        idAcom.push(acom.id);
      });
      if (acompSelect.length <= 0) {
        showToast("Debe selecionar para dejar salir", "warning");
        return;
      }
      const {data, error} = await execute(
        url + "/exit",
        method,
        {
          ids: idAcom,
          obs_out: item.obs_out,
        },
        false,
        3,
      );
      if (data?.success == true) {
        setOpenDetail(false);
        reload();
        setAcompSelect([]);
        showToast("El pedido salio", "success");
        return;
      } else {
        showToast(data?.message, "error");
        console.log("Error al grabar:", error);
        return;
      }
    }

    let errors = {};

    if (item.ci) {
      let regex = /^[0-9]{5,9}$/g;

      if (!item.ci.match(regex)) {
        // error["ci"] = "El CI es inválido";

        errors = {...errors, ci: "CI es inavalido"};
      }
    }

    if (!item.ci) {
      errors = {...errors, ci: "CI es Requerido"};
    }

    if (!item.name) {
      errors = {...errors, name: "Primer nombre es Requerido"};
    }

    if (item.name) {
      let regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s',.-]+$/;
      if (!item.name.match(regex)) {
        errors = {...errors, name: "Primer nombre es inválido"};
      }
    }

    if (item.middle_name) {
      let regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s',.-]+$/;
      if (!item.middle_name.match(regex)) {
        errors = {...errors, middle_name: "Segundo nombre es inválido"};
      }
    }

    if (!item.last_name) {
      errors = {...errors, last_name: "Apellido paterno es Requerido"};
    }

    if (item.last_name) {
      let regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s',.-]+$/;
      if (!item.last_name.match(regex)) {
        errors = {...errors, last_name: "Apellido paterno es inválido"};
      }
    }

    if (item.mother_last_name) {
      let regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s',.-]+$/;
      if (!item.mother_last_name.match(regex)) {
        errors = {
          ...errors,
          mother_last_name: "Apellido materno es inválido",
        };
      }
    }

    if (typeSearch == "V") {
      if (!item.plate) {
        errors = {...errors, plate: "Placa es Requerido"};
      }

      const numLetras = /^[A-Z]{3,5}-[0-9]{3,5}$/;
      if (item.vehicle == "Y" && !numLetras.test(item.plate)) {
        errors = {...errors, plate: "Placa es inválido"};
      }
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setOpenDetail(true);
      return;
    }
    let method = "POST";

    const {data, error} = await execute(url, method, {
      pedido_id: item.id,
      begin_at: item.begin_at,
      type: "P",
      plate: item.plate,
      name: item.name,
      middle_name: item.middle_name,
      last_name: item.last_name,
      mother_last_name: item.mother_last_name,
      ci: item.ci,
      obs_in: item.obs_in,
      acompanantes: formState.acompanantes,
    });
    console.log("entro", JSON.stringify(data, null, 5));
    if (data?.success == true) {
      reload();
      setOpenDetail(false);
      showToast("El pedido ingresó", "success");
    } else {
      showToast(data?.message, "error");
    }
  };
  const handleChangeInputA = (name: string, value: string) => {
    setFormStateA({
      ...formStateA,
      [name]: value,
    });
  };

  const handleChangeCompanion = async () => {
    let acompanantes = formState["acompanantes"] || [];

    if (Object.keys(errorsA).length >= 1) {
      setErrorsA(errorsA);
      return;
    }

    if (edit) {
      const updatedAcompanantes = acompanantes.map((acom: any) => {
        if (acom.ci === formStateA.ci) {
          return {
            ...acom,
            name: formStateA.name,
            middle_name: formStateA.middle_name,
            last_name: formStateA.last_name,
            mother_last_name: formStateA.mother_last_name,
            nameDisabled: formStateA.nameDisabled,
          };
        }
        return acom;
      });

      setFormState((old: any) => ({
        ...old,
        acompanantes: updatedAcompanantes,
      }));
      setEdit(false);
    } else {
      acompanantes.push({
        ci: formStateA.ci,
        name: formStateA.name,
        middle_name: formStateA.middle_name,
        last_name: formStateA.last_name,
        mother_last_name: formStateA.mother_last_name,
        nameDisabled: formStateA.nameDisabled,
      });

      setFormState((old: any) => ({...old, acompanantes}));
    }
    setFormStateA({});
    setAdd(false);
  };
  const handleEditAcompanante = (ci: any) => {
    const acompananteToEdit = formState.acompanantes.find(
      (acom: any) => acom.ci === ci,
    );
    setFormStateA(acompananteToEdit);
    let disabled = acompananteToEdit.nameDisabled;

    if (!disabled) {
      setEdit(true);
      setAdd(true);
    }
  };
  const handleDeleteAcompanante = (ci: any) => {
    const newAcompanante = formState.acompanantes.filter(
      (acomDelete: any) => acomDelete.ci !== ci,
    );
    setFormState((old: any) => ({...old, acompanantes: newAcompanante}));
  };

  const acompanantesList = (acompanante: any) => {
    return (
      <TouchableOpacity onPress={() => handleEditAcompanante(acompanante.ci)}>
        <ItemList
          title={getFullName(acompanante)}
          subtitle={"C.I. " + acompanante.ci}
          subtitle2={
            acompanante.obs_in
              ? "Observaciones de entrada: " + acompanante.obs_in
              : ""
          }
          left={<Avatar name={getFullName(acompanante)} />}
          right={
            <Icon
              name={IconX}
              color={pallete[theme.currentTheme]?.light.v3}
              onPress={() => handleDeleteAcompanante(acompanante.ci)}
            />
          }
        />
      </TouchableOpacity>
    );
  };
  const _onDetail = (item: any) => {
    const data: ItemInfoType[] = [];
    setFormState({
      ...item,
      begin_at: getUTCNow(),
      type: "P",
    });

    if (!item.access_id) {
      data.push({
        l: "Residente",
        v: getFullName(item.owner),
      });
      data.push({
        l: "Detalle",
        v: item.descrip,
      });
      data.push({
        l: "Fecha",
        v: getDateTimeStrMes(item?.created_at),
      });
      data.push({
        l: "Tipo de pedido",
        v: item.other_type?.name,
      });
   
    } else {
      data.push({
        l: "Estado",
        v: item.access?.out_at
          ? "Completado"
          : item.access
          ? "Ingreso"
          : "Pendiente",
      });
      data.push({
        l: "Tipo de acceso",
        v: item.access?.type == "P" && "Pedido-" + item?.other_type?.name,
      });
      if (item.descrip) {
        data.push({
          l: "Descripción",
          v: item.descrip,
        });
      }

      data.push({l: "Entregó a", v: getFullName(item.owner)});

      data.push({
        l: "Guardia de entrada",
        v: getFullName(item?.access?.guardia),
      });
      item?.access?.out_guard &&
        item?.access?.guardia?.id != item?.access?.out_guard?.id &&
        data.push({
          l: "Guardia de salida",
          v: getFullName(item?.access?.out_guard),
        });
      if (item.access?.obs_in) {
        data.push({
          l: "Observación de ingreso",
          v: item.access?.obs_in,
        });
      }
      if (item.access?.obs_out) {
        data.push({
          l: "Observación de salida",
          v: item.access?.obs_out,
        });
      }
    }

    setDetails({
      data,
    });
    setOpenDetail(true);
  };

  const icono = (item: any) => {
    let icon: any = "";
    if (item.other_type.name == "Taxi") {
      icon = IconTaxi;
    }
    if (item.other_type.name == "Mensajeria") {
      icon = IconOther;
    }
    if (item.other_type.name == "Delivery") {
      icon = IconDelivery;
    }
    if (item.other_type.name == "Otro") {
      icon = IconOther;
    }
    return (
      <Icon
        style={{
          borderRadius: 50,
          padding: 8,
          backgroundColor: pallete[theme.currentTheme]?.light.color,
        }}
        size={24}
        name={icon}
        color={pallete[theme.currentTheme]?.dark.color}
      />
    );
  };

  const subtitle = (item: any) => {
    if (item.access) {
      if (item.other_type?.name == "Taxi") {
        return "Recogió a: " + getFullName(item.owner);
      }
      if (item.other_type?.name == "Mensajeria") {
        return "Entregó a: " + getFullName(item.owner);
      }
      if (item.other_type?.name == "Delivery") {
        return "Entregó a: " + getFullName(item.owner);
      }
      if (item.other_type?.name == "Otro") {
        return "Para: " + getFullName(item.owner);
      }

      return "Visitó a: " + getFullName(item.owner);
    } else {
      return "Detalle: " + item.descrip;
    }
  };

  let antFec = "";
  const Item = (item: any) => {
    let sep: any = null;
    if (
      item.access?.in_at &&
      getDateStrMes(antFec) != getDateStrMes(item.access?.in_at)
    ) {
      antFec = item.access?.in_at;
      sep = (
        <Text style={{...theme.card?.text}}>
          {getDateStrMes(item.access?.in_at)}
        </Text>
      );
    }
    if (
      search != "" &&
      getFullName(item.access?.visit)
        ?.toLowerCase()
        .indexOf(search.trim().toLowerCase()) < 0 &&
      item.descrip.toLowerCase().indexOf(search.trim().toLowerCase()) < 0
    )
      return null;
    return (
      <>
        {sep}
        <TouchableOpacity
          onPress={() =>
            //  _onDetail(item)
            {
              setFormState({...formState, id: item.id});
              setOpenDetail(true);
            }
          }>
          <ItemList
            title={
              item.access
                ? getFullName(item.access?.visit)
                : getFullName(item.owner)
            }
            subtitle={subtitle(item)}
            left={icono(item)}
            right={right(item)}
            date={horas(item)}
            widthMain={50}
          />
        </TouchableOpacity>
      </>
    );
  };

  const right = (item: any) => {
    if (item.status == "X") {
      return (
        <Text
          style={{
            ...themes.darkTheme.list?.listItem.subtitle2,
            color: pallete.dark?.hightAlert,
          }}>
          Cancelado
        </Text>
      );
    }
    if (item.access && !item.access.out_at) {
      return (
        <TouchableOpacity
          style={{...theme.buttons?.secondary, borderRadius: 10}}
          onPress={() => {
            _onDetail(item);
          }}>
          <Text
            style={{
              color: theme.buttons?.secondary?.borderColor,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontSize: 12,
            }}>
            Dejar salir
          </Text>
        </TouchableOpacity>
      );
    }

    if (!item.access)
      return (
        <TouchableOpacity
          style={{...theme.buttons?.primary, borderRadius: 10}}
          onPress={() => {
            _onDetail(item);
          }}>
          <Text
            style={{
              color: theme.buttons?.primary?.color,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontSize: 12,
            }}>
            Dejar Entrar
          </Text>
        </TouchableOpacity>
      );
  };

  const horas = (item: any) => {
    return (
      <ItemListDate
        data1={item.access?.in_at}
        data2={item.access?.out_at}
        date={antFec}
      />

    );
  };
  const Right1 = ({acom, isSelected}: any) => {
    return (
      <>
        {!acom?.out_at && acom?.in_at ? (
          <Icon
            name={isSelected ? IconCheck : IconCheckOff}
            color={isSelected ? pallete.dark?.accent.color : "transparent"}
            fillStroke={!isSelected ? pallete.dark?.light.color : ""}
          />
        ) : (
          ""
        )}
      </>
    );
  };

  const Horas1 = ({acom, fecha}: any) => {
    return (
      <ItemListDate date={fecha} data1={acom?.in_at} data2={acom?.out_at} />
    );
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

  const acompList = (acom: any) => {
    const isSelected = acompSelect.some((a: any) => a.id === acom.id);
    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleSelectAcomp(acom.id)}>
          <ItemList
            left={<Avatar name={getFullName(acom.visit)} />}
            title={getFullName(acom.visit)}
            subtitle={"C.I. " + acom.visit.ci}
            right={
              <Right1
                isSelected={isSelected}
                acom={acom}
                fecha={formState.access.in_at}
              />
            }
            date={<Horas1 acom={acom} fecha={formState.access.in_at} />}
          />
        </TouchableOpacity>
      </>
    );
  };
  const isSelected = acompSelect.some(
    (a: any) => a.id === formState.access?.id,
  );

  const salir = () => {
    const porSalir = formState.access?.access?.some(
      (a: any) => a.out_at == null,
    );

    if (!formState.access?.out_at || porSalir) {
      return true;
    }
  };

  return (
    <>
      {isHome ? (
        <DataSearch setSearch={onSearch} name="Pedidos" value={search} />
      ) : (
        <SearchBar
          search={search}
          name="Pedidos"
          onSearch={onSearch}
          setOpenDropdown={setOpenDropdown}
        />
      )}

      {data?.data.length == 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Text style={theme.card?.label}>Aquí se verá tu lista</Text>
        </View>
      ) : (
        <List data={data?.data} renderItem={Item} refreshing={!loaded} />
      )}

      {formState.id && openDetail && (
        <AccessDetailPedido
          open={openDetail}
          close={() => setOpenDetail(false)}
          id={formState.id}
          reload={api.reload}
        />
      )}
     
    </>
  );
};

export default Orders;
