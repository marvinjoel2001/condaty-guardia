import React, {useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import {useNavigation} from '@react-navigation/native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import useAuth from '../../../mk/hooks/useAuth';
import Button from '../../../mk/components/forms/Button/Button';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {
  IconArrowRight,
  IconCamera,
  IconEmail,
  IconPassword,
} from '../../icons/IconLibrary';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {uploadImage} from '../../../mk/utils/uploadFile';
import Form from '../../../mk/components/forms/Form/Form';
import InputFullName from '../../../mk/components/forms/InputFullName/InputFullName';
import Input from '../../../mk/components/forms/Input/Input';
import useApi from '../../../mk/hooks/useApi';
import AccessEdit from './AccessEdit';
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';
import AvatarPreview from './AvatarPreview';
import Br from './Br';
import configApp from '../../config/config';

const Profile = () => {
  const navigation: any = useNavigation();
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  //   const [imageData, setImageData] = useState('');
  const {user, getUser, setUser, showToast, setStore, store}: any = useAuth();
  const [formState, setFormState]: any = useState({});
  const [type, setType] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors]: any = useState({});
  const {execute} = useApi();
  const lCondo: any = {C: 'Condominio', E: 'Edificio', U: 'Urbanizacion'};
  const client: any = user?.clients?.find((e: any) => e.id == user.client_id);

  const handleEdit = () => {
    setFormState((prevState: any) => ({...prevState, ...user}));
    setIsEdit(!isEdit);
    setErrors({});
  };
  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };
 console.log(isEdit,'isEdit')
  const validate = (field = '') => {
    let errors: any = {};

    errors = checkRules({
      value: formState.name,
      rules: ['required', 'alpha'],
      key: 'name',
      errors,
    });

    errors = checkRules({
      value: formState.middle_name,
      rules: ['alpha'],
      key: 'middle_name',
      errors,
    });

    errors = checkRules({
      value: formState.last_name,
      rules: ['required', 'alpha'],
      key: 'last_name',
      errors,
    });

    errors = checkRules({
      value: formState.mother_last_name,
      rules: ['alpha'],
      key: 'mother_last_name',
      errors,
    });

    errors = checkRules({
      value: formState.phone,
      rules: ['required', 'phone'],
      key: 'phone',
      errors,
    });

    errors = checkRules({
      value: formState.address,
      rules: ['required', 'address'],
      key: 'address',
      errors,
    });

    setErrors(errors);
    return errors;
  };
  const onSave = async () => {
    if (hasErrors(validate())) {
      return;
    }
    const newUser: any = {
      ci: formState.ci,
      name: formState.name,
      middle_name: formState.middle_name,
      last_name: formState.last_name,
      mother_last_name: formState.mother_last_name,
      phone: formState.phone,
      avatar: {ext: 'webp', file: encodeURIComponent(formState.avatar)},
      address: formState.address,
    };

    const {data, error: err} = await execute(
      configApp.APP_USER + '/' + user?.id,
      'PUT',
      newUser,
      false,
      3,
    );
    if (data?.success == true) {
      getUser();
      showToast('Perfil Actualizado', 'success');
      handleEdit();
      setErrors({});
    } else {
      //   setErrors(err.data?.errors);
      showToast('Ocurrio un error', 'error');
    }
  };

  const onOpenModal = (type: any) => {
    setType(type);
    setOpenModal(true);
  };
  return (
    <Layout
      refresh={() => getUser()}
      onBack={() => {
        // if (imageData) {
        setImagePreview(false);
        setFormState(user);
        // }
        isEdit ? setIsEdit(false) : navigation.navigate('Home');
      }}
      title={'Perfil'}
      style={{paddingHorizontal: 16}}>
      <View>
        {/* <Avatar
          onClick={() => setImagePreview(true)}
          src={
            formState.avatar && isEdit
              ? 'data:image/jpg;base64,' + formState.avatar
              : getUrlImages(
                  '/GUARD-' + user?.id + '.webp?d=' + user?.updated_at,
                )
          }
          w={112}
          h={112}
          name={getFullName(user)}
          style={{width: 112, height: 112}}
        /> */}
        {isEdit && (
          <AvatarPreview
          open={imagePreview}
          onClose={() => setImagePreview(false)}
          id={user.id}
          name={getFullName(user)}
          prefijo="GUARD"
          updated_at={user?.updated_at}
          w={112}
          h={112}
        />
        )}
        {isEdit && (
          <View
            style={{
              position: 'absolute',
              bottom: -10,
              right: '36%',
              borderRadius: 20,
              backgroundColor: cssVar.cAccent,
              paddingHorizontal: 8,
              paddingVertical: 8,
            }}
            //   onPointerEnter={() => setPreviewVisible(true)}
          >
            <Icon
              name={IconCamera}
              fillStroke={cssVar.cBlackV1}
              color={'transparent'}
              onPress={(e: any) => {
                uploadImage({formState, setFormState, showToast});
              }}
            />
          </View>
        )}
      </View>
      {!isEdit && (
        <Button
          style={{
            marginVertical: 8,
          }}
          onPress={handleEdit}>
          Editar perfil
        </Button>
      )}
      <Text style={styles.title}>
        {isEdit ? 'Editar perfil' : 'Datos personales'}
      </Text>
      {isEdit ? (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled">
          <Form behaviorIos="position" keyboardVerticalOffset={200}>
            <InputFullName
              formState={formState}
              errors={errors}
              handleChangeInput={handleInputChange}
              disabled={true}
            />
            <Input
              label="Teléfono"
              value={formState['phone']}
              keyboardType="phone-pad"
              name="phone"
              required
              error={errors}
              onChange={(value: any) => handleInputChange('phone', value)}
            />
            <Input
              label="Dirección"
              value={formState['address']}
              name="address"
              required
              error={errors}
              onChange={(value: any) => handleInputChange('address', value)}
            />
            <Button onPress={() => onSave()}>
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                }}>
                Guardar
              </Text>
            </Button>
          </Form>
        </ScrollView>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.text}>{getFullName(user)}</Text>
            <Br />
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.text}>{user.phone || 'Sin teléfono'}</Text>
            <Br />
            <Text style={styles.label}>Carnet de identidad</Text>
            <Text style={styles.text}>{user?.ci || 'Sin registrar'}</Text>
            <Br />
            <Text style={styles.label}>{lCondo[client?.type]}</Text>
            <Text style={styles.text}>{client?.name || 'No asignado'}</Text>
            <Br />
            <Text style={styles.label}>Correo electrónico</Text>
            <Text style={styles.text}>{user.email || 'No asignado'}</Text>
            <Br />
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.text}>{user.address || 'Sin dirección'}</Text>
          </View>
        </>
      )}

      <View>
        {!isEdit && (
          <>
            <Text style={styles.title}>Datos de acceso</Text>
            <View style={styles.cardAccess}>
              <View
                style={styles.contentAccess}
                onTouchEnd={() => {
                  onOpenModal('M');
                }}>
                <Icon
                  name={IconEmail}
                  fillStroke={cssVar.cWhite}
                  color={'transparent'}
                />
                <Text style={{...styles.text, flexGrow: 1}}>
                  Cambiar correo electrónico
                </Text>
                <Icon name={IconArrowRight} color={cssVar.cWhiteV1} />
              </View>
              <View
                style={{...styles.contentAccess, borderBottomWidth: 0}}
                onTouchEnd={() => {
                  onOpenModal('P');
                }}>
                <Icon
                  name={IconPassword}
                  fillStroke={cssVar.cWhite}
                  color={'transparent'}
                />
                <Text style={{...styles.text, flexGrow: 1}}>
                  Cambiar contraseña
                </Text>
                <Icon name={IconArrowRight} color={cssVar.cWhiteV1} />
              </View>
            </View>
          </>
        )}
      </View>

   
      <Text>aaa</Text>
      <AccessEdit
        open={openModal}
        onClose={() => setOpenModal(false)}
        type={type}
      />
    </Layout>
  );
};

export default Profile;
const styles = StyleSheet.create({
  label: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.light,
  },
  text: {
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
  },
  title: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: cssVar.cBlackV2,
  },
  cardAccess: {
    borderRadius: 16,
    marginVertical: 8,
    backgroundColor: cssVar.cBlackV2,
    marginBottom: 80,
  },
  contentAccess: {
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: cssVar.cWhiteV2,
    gap: 12,
  },
});
