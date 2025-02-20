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
  let [min, max]: any = param;
  if (!min) min = 4;
  if (!max) max = 10;
  const error = 'El PIN debe tener entre ' + min + ' y ' + max + ' caracteres';
  return value.length < min || value.length > max ? error : '';
};

export const validCi: ValidFunctionType = (value, param) => {
  let [min, max]: any = param;
  if (!min) min = 5;
  if (!max) max = 10;
  const error = 'El CI debe tener entre ' + min + ' y ' + max + ' numeros';
  return value.length < min || value.length > max || isNaN(value) ? error : '';
};
