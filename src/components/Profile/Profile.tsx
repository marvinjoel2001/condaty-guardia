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
  Alert,
} from 'react-native';
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
import configApp from '../../config/config';
import Br from './Br';

const Profile = () => {
  const navigation: any = useNavigation();
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);;
  const {user, getUser, showToast, logout}: any = useAuth();
  const [formState, setFormState]: any = useState({});
  const [type, setType] = useState({}); // Para el modal AccessEdit
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors]: any = useState({});
  const {execute} = useApi();

  const lCondo: any = {C: 'Condominio', E: 'Edificio', U: 'Urbanización'};

  const client: any = user?.clients?.find((e: any) => e.id == user.client_id);

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
          ...(userData ?? {}),
          avatar:
            prevState?.avatar && typeof prevState.avatar === 'string' && prevState.avatar.startsWith('data:image')
              ? prevState.avatar
              : userData?.avatar || null,
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      showToast('Error al cargar datos del perfil', 'error');
    }
  };

  useEffect(() => {
    if (!isEdit) {
      setFormState({
        ...user,
        avatar: user?.avatar || null,
      });
    } else {
      setFormState((prevState: any) => ({
        ...user,
        avatar:
          prevState?.avatar && typeof prevState.avatar === 'string' && prevState.avatar.startsWith('data:image')
          ? prevState.avatar
          : user?.avatar || null,
      }));
    }
  }, [user, isEdit]);


  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const validate = () => {
    let currentErrors: any = {};
    currentErrors = checkRules({
      value: formState.name,
      rules: ['required', 'alpha'],
      key: 'name',
      errors: currentErrors,
    });
    currentErrors = checkRules({
      value: formState.middle_name,
      rules: ['alpha'],
      key: 'middle_name',
      errors: currentErrors,
    });
    currentErrors = checkRules({
      value: formState.last_name,
      rules: ['required', 'alpha'],
      key: 'last_name',
      errors: currentErrors,
    });
    currentErrors = checkRules({
      value: formState.mother_last_name,
      rules: ['alpha'],
      key: 'mother_last_name',
      errors: currentErrors,
    });
    currentErrors = checkRules({
      value: formState.phone,
      rules: ['required', 'phone'],
      key: 'phone',
      errors: currentErrors,
    });
    setErrors(currentErrors);
    return currentErrors;
  };

  const onSave = async () => {
    if (hasErrors(validate())) return;

    let avatarPayload;
    if (formState.avatar && typeof formState.avatar === 'string' && formState.avatar.startsWith('data:image')) {
      const base64Data = formState.avatar.split(',')[1] || formState.avatar;
      avatarPayload = {ext: 'webp', file: encodeURIComponent(base64Data)};
    }

    const newUserPayload: any = {
      name: formState.name,
      middle_name: formState.middle_name,
      last_name: formState.last_name,
      mother_last_name: formState.mother_last_name,
      phone: formState.phone,
    };
    if (avatarPayload) {
      newUserPayload.avatar = avatarPayload;
    }

    const {data, error: err} = await execute(
      configApp.APP_USER + user?.id,
      'PUT',
      newUserPayload,
      false,
      3,
    );

    if (data?.success === true) {
      await getUser();
      showToast('Perfil Actualizado', 'success');
      setIsEdit(false);
      setErrors({});
    } else {
      showToast(
        err?.data?.message || 'Ocurrió un error al actualizar',
        'error',
      );
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
    }
  };

  const onOpenModal = (modalType: 'M' | 'P') => {
    setType(modalType); // 'M' para mail, 'P' para password
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


  const getAvatarSource = () => {
    if (isEdit && formState?.avatar?.startsWith('data:image')) {
      return formState.avatar;
    }
    return getUrlImages(`/GUARD-${user?.id}.webp?d=${user?.updated_at}`);
  };

  return (
    <Layout
      refresh={init}
      onBack={() => {
        isEdit ? setIsEdit(false) : navigation.goBack();
      }}
      title={'Mi perfil'}
      scroll={!isEdit}
      >

      {/* Contenedor del Avatar y botón de cámara */}
      <View style={styles.avatarContainer}>
        <Avatar
          onClick={() =>  setImagePreview(true)}
          src={getAvatarSource()}
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

      {/* Título de la sección */}
      <Text style={styles.sectionTitle}>
        {isEdit ? 'Editar perfil' : 'Datos personales'}
      </Text>

      {isEdit ? (
        <View style={{flex: 1}}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={styles.editScrollContent}
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
                    error={errors}
                    onChange={(value: any) => handleInputChange('phone', value)}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.inputContainerFullWidth}>
                  <Input
                    label={lCondo[client?.type] || 'Entidad'}
                    value={client?.name || 'No asignado'}
                    disabled={true}
                    name="condominio_display"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.inputContainerFullWidth}>
                  <Input
                    label="Dirección"
                    value={
                      user?.address ? `${user.address || ''}` : 'No asignada'
                    }
                    name="unidad_display"
                    multiline={false}
                  />
                </View>
              </View>
              <Text style={styles.infoText}>
                Los datos bloqueados son delicados, solo pueden ser modificados
                con permiso de administración de Condaty.
              </Text>

            </Form>
          </ScrollView>
          {/* Contenedor para los botones de acción, fijo abajo */}
          <View style={styles.editActionsContainer}>
            <Button
              onPress={() => {
                setIsEdit(false);
                setErrors({});
                setFormState({...user, avatar: user?.avatar || null});
              }}
              style={{...styles.buttonBase, ...styles.cancelButton}}>
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </Button>
            <Button
              onPress={onSave}
              style={{...styles.buttonBase, ...styles.saveButton}}>
              <Text style={[styles.actionButtonText, styles.saveButtonText]}>
                Guardar cambios
              </Text>
            </Button>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.card}>
            <View>
              <Text style={styles.label}>Nombre completo</Text>
              <Text style={styles.textValue}>{getFullName(user)}</Text>
            </View>
            <Br />
            <View>
            <Text style={styles.label}>Carnet de identidad</Text>
              <Text style={styles.textValue}>{user?.ci || 'Sin registrar'}</Text>
            </View>
            <Br />
            <View>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.textValue}>{user?.phone || 'Sin teléfono'}</Text>
            </View>
            <Br />
            <View>
              <Text style={styles.label}>{lCondo[client?.type]}</Text>
              <Text style={styles.textValue}>{client?.name || 'No asignado'}</Text>
            </View>
            <Br />

            <View>
              <Text style={styles.label}>Dirección</Text>
              <Text style={styles.textValue}>
                {user?.address || 'No asignado'}
              </Text>
            </View>
            {user?.dpto && user?.dpto?.length > 0 && (
              <View>
                <Text style={styles.textValue}>
                  {user?.dpto?.[0]?.nro} - {user?.dpto?.[0]?.description}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Datos de acceso</Text>
          <View style={styles.card}>
            <View
              style={styles.accessRow}
              onTouchEnd={() => {
                onOpenModal('M');
              }}>
              <Icon
                name={IconEmail}
                fillStroke={cssVar.cWhiteV1}
                color={'transparent'}
                size={20}
              />
              <Text style={styles.accessText}>Cambiar correo electrónico</Text>
              <Icon name={IconArrowRight} color={cssVar.cWhiteV1} size={18} />
            </View>
            <Br />
            <View
              style={[styles.accessRow, {borderBottomWidth: 0}]}
              onTouchEnd={() => {
                onOpenModal('P');
              }}>
              <Icon
                name={IconPassword}
                fillStroke={cssVar.cWhiteV1}
                color={'transparent'}
                size={20}
              />
              <Text style={styles.accessText}>Cambiar contraseña</Text>
              <Icon name={IconArrowRight} color={cssVar.cWhiteV1} size={18} />
            </View>
          </View>

          {/* Botón de Cerrar Sesión, se muestra al final del contenido scrolleable */}
          <View style={styles.logoutContainer}>
            <Text
              style={styles.logoutText}
              onPress={() => {
                Alert.alert('', '¿Cerrar la sesión de tu cuenta?', [
                  {text: 'Cancelar', style: 'cancel'},
                  {text: 'Salir', style: 'destructive', onPress: logout},
                ]);
              }}>
              Cerrar sesión
            </Text>
          </View>
        </View>
      )}

      {/* Modales (AvatarPreview y AccessEdit) */}
      {imagePreview && (
        <AvatarPreview
          open={imagePreview}
          onClose={() => setImagePreview(false)}
          id={user.id}
          name={getFullName(user)}
          prefijo="GUARD"
          updated_at={user?.updated_at}
        />
      )}
      {openModal && (
        <AccessEdit
          open={openModal}
          onClose={() => setOpenModal(false)}
          type={type} // 'M' o 'P'
        />
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
    marginBottom: 24,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: cssVar.cBlackV3,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: cssVar.cWhiteV2,
  },
  cameraButtonText: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  sectionTitle: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: cssVar.cBlackV2, // Color de fondo de la tarjeta


  },

  label: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  textValue: {
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  accessText: {
    flex: 1,
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  editScrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },

  inputContainer: {
    flex: 1,
  },
  inputContainerFullWidth: {
    flex: 1,
  },

  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: cssVar.cWhiteV1,
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 24,
  },

  editActionsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: cssVar.cWhiteV1,
    backgroundColor: cssVar.cBlack,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    flex: 1,
    borderColor: cssVar.cWhiteV1,
    backgroundColor: 'transparent',
  },
  buttonBase: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  saveButton: {
    flex: 2,
    backgroundColor: cssVar.cAccent,
    borderColor: cssVar.cAccent,
  },
  actionButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  cancelButtonText: {
    color: cssVar.cWhiteV1,
  },
  saveButtonText: {
    color: cssVar.cBlack,
  },
  logoutContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: -140,
    left: 0,
    right: 0,
    paddingVertical: 30,
    marginTop: 10,
  },
  logoutText: {
    color: cssVar.cError,
    textDecorationLine: 'underline',
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
});

