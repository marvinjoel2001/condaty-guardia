import React, {useState, useEffect} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import useAuth from '../../../mk/hooks/useAuth';
import Button from '../../../mk/components/forms/Button/Button';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {
  IconArrowRight,
  IconCamera,
  IconEmail,
  IconPassword,
  IconEdit,
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
  const [imageData, setImageData] = useState('');
  const {user, getUser, setUser, showToast, setStore, store, logout}: any =
    useAuth();
  const [formState, setFormState]: any = useState({});
  const [type, setType] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors]: any = useState({});
  const {execute} = useApi();
  const lDpto: any = {C: 'Casa', L: 'Lote', D: 'Departamento'};
  const lCondo: any = {C: 'Condominio', E: 'Edificio', U: 'Urbanizacion'};
  const screen = Dimensions.get('window');

  const client: any = user?.clients?.find((e: any) => e.id == user.client_id);
  const currentClient: any = user?.clients?.find(
    (e: any) => e?.pivot?.client_id == user.client_id,
  );

  useFocusEffect(
    React.useCallback(() => {
      init();
      if (!isEdit) {
        setIsEdit(false);
      }
      if (!formState.avatar) {
        setFormState((prevState: any) => ({
          ...prevState,
          avatar: null,
        }));
        setImageData('');
      }
      const onBackPress = () => {
        if (isEdit) {
          setIsEdit(false);
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [isEdit]),
  );

  const init = async () => {
    try {
      const userData = await getUser();
      if (userData) {
        setFormState((prevState: any) => ({
          ...prevState,
          ...(userData || {}),
          avatar:
            prevState &&
            prevState.avatar &&
            prevState.avatar.startsWith('data:image')
              ? prevState.avatar
              : (userData && userData.avatar) ||
                (prevState && prevState.avatar) ||
                null,
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      showToast('Error al cargar datos del perfil', 'error');
    }
  };

  useEffect(() => {
    if (!isEdit) {
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        ...user,
        avatar:
          user?.avatar ||
          (prevFormState.avatar &&
          typeof prevFormState.avatar === 'string' &&
          prevFormState.avatar.startsWith('data:image')
            ? prevFormState.avatar
            : user?.avatar || null),
      }));
    } else {
      setFormState((prevFormState: any) => {
        const {avatar, ...restOfUser} = user;
        return {
          ...prevFormState,
          ...restOfUser,
          avatar:
            prevFormState.avatar &&
            typeof prevFormState.avatar === 'string' &&
            prevFormState.avatar.startsWith('data:image')
              ? prevFormState.avatar
              : prevFormState.avatar || user?.avatar || null,
        };
      });
    }
  }, [user, isEdit]);

  const handleEdit = () => {
    setFormState((prevState: any) => ({...user, avatar: user?.avatar || null}));
    setIsEdit(!isEdit);
    setErrors({});
  };

  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

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
    setErrors(errors);
    return errors;
  };

  const onSave = async () => {
    if (hasErrors(validate())) {
      return;
    }
    let avatarPayload;
    if (
      formState.avatar &&
      typeof formState.avatar === 'string' &&
      formState.avatar.length > 1000
    ) {
      avatarPayload = {ext: 'webp', file: encodeURIComponent(formState.avatar)};
    }

    const newUser: any = {
      ci: formState.ci,
      name: formState.name,
      middle_name: formState.middle_name,
      last_name: formState.last_name,
      mother_last_name: formState.mother_last_name,
      phone: formState.phone,
      avatar: avatarPayload,
      address: formState.address,
    };

    const {data, error: err} = await execute(
      configApp.APP_USER + user?.id,
      'PUT',
      newUser,
      false,
      3,
    );

    if (data?.success === true) {
      await getUser();
      showToast('Perfil Actualizado', 'success');
      handleEdit();
      setErrors({});
    } else {
      showToast('Ocurrió un error', 'error');
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
    }
  };

  const onOpenModal = (type: any) => {
    setType(type);
    setFormState((prevState: any) => ({
      ...prevState,
      newEmail: '',
      password: '',
      pinned: 0,
      code: '',
      enableButton: false,
    }));
    setOpenModal(true);
  };

  return (
    <Layout
      refresh={() => getUser()}
      onBack={() => {
        if (imageData) {
          setImagePreview(false);
          setImageData('');
        }
        isEdit ? setIsEdit(false) : navigation.navigate('Home');
      }}
      title={'Mi perfil'}
      rigth={
        isEdit ? null : (
          <Icon
            name={IconEdit}
            size={24}
            color={cssVar.cWhite}
            onPress={handleEdit}
          />
        )
      }
      style={{}}>
      <View style={styles.avatarContainer}>
        <Avatar
          onClick={() => setImagePreview(true)}
          src={
            formState.avatar &&
            isEdit &&
            formState.avatar.startsWith('data:image') // Asegura que sea un base64
              ? formState.avatar // Usa directamente si es base64 completo
              : formState.avatar && isEdit // Si es solo el string base64 sin el prefijo
              ? 'data:image/jpg;base64,' + formState.avatar
              : getUrlImages(
                  '/GUARD-' + user?.id + '.webp?d=' + user?.updated_at,
                )
          }
          w={116}
          h={116}
          name={getFullName(user)}
          style={{width: 116, height: 116}}
        />

        {isEdit && (
          <View
            style={styles.cameraButton}
            onTouchEnd={() => {
              uploadImage({formState, setFormState, showToast});
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon
                name={IconCamera}
                fillStroke={cssVar.cWhiteV1}
                color={'transparent'}
              />
              <Text
                style={{
                  color: cssVar.cWhiteV1,
                  fontFamily: FONTS.semiBold,
                  fontSize: 12,
                }}>
                Agregar
              </Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.title}>
        {isEdit ? 'Editar perfil' : 'Datos personales'}
      </Text>

      {isEdit ? (
        <View style={{flex: 1}}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{
              flexGrow: 1, // Para que el contenido pueda empujar el padding
              paddingBottom: 85, // Espacio para los botones. Ajusta si es necesario.
            }}
            keyboardShouldPersistTaps="handled">
            <Form behaviorIos="position" keyboardVerticalOffset={100}>
              <InputFullName
                formState={formState}
                errors={errors}
                handleChangeInput={handleInputChange}
                disabled={false}
                inputGrid={true}
              />
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Input
                    label="Carnet de identidad"
                    value={user?.ci || 'Sin registrar'}
                    disabled={true}
                    name="ci_display"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Input
                    label="Teléfono"
                    value={formState.phone || ''}
                    keyboardType="phone-pad"
                    name="phone"
                    required
                    error={errors.phone}
                    onChange={(value: any) => handleInputChange('phone', value)}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Input
                    label={lCondo[client?.type] || 'Condominio'}
                    value={client?.name || 'No asignado'}
                    disabled={true}
                    name="condominio_display"
                  />
                </View>
                <View style={styles.inputContainerUnit}>
                  <Input
                    label="Domicilio"
                    value={user?.address || 'No asignado'}
                    disabled={true}
                    name="unidad_display"
                    multiline={true}
                  />
                </View>
              </View>
              <Text style={styles.infoText}>
                Los campos bloqueados son delicados, solo pueden ser modificados
                con permiso de administración de Condaty.
              </Text>
            </Form>
          </ScrollView>
          {/* editActionsContainer ya tiene position: 'absolute', bottom: 0.
              Se posicionará al final del <View style={{flex: 1}}> padre. */}
          <View style={styles.editActionsContainer}>
            <Button
              onPress={() => {
                setIsEdit(false);
                setErrors({});
                setFormState((prevState: any) => ({
                  ...prevState,
                  ...user,
                  avatar: user?.avatar || null,
                }));
              }}
              style={{...styles.buttonBase, ...styles.cancelButton}}
              variant="secondary">
              <Text
                style={{
                  ...styles.buttonTextBase,
                  ...styles.cancelButtonText,
                }}>
                Cancelar
              </Text>
            </Button>
            <Button
              onPress={onSave}
              style={{...styles.buttonBase, ...styles.saveButton}}>
              <Text
                style={{...styles.buttonTextBase, ...styles.saveButtonText}}>
                Guardar cambios
              </Text>
            </Button>
          </View>
        </View>
      ) : (
        // Contenido para cuando !isEdit.
        // Este contenido será envuelto por el ScrollView de Layout porque scroll={true}
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.text}>{getFullName(user)}</Text>
            <View style={{height: 0.5, backgroundColor: cssVar.cWhiteV1}} />
            <Text style={styles.label}>Carnet de identidad</Text>
            <Text style={styles.text}>{user?.ci || 'Sin registrar'}</Text>
            <View style={{height: 0.5, backgroundColor: cssVar.cWhiteV1}} />
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.text}>{user?.phone || 'Sin teléfono'}</Text>
            <View style={{height: 0.5, backgroundColor: cssVar.cWhiteV1}} />
            <Text style={styles.label}>{lCondo[client?.type]}</Text>
            <Text style={styles.text}>{client?.name || 'No asignado'}</Text>
            <View style={{height: 0.5, backgroundColor: cssVar.cWhiteV1}} />

            <Text style={styles.label}>Domicilio</Text>
            <Text style={styles.text}>{user?.address || 'No asignado'}</Text>
            <View style={{height: 0.5, backgroundColor: cssVar.cWhiteV1}} />
            {user?.dpto && user?.dpto?.length > 0 && (
              <>
                <Text style={styles.label}>{lDpto[client?.type_dpto]}</Text>
                <Text style={styles.text}>
                  {user?.dpto?.[0]?.nro} - {user?.dpto?.[0]?.description}
                </Text>
              </>
            )}
          </View>

          {/* Datos de acceso (se muestra si !isEdit) */}
          <View>
            <Text style={styles.title}>Datos de acceso</Text>
            <View style={styles.cardAccess}>
              <View
                style={styles.contentAccess}
                onTouchEnd={() => {
                  onOpenModal('M');
                }}>
                <Icon
                  name={IconEmail}
                  fillStroke={cssVar.cWhiteV1}
                  color={'transparent'}
                />
                <Text
                  style={{
                    ...styles.textUnit,
                    flexGrow: 1,
                    color: cssVar.cWhiteV1,
                  }}>
                  Cambiar correo electrónico
                </Text>
                <Icon name={IconArrowRight} color={cssVar.cWhiteV1} />
              </View>
              <View
                style={{
                  height: 0.5,
                  backgroundColor: cssVar.cWhiteV1,
                  marginHorizontal: 16,
                }}
              />
              <View
                style={{...styles.contentAccess, borderBottomWidth: 0}}
                onTouchEnd={() => {
                  onOpenModal('P');
                }}>
                <Icon
                  name={IconPassword}
                  fillStroke={cssVar.cWhiteV1}
                  color={'transparent'}
                />
                <Text
                  style={{
                    ...styles.textUnit,
                    flexGrow: 1,
                    color: cssVar.cWhiteV1,
                  }}>
                  Cambiar contraseña
                </Text>
                <Icon name={IconArrowRight} color={cssVar.cWhiteV1} />
              </View>
            </View>
          </View>

          {!currentClient?.pivot?.titular_id && user?.dpto?.length > 0 && (
            <View style={styles.dependentSection}>
              <Text style={styles.title}>Cuentas dependientes</Text>
              <View style={styles.cardDependent}>
                <View
                  style={styles.contentDependent}
                  onTouchEnd={() => {
                    navigation.navigate('DependenciesAccounts');
                  }}>
                  <Text style={styles.textDependent}>
                    Optimice la gestión familiar en Condaty. Crea y supervisa
                    cuentas dependientes para todos los miembros de tu hogar.
                  </Text>
                  <Icon name={IconArrowRight} color={cssVar.cWhiteV1} />
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {/* AvatarPreview y AccessEdit son modales, su posicionamiento es independiente del flujo principal */}
      <AvatarPreview
        open={imagePreview}
        onClose={() => setImagePreview(false)}
        id={user.id}
        name={getFullName(user)}
        prefijo="GUARD"
        updated_at={user?.updated_at}
      />

      <AccessEdit
        open={openModal}
        onClose={() => setOpenModal(false)}
        type={type}
      />

      {/* El botón de Cerrar sesión se mostrará solo cuando !isEdit.
          En ese caso, Layout tendrá scroll={true}, por lo que este botón
          será parte del contenido desplazable de Layout. */}
      {!isEdit && (
        <View style={styles.logoutContainer}>
          <Text
            style={styles.logoutText}
            onPress={() => {
              Alert.alert('', '¿Cerrar la sesión de tu cuenta?', [
                {
                  text: 'Cancelar',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'Salir', style: 'destructive', onPress: () => logout()},
              ]);
            }}>
            Cerrar sesión
          </Text>
        </View>
      )}
    </Layout>
  );
};

export default Profile;

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
    marginBottom: 10,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: cssVar.cWhiteV2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: cssVar.cWhiteV1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  label: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.light,
    fontSize: 12,
  },
  text: {
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
    marginBottom: 12,
    fontSize: 14,
  },
  textUnit: {
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,

    fontSize: 14,
  },
  title: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginVertical: 16,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: cssVar.cBlackV2,
    gap: 16,
  },
  cardAccess: {
    borderRadius: 16,
    marginVertical: 8,
    backgroundColor: cssVar.cBlackV2,
  },
  contentAccess: {
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: cssVar.cBlackV3,
    gap: 12,
  },
  dependentSection: {
    marginBottom: 20,
  },
  cardDependent: {
    borderRadius: 16,
    backgroundColor: cssVar.cBlackV2,
  },
  contentDependent: {
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  textDependent: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    maxWidth: '85%',
    fontSize: 13,
  },
  logoutContainer: {
    alignItems: 'center',
    paddingVertical: 20,

    width: '100%',
  },
  logoutText: {
    color: cssVar.cError,
    textDecorationLine: 'underline',
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  inputContainerUnit: {
    flex: 1,
    paddingHorizontal: 5,
  },
  disabledInputStyle: {
    backgroundColor: cssVar.cBlackV3,
    color: cssVar.cWhiteV2,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: cssVar.cWhiteV1,
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 5,
  },
  editActionsContainer: {
    flexDirection: 'row', // Esto ya está bien para distribuir los botones horizontalmente
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: cssVar.cWhiteV2,
    backgroundColor: cssVar.cBlack,
    width: '100%',
  },
  buttonBase: {
    // MODIFICACIÓN AQUÍ: Quitar flex: 1
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    // MODIFICACIÓN AQUÍ: Añadir flex: 1
    borderColor: cssVar.cWhiteV1,
    marginRight: 8, // Mantenemos el margen para la separación
    flex: 1, // Este botón tomará 1 parte del espacio flexible
  },
  saveButton: {
    // MODIFICACIÓN AQUÍ: Añadir flex: 2
    backgroundColor: cssVar.cAccent,
    borderColor: cssVar.cAccent,
    flex: 2, // Este botón tomará 2 partes del espacio flexible (el doble que cancelar)
  },
  buttonTextBase: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: cssVar.cWhiteV1,
  },
  saveButtonText: {
    color: cssVar.cBlack,
  },
});
