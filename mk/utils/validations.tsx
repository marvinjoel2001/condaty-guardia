export const checkCI = (data: any) => {
  let error = '';
  let min = 5;
  let max = 11;
  if (data == null || data == '') {
    error = 'Este campo es obligatorio';
  } else if (data.length < min) {
    error = 'Este campo requiere mínimo 5 dígitos';
  } else if (data.length > max) {
    error = 'Este campo requiere máximo 11 dígitos';
  }
  return error;
};

export const checkPasswords = (data: any) => {
  let error = '';
  let min = 4;

  if (data == null || data == '') {
    error = 'El PIN es obligatorio';
  } else if (data.length < min) {
    error = 'El PIN debe tener al menos 4 carácteres';
  }
  return error;
};

export const checkPlate = (data: any) => {
  let error = '';
  let regex = /^[0-9A-Z]{5,10}$/;

  if (data.plate == null || data.plate == '') {
    error = 'La placa es obligatoria';
  } else if (!regex.test(data)) {
    error = 'La placa no es valida';
  }
  return error;
};

export const checkName = (data: any) => {
  let error = '';
  let regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s',.-]+$/;

  if (data == null || data == '') {
    error = 'Este campo es obligatorio';
  } else if (!regex.test(data)) {
    error = 'Este campo no admite números ni carácteres especiales';
  }
  return error;
};

export const checkPhonenumber = (data: any) => {
  let error = '';
  let regex = /^[0-9]{8,10}$/; // Acepta de 8 a 10 dígitos
  if (data == null || data == '') {
    error = 'El número de teléfono es obligatorio';
  } else if (!regex.test(data)) {
    error = 'El número de teléfono no es válido';
  }
  return error;
};

export const checkEmail = (data: any) => {
  let error = '';
  let regex = /\S+@\S+\.\S+/;
  if (data == null || data == '') {
    error = 'El correo electrónico es obligatorio';
  } else if (!regex.test(data)) {
    error = 'El correo electrónico no es valido';
  }
  return error;
};
