import { validBetweenDate, validPassword, validCi } from "./rulesApp";

export const validators = {
  betweenDate: validBetweenDate,
  password: validPassword,
  ci: validCi,
  // Añadir otros validadores aquí
};
