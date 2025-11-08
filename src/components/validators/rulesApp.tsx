import {GMT} from '../../../mk/utils/dates';
import {ValidFunctionType} from '../../../mk/utils/validate/Rules';

export const validBetweenDate: ValidFunctionType = (value, param) => {
  const [start, end] = param.map(date => new Date(date));
  start.setHours(start.getHours() - GMT);
  end.setHours(end.getHours() - GMT);

  const formatDate = (date: Date) =>
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return new Date(value) < start || new Date(value) > end
    ? `Debe estar entre ${formatDate(start)} y ${formatDate(end)}`
    : '';
};

export const validPassword: ValidFunctionType = (value, param) => {
  if (!value || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
    return 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
  }
  return '';
};

export const validCi: ValidFunctionType = (value, param) => {
  let [min, max]: any = param;
  if (!min) min = 7;
  if (!max) max = 10;
  const error = 'El CI debe tener entre ' + min + ' y ' + max + ' numeros';
  return value.length < min || value.length > max || isNaN(value) ? error : '';
};
