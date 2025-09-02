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
} from '../../icons/IconLibrary'; // Asegúrate que estas rutas de iconos sean correctas
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {uploadImage} from '../../../mk/utils/uploadFile';
import Form from '../../../mk/components/forms/Form/Form';
import InputFullName from '../../../mk/components/forms/InputFullName/InputFullName';
import Input from '../../../mk/components/forms/Input/Input';
import useApi from '../../../mk/hooks/useApi';
import AccessEdit from './AccessEdit'; // Asegúrate que esta ruta sea correcta
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';
import AvatarPreview from './AvatarPreview'; // Asegúrate que esta ruta sea correcta
import configApp from '../../config/config';

// Componente separador simple, si no tienes Br definido globalmente
const Br = () => (
  <View style={{height: 0.5, backgroundColor: cssVar.cWhiteV1, marginVertical: 4}} />
);

const Profile = () => {
  const navigation: any = useNavigation();
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  // imageData no se usa consistentemente, formState.avatar es el principal.
  // const [imageData, setImageData] = useState('');
  const {user, getUser, showToast, logout}: any = useAuth();
  const [formState, setFormState]: any = useState({});
  const [type, setType] = useState({}); // Para el modal AccessEdit
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors]: any = useState({});
  const {execute} = useApi();

  // Estas definiciones son específicas de Guardias/Residentes, las mantenemos si son necesarias
  // const lDpto: any = {C: 'Casa', L: 'Lote', D: 'Departamento'}; // No parece usarse en Guardias
  const lCondo: any = {C: 'Condominio', E: 'Edificio', U: 'Urbanización'}; // Usado en modo vista

  const client: any = user?.clients?.find((e: any) => e.id == user.client_id);

  useFocusEffect(
    React.useCallback(() => {
      // Carga inicial de datos del usuario al enfocar la pantalla
      init();
      if (!isEdit) {
        // Si no estamos en modo edición (ej. al volver de otra pantalla),
        // asegurarse que isEdit esté en false para mostrar el modo vista.
        setIsEdit(false);
      }
      // Si formState.avatar está vacío (ej. después de cancelar una selección previa sin guardar)
      // se resetea a null. Esto podría necesitar revisión si causa que una previsualización válida desaparezca.
      if (!formState.avatar) {
        setFormState((prevState: any) => ({
          ...prevState,
          avatar: null,
        }));
      }
      const onBackPress = () => {
        if (isEdit) {
          // Si estamos editando y se presiona atrás, salir del modo edición
          setIsEdit(false);
          return true; // Previene la acción por defecto (salir de la app/pantalla)
        }
        return false; // Permite la acción por defecto
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove(); // Limpiar el listener al desenfocar/desmontar
    }, [isEdit]), // Ejecutar si isEdit cambia
  );

  // Función para inicializar el estado del formulario con los datos del usuario
  const init = async () => {
    try {
      const userData = await getUser(); // Obtener datos frescos del usuario
      if (userData) {
        setFormState((prevState: any) => ({
          ...prevState, // Mantener cualquier estado previo (útil si hay campos no en userData)
          ...(userData || {}), // Sobrescribir/añadir con los datos de userData
          avatar: // Lógica para preservar la previsualización del avatar si ya es base64
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

  // Efecto para sincronizar formState con 'user' cuando 'user' o 'isEdit' cambian.
  // Se asegura que al entrar/salir del modo edición, formState refleje el estado correcto.
  useEffect(() => {
    if (!isEdit) { // Si no estamos editando (modo vista)
      setFormState({ // Usar directamente los datos de 'user'
        ...user,
        avatar: user?.avatar || null,
      });
    } else { // Si estamos editando
      // Al entrar en modo edición, popular formState desde 'user'.
      // Si ya había una previsualización de avatar en formState (base64), se intenta mantener.
      setFormState((prevState: any) => ({
        ...user, // Base son los datos del usuario
        avatar:
          prevState?.avatar && typeof prevState.avatar === 'string' && prevState.avatar.startsWith('data:image')
          ? prevState.avatar // Mantener previsualización si existe
          : user?.avatar || null, // Sino, usar el avatar del servidor
      }));
    }
  }, [user, isEdit]); // Ejecutar si 'user' o 'isEdit' cambian.

  // Maneja el cambio al modo edición
  const handleEdit = () => {
    // Al presionar "Editar", se carga formState con los datos actuales de 'user'
    // Esto asegura que empezamos a editar desde un estado limpio y conocido.
    setFormState({...user, avatar: user?.avatar || null});
    setIsEdit(!isEdit); // Cambia el estado de edición
    setErrors({}); // Limpia errores previos
  };

  // Maneja cambios en los inputs del formulario
  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Valida el formulario
  const validate = () => {
    let currentErrors: any = {};
    currentErrors = checkRules({ value: formState.name, rules: ['required', 'alpha'], key: 'name', errors: currentErrors });
    currentErrors = checkRules({ value: formState.middle_name, rules: ['alpha'], key: 'middle_name', errors: currentErrors });
    currentErrors = checkRules({ value: formState.last_name, rules: ['required', 'alpha'], key: 'last_name', errors: currentErrors });
    currentErrors = checkRules({ value: formState.mother_last_name, rules: ['alpha'], key: 'mother_last_name', errors: currentErrors });
    currentErrors = checkRules({ value: formState.phone, rules: ['required', 'phone'], key: 'phone', errors: currentErrors });
    setErrors(currentErrors);
    return currentErrors;
  };

  // Guarda los cambios del perfil
  const onSave = async () => {
    if (hasErrors(validate())) return; // Si hay errores de validación, no continuar

    let avatarPayload;
    // Si formState.avatar es una cadena base64 (nueva imagen seleccionada)
    if (formState.avatar && typeof formState.avatar === 'string' && formState.avatar.startsWith('data:image')) {
      // Extraer solo la parte base64 de la cadena
      const base64Data = formState.avatar.split(',')[1] || formState.avatar;
      avatarPayload = {ext: 'webp', file: encodeURIComponent(base64Data)};
    }

    const newUserPayload: any = {
      // ci: formState.ci, // CI no es editable por guardias
      name: formState.name,
      middle_name: formState.middle_name,
      last_name: formState.last_name,
      mother_last_name: formState.mother_last_name,
      phone: formState.phone,
      // address: formState.address, // Dirección no es editable por guardias
    };
    if (avatarPayload) {
      newUserPayload.avatar = avatarPayload;
    }

    const {data, error: err} = await execute(
      configApp.APP_USER + user?.id, // Endpoint para actualizar usuario
      'PUT',
      newUserPayload,
      false, // noWaiting
      3, // retryCount
    );

    if (data?.success === true) {
      await getUser(); // Refrescar datos del usuario desde el servidor
      showToast('Perfil Actualizado', 'success');
      setIsEdit(false); // Salir del modo edición
      setErrors({});
    } else {
      showToast(err?.data?.message || 'Ocurrió un error al actualizar', 'error');
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
    }
  };

  // Abre el modal para cambiar email/contraseña
  const onOpenModal = (modalType: 'M' | 'P') => {
    setType(modalType); // 'M' para mail, 'P' para password
    // Resetear campos del formulario del modal
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

  // Determina la URL del avatar a mostrar
  const getAvatarSource = () => {
    if (isEdit && formState.avatar && formState.avatar.startsWith('data:image')) {
      return formState.avatar; // Muestra la previsualización base64 si está editando y hay una nueva imagen
    }
    // Sino, muestra la imagen actual del servidor para Guardias
    return getUrlImages(`/GUARD-${user?.id}.webp?d=${user?.updated_at}`);
  };

  return (
    <Layout
      refresh={init} // Actualizar datos al hacer pull-to-refresh
      onBack={() => {
        // Si está en modo edición, al presionar atrás, solo sale del modo edición.
        // Sino, navega hacia atrás (Home).
        isEdit ? setIsEdit(false) : navigation.goBack();
      }}
      title={'Mi perfil'}
      /* rigth={ // Icono de editar en la cabecera, solo visible si no está en modo edición
        isEdit ? null : (
          <Icon
            name={IconEdit}
            size={24}
            color={cssVar.cWhite}
            onPress={handleEdit}
          />
        )
      } */
      // El scroll se maneja internamente dependiendo de si está en modo edición o no
      scroll={!isEdit} // Layout se encarga del scroll solo si NO estamos editando
      >

      {/* Contenedor del Avatar y botón de cámara */}
      <View style={styles.avatarContainer}>
        <Avatar
          onClick={() => isEdit && setImagePreview(true)} // Solo permite ver preview si está editando (o siempre si se prefiere)
          src={getAvatarSource()}
          w={116}
          h={116}
          name={getFullName(user)}
          style={{width: 116, height: 116}} // Redundante si w y h ya lo definen
        />
        {isEdit && (
          <View
            style={styles.cameraButton}
            onTouchEnd={() => {
              // Se asume que uploadImage actualiza formState.avatar con la base64 PURA.
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
        // ---------- MODO EDICIÓN ----------
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
                disabled={false} // Los nombres son editables
                inputGrid={true} // Para layout de 2 columnas si aplica
              />
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Input
                    label="Carnet de identidad"
                    value={user?.ci || 'Sin registrar'}
                    disabled={true} // CI no editable
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
                    label={lCondo[client?.type] || 'Entidad'} // Nombre genérico si no hay tipo
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
                      user?.address
                        ? `${user.address || ''}`
                        : 'No asignada'
                    }
                    name="unidad_display"
                    multiline={false}
                  />
                </View>
              </View>
              <Text style={styles.infoText}>
                   Los datos bloqueados son delicados, solo pueden ser modificados con permiso de administración de Condaty.
              </Text>

            </Form>
          </ScrollView>
          {/* Contenedor para los botones de acción, fijo abajo */}
          <View style={styles.editActionsContainer}>
            <Button
              onPress={() => {
                setIsEdit(false); // Salir del modo edición
                setErrors({});
                // Restaura formState a los valores originales del usuario
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
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.textValue}>{getFullName(user)}</Text>
            <Br />
            <Text style={styles.label}>Carnet de identidad</Text>
            <Text style={styles.textValue}>{user?.ci || 'Sin registrar'}</Text>
            <Br />
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.textValue}>{user?.phone || 'Sin teléfono'}</Text>
            <Br />
            <Text style={styles.label}>{lCondo[client?.type]}</Text>
            <Text style={styles.textValue}>{client?.name || 'No asignado'}</Text>
            <Br />

            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.textValue}>
              {user?.address || 'No asignado'}
            </Text>

            {user?.dpto && user?.dpto?.length > 0 && (
              <>
                {/* <Text style={styles.label}>{lDpto[client?.type_dpto]}</Text> */}
                <Text style={styles.textValue}>
                  {user?.dpto?.[0]?.nro} - {user?.dpto?.[0]?.description}
                </Text>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>Datos de acceso</Text>
          <View style={styles.card}>
            <View style={styles.accessRow} onTouchEnd={() => { onOpenModal('M'); }}>
              <Icon name={IconEmail} fillStroke={cssVar.cWhiteV1} color={'transparent'} size={20} />
              <Text style={styles.accessText}>Cambiar correo electrónico</Text>
              <Icon name={IconArrowRight} color={cssVar.cWhiteV1} size={18} />
            </View>
            <Br />
            <View style={[styles.accessRow, {borderBottomWidth: 0}]} onTouchEnd={() => { onOpenModal('P'); }}>
              <Icon name={IconPassword} fillStroke={cssVar.cWhiteV1} color={'transparent'} size={20} />
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
                  { text: 'Cancelar', style: 'cancel' },
                  {text: 'Salir', style: 'destructive', onPress: logout},
                ]);
              }}>
              Cerrar sesión
            </Text>
          </View>
        </View>
      )}

      {/* Modales (AvatarPreview y AccessEdit) */}
      <AvatarPreview
        open={imagePreview}
        onClose={() => setImagePreview(false)}
        id={user.id} // user?.id para ser seguro
        name={getFullName(user)}
        prefijo="GUARD" // Prefijo específico para guardias
        updated_at={user?.updated_at}
      />
      <AccessEdit
        open={openModal}
        onClose={() => setOpenModal(false)}
        type={type} // 'M' o 'P'
      />
    </Layout>
  );
};

export default Profile;

// --- INICIO DE ESTILOS (Adaptados de "Residentes" y ajustados para "Guardias") ---
const styles = StyleSheet.create({
  // Contenedor del Avatar
  avatarContainer: {
    alignItems: 'center',
    position: 'relative', // Para el posicionamiento absoluto del botón de cámara
    marginTop: 20,
    marginBottom: 24, // Espacio antes del título
  },
  // Botón de la cámara sobre el avatar
  cameraButton: {
    position: 'absolute',
    bottom: -2, // Ligeramente superpuesto
    backgroundColor: cssVar.cBlackV3, // Color de fondo (ejemplo)
    borderRadius: 20, // Para hacerlo circular
    padding: 8,
    borderWidth: 1,
    borderColor: cssVar.cWhiteV2,
  },
  cameraButtonText: { // Estilo para el texto "Agregar" si lo llevase
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  // Título de sección (ej. "Datos personales", "Datos de acceso")
  sectionTitle: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginVertical: 16, // Espacio arriba y abajo del título
    paddingHorizontal: 12, // Si los títulos van fuera de las tarjetas
  },
  // Tarjeta contenedora de información en modo vista
  card: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,

    backgroundColor: cssVar.cBlackV2, // Color de fondo de la tarjeta


  },
  // Etiqueta de un campo de información (ej. "Nombre completo")
  label: {
    color: cssVar.cWhiteV1, // Color más suave para la etiqueta
    fontFamily: FONTS.regular, // O FONTS.light si así está en Residentes
    fontSize: 12,
     // Pequeño espacio antes del valor
  },
  // Valor de un campo de información
  textValue: {
    color: cssVar.cWhite,
    fontFamily: FONTS.regular, // O FONTS.semiBold si se quiere más énfasis
    fontSize: 15,
    marginBottom: 2, // Espacio antes del siguiente separador o etiqueta
  },
  // Fila para opciones de acceso (email, contraseña)
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',

    // borderBottomWidth: 0.5, // El Br lo maneja o se puede poner aquí también
    // borderBottomColor: cssVar.cWhiteV2,
    gap: 12, // Espacio entre icono y texto
  },
  // Texto en las filas de acceso
  accessText: {
    flex: 1, // Para que ocupe el espacio disponible y empuje la flecha
    color: cssVar.cWhiteV1, // O cssVar.cWhiteV1 si es menos prominente
    fontFamily: FONTS.regular,
    fontSize: 14,
    paddingVertical: 4,
  },
  // Contenedor del scroll en modo edición
  editScrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Espacio para que los botones fijos no tapen el último input
  },
  // Estructura de fila para inputs en modo edición
  row: {
    flexDirection: 'row',
    // marginHorizontal: -5, // Si los inputs tienen padding interno que compensar
    marginBottom: 12, // Espacio entre filas de inputs
    gap: 10, // Espacio entre inputs en la misma fila
  },
  // Contenedor para un input individual en una fila
  inputContainer: {
    flex: 1, // Para que los inputs en la misma fila compartan espacio
    // paddingHorizontal: 5, // Si se usa marginHorizontal negativo en row
  },
  inputContainerFullWidth: { // Para inputs que ocupan todo el ancho
    flex: 1,
  },
  // Texto informativo en modo edición
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: cssVar.cWhiteV1,
    textAlign: 'left', // O 'center' si así es en Residentes
    marginTop: 20,
    marginBottom: 24,
  },
  // Contenedor fijo para los botones "Cancelar" y "Guardar"
  editActionsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,

    borderTopWidth: 1,
    borderTopColor: cssVar.cWhiteV1, // Color del borde superior
    backgroundColor: cssVar.cBlack, // Fondo del contenedor de botones
    gap: 10, // Espacio entre botones
    // position: 'absolute', // No es necesario si el View padre tiene flex:1
    // bottom: 0, left: 0, right: 0,
  },
  // Estilo base para los botones de acción
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12, // Bordes redondeados
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Borde
  },
  // Estilo específico para el botón "Cancelar"
  cancelButton: {
    flex: 1, // O un flex menor si se quiere más pequeño que Guardar
    borderColor: cssVar.cWhiteV1, // Color del borde
    backgroundColor: 'transparent', // O un color de fondo sutil
  },
  buttonBase: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // Estilo específico para el botón "Guardar"
  saveButton: {
    flex: 2, // O un flex mayor
    backgroundColor: cssVar.cAccent, // Color de acento para el botón principal
    borderColor: cssVar.cAccent,
  },
  // Estilo base para el texto de los botones de acción
  actionButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  // Texto del botón "Cancelar"
  cancelButtonText: {
    color: cssVar.cWhiteV1,
  },
  // Texto del botón "Guardar"
  saveButtonText: {
    color: cssVar.cBlack, // O cssVar.cWhite si el fondo del botón es oscuro
  },
  // Contenedor para el botón de cerrar sesión
  logoutContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: -140,
    left: 0,
    right: 0,
    paddingVertical: 30, // Espacio arriba y abajo
    marginTop: 10, // Espacio después de la última tarjeta
  },
  // Texto del botón de cerrar sesión
  logoutText: {
    color: cssVar.cError, // Color de error/peligro
    textDecorationLine: 'underline',
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
});
// --- FIN DE ESTILOS ---
