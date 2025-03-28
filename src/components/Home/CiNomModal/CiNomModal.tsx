import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import {pallete} from '../../../../mk/styles/themes';
import useAuth from '../../../../mk/hooks/useAuth';
import useApi from '../../../../mk/hooks/useApi';
import { checkRules } from '../../../../mk/utils/validate/Rules';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Select from '../../../../mk/components/forms/Select/Select';
import Input from '../../../../mk/components/forms/Input/Input';
import { ItemList } from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import { getFullName } from '../../../../mk/utils/strings';
import { TextArea } from '../../../../mk/components/forms/TextArea/TextArea';
import InputNameCi from './shared/InputNameCi';
import SelectTransport from './shared/SelectTransport';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import { IconAlert } from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import { onExist } from '../../../../mk/utils/dbtools';
import { TouchableOpacity } from 'react-native';



interface CiNomModalProps {
  open: boolean;
  onClose: (value: any) => void;
}

const CiNomModal = ({open, onClose}: CiNomModalProps) => {
  const {user, showToast,} = useAuth();
  const [exist, setExist] = useState(0);
  const [visit, setVisit]:any = useState([]);
  const [formState, setFormState]:any = useState({})
  const [formStateA, setFormStateA]:any = useState({})
  const [errors, setErrors] = useState({});
  const [errorsA, setErrorsA] = useState({});
  const [steps,setSteps] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const [typeSearch, setTypeSearch] = useState('P');
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);


  const handleChangeCompanion = async () => {
    let err = {};
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
            obs_in: formStateA.obs_in,
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
      if (!formStateA.name) {
        err = {...err, name: "Primer nombre es Requerido"};
      }
      if (!formStateA.last_name) {
        err = {...err, last_name: "Apellido paterno es Requerido"};
      }

      console.log(err);
      console.log("====================================");
      console.log(formStateA);
      console.log("====================================");

      if (Object.keys(err).length > 0) {
        setErrorsA(err);
        return;
      }
      acompanantes.push({
        ci: formStateA.ci,
        name: formStateA.name,
        middle_name: formStateA.middle_name,
        last_name: formStateA.last_name,
        mother_last_name: formStateA.mother_last_name,
        obs_in: formStateA.obs_in,
        nameDisabled: formStateA.nameDisabled,
      });

      setFormState((old: any) => ({...old, acompanantes}));
    }
    setFormStateA({});
    setAdd(false);
  };
  const handleDeleteAcompanante = (ci: any) => {
    const newAcompanante = formState.acompanantes.filter(
      (acomDelete: any) => acomDelete.ci !== ci,
    );
    setFormState((old: any) => ({...old, acompanantes: newAcompanante}));
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

  const onCheckCI = async (taxi: boolean = false) => {
    setErrors({});
    let ci = formStateA.ci;
    if (taxi) {
      ci = formState.ci_taxi;
    }
    const acomList = formState.acompanantes || [];
    const result = await onExist({
      execute,
      field: "ci",
      value: ci,
      module: "visits",
      cols: "id,name,middle_name,last_name,mother_last_name,ci",
    });

    if (taxi) {
      if (formState.ci_taxi == formState.ci) {
        setErrors({ci_taxi: "CI del  invitado"});
        return;
      }
    }
    if (formState.ci == result.ci) {
      setErrorsA({ci: "CI del  invitado"});
      return;
    }
    if (formState.ci == formStateA.ci) {
      setErrorsA({ci: "Este ci ya está en la lista"});
      return;
    }

    if (typeSearch == "T" && formState.ci_taxi == formStateA.ci) {
      setErrorsA({ci: "CI ya fue añadido"});
      return;
    }
    let ciList = acomList.find((acom: any) => acom.ci == ci);

    if (ciList) {
      setErrorsA({ci: "El ci ya fue añadido"});
      return;
    }
    setErrorsA({});
    if (result !== false) {
      if (taxi) {
        setFormState({
          ...formState,
          name_taxi: result.name,
          middle_name_taxi: result.middle_name,
          last_name_taxi: result.last_name,
          mother_last_name_taxi: result.mother_last_name,
          nameTaxiDisabled: true,
        });
      } else {
        setFormStateA({
          ...formStateA,
          name: result.name,
          middle_name: result.middle_name,
          last_name: result.last_name,
          mother_last_name: result.mother_last_name,
          nameDisabled: true,
        });
      }
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



  const hasErrors = (errors: any) => {
    for (const key in errors) {
      if (errors[key]) {
        return true;
      }
    }
    return false;
  };
  
  const {data: owners, loaded, execute} = useApi(
    "/owners",
    "GET",
    {
      perPage: -1,
      sortBy: "name",
      orderBy: "asc",
      searchBy: "",
    },
    3,
    true
  );
  

  const handleChangeInput = (name: string, value: string ) => {

    setFormState({
      ...formState,
      [name]: value,
    });
  };
  const handleChangeInputA = (name: string, value: string ) => {
    console.log(formStateA,'fstA&fst',formState,'name value')

    setFormStateA({
      ...formStateA,
      [name]: value,
    });
  };



  const validate = () => {
    let errors: any = {};

    errors = checkRules({
      value: formState.ci,
      rules: ['required', 'min:5', 'max:10'],
      key: 'ci',
      errors,
    });

    // errors = checkRules({
    //   value: formState.owner_id,
    //   rules: ['required'],
    //   key: 'owner_id',
    //   errors,
    // });

    setErrors(errors);
    return errors;
  };
  const getVisits = async () => {
    if (hasErrors(validate())) {

      return;
    }
 
    const {data: visitData} = await execute("/visits", "GET", {
      perPage: -1,
      page: 1,
      fullType:"L",
      searchBy: formState.ci,
    },
    // 3
  );
    setVisit(visitData?.data);
    if(visitData?.data.length === 0){
      setSteps(2);
      setOpenAlert(true);
      return;
    }else{
      setSteps(1);
    }
    console.log(visitData,'visitData')
  }

  const onSave = async () => {
    getVisits();
  }

  const acompanantesList = ({item}: any) => {
    return (
      <ItemList
        title={getFullName(item)}
        subtitle={`CI: ${item.ci}`}
        left={<Avatar name={getFullName(item)} />}
      />
    );
  };
  return (
    <ModalFull
      open={open}
      onClose={onClose}
      title="Visitante sin qr"
      buttonText="Validar"
      // buttonCancel="Cancelar"
      onSave={onSave}
      >
      <View style={{padding: 16}}>
      <>
    
          {visit.length > 0 &&
              <ItemList 
               title={getFullName(visit[0])}
               subtitle={`CI: ${visit[0]?.ci}`}
               left={<Avatar name={getFullName(visit[0])}  />}
              />}
                <Select
                  label="¿A quién visita?"
                  placeholder="¿A quién visita?"
                  name="owner_id"
                  required={true}
                  options={owners?.data || []}
                  value={formState.owner_id || ""}
                  onChange={value => handleChangeInput("owner_id", value.target.value)}
                  optionValue="id"
                  error={errors}
                  optionLabel="name"
                  height={300}
                  search={true}
                />
               {visit.length === 0 &&  steps === 0 &&
                <Input
                  label="Carnet de identidad"
                  type="date"
                  name="ci"
                  error={errors}
                  required={true}
                  value={formState["ci"]}
                  maxLength={10}
                  onChange={(value: any) => handleChangeInput("ci", value)}
                />
              }
  {steps === 2 &&
   <InputNameCi 
       formStateName={formState}
       formStateCi={formState.ci}
       disabledCi={steps === 2}
       handleChangeInput={handleChangeInput}
       errors={errors}
       />}
       {steps > 0 &&  <TextArea
          label="Observaciones de Entrada"
          name="obs_in"
          value={formState?.obs_in}
          onChange={(e: any) => handleChangeInput('obs_in', e)}
        />}
       {steps > 0 && <SelectTransport
          typeSearch={typeSearch}
          setTypeSearch={setTypeSearch}
          formState={formState}
          errors={errors}
          handleChangeInput={handleChangeInput}
        />}
            {formState.acompanantes?.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 16,
                fontFamily: FONTS.medium,
                marginBottom: 4,
                color: cssVar.cWhiteV2,
              }}>
              {formState.acompanantes?.length > 1 ? "Acompañantes:" : "Acompañante:"}
            </Text>
            <List
              data={formState.acompanantes}
              renderItem={acompanantesList}
              refreshing={!loaded}
            />
          </>
        )}

        <TouchableOpacity
          style={{
            flexDirection: "row",
            paddingVertical: 6,
            paddingHorizontal: 8,
            gap: 4,
            borderRadius: 8,
            width: "60%",
            alignItems: "center",
            marginVertical: 12,
            opacity:
              !formState.owner_id || !formState.ci || !formState.name
                ? 0.2
                : undefined,
          }}
          disabled={!formState.owner_id || !formState.ci || !formState.name}
          onPress={() => {
            setAdd(true);
            setFormStateA({});
            setEdit(false);
          }}>
          <Text
            style={{
              fontSize: 12,
              color: cssVar.cWhite,
              fontFamily: FONTS.medium,
              borderBottomColor:cssVar.cWhiteV2,
              borderBottomWidth:
                !formState.owner_id || !formState.ci || !formState.name ? 0 : 2,
            }}>
            {formState.acompanantes?.length >= 1
              ? "Agregar más acompañantes"
              : "Agregar acompañante"}
          </Text>
        </TouchableOpacity>
              </>
      </View>
      {openAlert && (
        <Modal
          open={openAlert}
          onClose={onClose}
          iconClose={false}
          onSave={()=>setOpenAlert(false)}
          buttonText="Registrar"
          buttonCancel=""
          headerStyles={{backgroundColor: "transparent"}}>
          <View
            style={styles.modalAlert}>
            <Icon
              name={IconAlert}
              size={80}
              color={cssVar.cWarning}
            />
            <Text
              style={styles.modalAlertText}>
              ¡Visita no registrada!
            </Text>
          </View>
        </Modal>
      )}

<Modal
        title="Agregar acompañante"
        open={add}
        onClose={() => {
          setAdd(false);
          setErrorsA({});
        }}
        buttonText="Guardar"
        onSave={handleChangeCompanion}
        disabled={!formStateA.ci || !formStateA.name || !formStateA.last_name}
        headerStyles={{backgroundColor: "transparent"}}>
        <InputNameCi
          formStateName={formStateA}
          formStateCi={formStateA.ci}
          // disabledCi={true}
          handleChangeInput={handleChangeInputA}
          errors={errorsA}
          onCheckCI={onCheckCI}
          // p refix="_a"
        />
      </Modal>
    </ModalFull>
    
  );
};

export default CiNomModal;

const styles = StyleSheet.create({
  
  modalAlert:{
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1
  },
  modalAlertText:{
    fontSize: 20,
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
  }
});