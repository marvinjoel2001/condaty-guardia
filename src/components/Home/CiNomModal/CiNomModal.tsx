import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
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
import { IconAlert, IconX } from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import { onExist } from '../../../../mk/utils/dbtools';
import { TouchableOpacity } from 'react-native';
import { AccompaniedAdd } from '../EntryQR/AccompaniedAdd';
import { getUTCNow } from '../../../../mk/utils/dates';



interface CiNomModalProps {
  open: boolean;
  onClose: () => void;
}

const CiNomModal = ({open, onClose}: CiNomModalProps) => {
  const {user, showToast,} = useAuth();
  const [exist, setExist] = useState(0);
  const [visit, setVisit]:any = useState([]);
  const [ formState, setFormState]:any = useState({})
  const [formStateA, setFormStateA]:any = useState({})
  const [errors, setErrors] = useState({});
  const [errorsA, setErrorsA] = useState({});
  const [steps,setSteps] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const [typeSearch, setTypeSearch] = useState('P');
  const [addCompanion, setAddCompanion] = useState(false);
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
    setAddCompanion(false);
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
      setAddCompanion(true);
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
      setFormState({
        ...formState,
        name: visitData?.data[0].name,
        middle_name: visitData?.data[0].middle_name,
        last_name: visitData?.data[0].last_name,
        mother_last_name: visitData?.data[0].mother_last_name,
        ci: visitData?.data[0].ci
      })
    }
    console.log(visitData,'visitData')
  }

  const validate = () => {
    let errors: any = {};
    errors = checkRules({
      value: formState.ci,
      rules: ['required','min:5','max:10'],
      key: 'ci',
      errors,
    });
    if(steps > 0){
        if(typeSearch === 'T'){
              errors = checkRules({
                value: formState.ci_taxi,
                rules: ['required','min:5','max:10'],
                key: 'ci_taxi',
                errors,
              });
            }
        if(typeSearch === 'V'){
              errors = checkRules({
                value: formState.plate,
                rules: ['required','min:5','max:10'],
                key: 'plate',
                errors,
              });
            }
    }    
    setErrors(errors);
    return errors;
  };


  const onSave = async () => {
    getVisits();
    if(steps > 0){
      if (hasErrors(validate())) {
        return;
      }
      const url = "/accesses";
      let method = "POST";
  
      const {data, error: err} = await execute(url, method, 
        {...formState, begin_at: formState?.begin_at || getUTCNow(),}
        , false, 0);
  
      if (data?.success === true) {
        onClose();
        // Removed reload call since reload is not defined in the component scope
        showToast("Notificación enviada", "success");
      } else {
        showToast(data?.message, "error");
      }
    }
  }

  const acompanantesList = (item: any) => {
    // console.log(item,'item',formState.acompanantes,'formState.acompanantes')
    return (
      <TouchableOpacity
        onPress={() => handleEditAcompanante(item.ci)}>
      
      <ItemList
        title={getFullName(item)}
        subtitle={`CI: ${item.ci}`}
        left={<Avatar name={getFullName(item)} />}
        right={
          <Icon
          name={IconX}
          color={cssVar.cWhiteV2}
          onPress={() => handleDeleteAcompanante(item.ci)}
        />
        }
      />
      </TouchableOpacity>
    );
  };
  return (
    <ModalFull
      open={open}
      onClose={onClose}
      title={steps  > 0 ? "Registrar sin qr" : "Visitante sin qr"}
      buttonText={ steps > 0 ? "Notificar al residente" : steps <= 0 ? "Buscar" : ""}
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
          tabs={[
            {value: 'P', text: 'A pie'},
            {value: 'V', text: 'En vehículo'},
            {value: 'T', text: 'En taxi'},
          ]}
        />}
            {formState.acompanantes?.length > 0 &&  (
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

      { steps > 0 && <TouchableOpacity
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
            setAddCompanion(true);
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
        </TouchableOpacity>}
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

      <AccompaniedAdd
      open={addCompanion}
      onClose={() => {
        setAddCompanion(false);

      }}
      item={formState}
      setItem={setFormState}
      />

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