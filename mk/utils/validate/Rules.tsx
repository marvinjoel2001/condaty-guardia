import {validators as loadedValidators} from '../../../src/components/validators';

export type ActionType = 'add' | 'edit' | 'del' | 'view' | 'export';

export type ValidFunctionType = (
  value: any,
  param: string[],
  field?: Record<string, any> | null,
) => string;

export type RulesColumnsType = {
  label: string;
  required?: boolean;
  rules?: string[];
  actions?: ActionType[];
};

export type RulesFieldsType = {
  [key: string]: {
    label?: string;
    required?: boolean;
    rules?: string[];
    api?: string;
  };
};

export const validRule = (
  value: any = '',
  _rule: string = '',
  formState: Record<string, any> = {},
) => {
  if (!_rule) return '';
  const [rule, params] = (_rule + ':').split(':');
  const param = params ? params.split(',') : [];

  const validations: Record<string, () => string> = {
    required: () => (!value ? 'Este campo es requerido' : ''),
    same: () => (value !== formState[param[0]] ? 'Tienen que ser iguales' : ''),
    min: () => (value?.length < param[0] ? `min ${param[0]} caracteres` : ''),
    max: () => (value?.length > param[0] ? `max ${param[0]} caracteres` : ''),
    email: () =>
      value != null && !/\S+@\S+\.\S+/.test(value)
        ? 'No es un email valido'
        : '',
    password: () =>
      value != null && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
        ? 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
        : '',
    phone: () =>
      !/^\d{8,}$/.test(value) ? 'Debe tener al menos 8 números' : '',
    alpha: () =>
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(value) ? 'No es un texto válido' : '',
    noSpaces: () => (!/^\S+$/.test(value) ? 'No debe tener espacios' : ''),
    number: () => (!/^[0-9.,-]+$/.test(value) ? 'No es un numero valido' : ''),
    integer: () =>
      !/^[0-9]+$/.test(value) ? 'No es un numero entero valido' : '',
    positive: () => (value < 0 ? 'Debe ser número positivo ' : ''),
    greater: () => (value <= param[0] ? `Debe ser mayor que ${param[0]}` : ''),
    less: () => (value >= param[0] ? `Debe ser menor que ${param[0]}` : ''),
    credential: () =>
      value == null || value == ''
        ? '' // Si el campo está vacío, no mostrar error
        : !/^[A-Z]{3}\d{3,5}$/.test(value)
        ? 'Formato incorrecto. Debe tener 3 letras seguidas de 3 a 5 números'
        : '',
    plate: () =>
      value == null || value == ''
        ? ''
        : !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9-]{5,8}$/.test(value.toUpperCase())
        ? 'La placa debe contener letras y números (5-8 caracteres)'
        : '',
    between: () =>
      Number(value) < Number(param[0]) || Number(value) > Number(param[1])
        ? `Debe estar entre ${param[0]} y ${param[1]}`
        : '',
    ...Object.keys(loadedValidators).reduce((acc, key) => {
      acc[key] = () =>
        loadedValidators[key as keyof typeof loadedValidators](
          value,
          param,
          formState,
        );
      return acc;
    }, {} as Record<string, ValidFunctionType>),
  };

  return validations[rule]?.() || '';
};

export const checkRulesFields = (
  fields: RulesFieldsType = {},
  data: Record<string, any> = {},
  action: ActionType = 'add',
) => {
  let errors: Record<string, string> = {};

  for (const key in fields) {
    if (!fields[key].rules) continue;

    const value = data[key] || '';
    (fields[key].rules || []).forEach(rule => {
      const [ruleName, ruleActions] = rule.split('*');

      if (!ruleName || (ruleActions && !ruleActions.includes(action[0])))
        return;

      const error = validRule(value, ruleName, data);
      if (error) errors[key] = error;
    });
  }

  return errors;
};

type CheckRulesType = {
  value: any;
  rules: string[];
  errors?: Record<string, string> | null;
  key?: string | null;
  data?: Record<string, any>;
};
export const checkRules = ({
  value = '',
  rules = [],
  errors = null,
  key = null,
  data = {},
}: CheckRulesType): string | Record<string, string> | null => {
  let error: string = '';
  if (!rules || rules.length == 0) return errors || error;
  rules.forEach(rule => {
    if (!rule || error != '' || (value == '' && rule != 'required')) return;
    error = validRule(value, rule, data);
  });
  return errors
    ? error
      ? {...errors, [key || 'error']: error}
      : errors
    : error;
};

export const getParamFields = (
  data: Record<string, any> = {},
  fields: RulesFieldsType = {},
  action: ActionType = 'add',
) => {
  return Object.entries(fields).reduce((param: any, [key, el]) => {
    const apiIndex: number = (el.api + '').indexOf(action.charAt(0));
    console.log('getfield', key, el, apiIndex, action, param);
    if (apiIndex === -1) {
      console.log('apiIndex', key, el, apiIndex);
      return param;
    }

    const hasAsterisk = (el.api + '').charAt(apiIndex + 1) === '*';
    const isEmptyValue = !data[key] || (data[key] + '').trim() === '';

    if (hasAsterisk && isEmptyValue) {
      console.log(
        'isEmptyValue',
        key,
        data[key],
        hasAsterisk,
        isEmptyValue,
        el,
      );

      return param;
    }

    param[key] = data[key];
    return param;
  }, {});
};

export const hasErrors = (errors: Record<string, string>) => {
  return Object.keys(errors).length > 0;
};
