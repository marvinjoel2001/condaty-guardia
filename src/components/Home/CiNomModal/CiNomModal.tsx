import React, {useState} from 'react';
import {Text, View} from 'react-native';
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



interface CiNomModalProps {
  open: boolean;
  onClose: (value: any) => void;
}

const CiNomModal = ({open, onClose}: CiNomModalProps) => {
  const {user,showToast} = useAuth();
  const [exist, setExist] = useState(0);
  const [visit, setVisit]:any = useState([]);
  const [formState, setFormState] = useState({})
  const [errors, setErrors] = useState({});

  const handleInputChange = (name: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  }


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
  

  const handleChangeInput = (name: string, value: string) => {
    setFormState({
      ...formState,
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
    },3);
    setVisit(visitData?.data);
    console.log(visitData,'visitData')
  }

  const onSave = async () => {
     getVisits();
    
  }

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
               subtitle={visit[0]?.ci}
               left={<Avatar name={getFullName(visit[0])} size={40} />}
              />}
                <Select
                  label="¿A quién visita?"
                  placeholder="¿A quién visita?"
                  name="owner_id"
                  required={true}
                  options={owners?.data || []}
                  value={formState.owner_id || ""}
                  onChange={value => handleInputChange("owner_id", value)}
                  optionValue="id"
                  error={errors}
                  optionLabel="name"
                  height={300}
                  search={true}
                />
               {
                visit.length === 0 && 
               
                <Input
                  label="Carnet de identidad"
                  type="date"
                  name="ci"
                  error={errors}
                  required={true}
                  // readOnly={formState.type === "C" || existe === 3}
                  // disabled={formState.type === "C" || existe === 3}
                  value={formState["ci"]}
                  maxLength={10}
                  onChange={(value: any) => handleChangeInput("ci", value)}
                />
              }

        <TextArea
          label="Observaciones de Entrada"
          name="obs_in"
          value={formState?.obs_in}
          onChange={(e: any) => handleInputChange('obs_in', e)}
        />
              </>
      </View>
    </ModalFull>
  );
};

export default CiNomModal;