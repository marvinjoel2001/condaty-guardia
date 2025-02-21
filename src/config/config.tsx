const configApp = {
  API_URL: 'https://api.condaty.com/api',
  API_URL_PROD: 'https://api.condaty.com/api',
  API_URL_DEV: 'https://phplaravel-1214481-5270819.cloudwaysapps.com/api',
  // API_URL_TEST: 'https://apiuytest.elekta.app/api',
  APP_NAME: 'Condaty Guards',
  APP_DESCRIPTION: 'Guardias Control de Accesos',
  APP_LOGO: '/assets/images/logo/logo.svg',
  APP_LOGIN_USER: 'CI',
  APP_LOGIN_PASS: 'Password',
  // APP_AUTH_LOGIN: '/grd-login',
  APP_AUTH_LOGIN: '/guard-login',
  APP_AUTH_REGISTER: '/guard-register',
  APP_AUTH_LOGOUT: '/guard-logout',
  APP_AUTH_IAM: '/guard-iam',
  APP_AUTH_SUCCESS: '/',
  APP_PUSHER_KEY: 'f8cbd9dce09e392b6ac6',
  APP_PUSHER_APP_ID: '1587991',
  APP_PUSHER_SECRET: '9ad44c536b7b0e71d355',
  APP_PUSHER_CLUSTER: 'us2',
  APP_PUSHER_BEAMS_ID: '1a429a9a-7327-433f-8680-699ee5cf20a1',
  APP_PUSHER_BEAMS_KEY:
    '7FD0E6ACB435F0490C496FE34005B7E12CFE0DA08628ACD56895F616F7D567FA',
  APP_PUSHER_BEAMS_INTEREST_PREFIX: 'condaty',
  APP_PUSHER_BEAMS_INTERESTS: 'guards,gral,alerts-1,alerts-3',
  APP_SIGNAL_KEY: '13cc913d-247b-4dc8-b5f1-54e64d173818',
  APP_DEBUG: 0,
};

configApp.API_URL = configApp.API_URL_PROD;
if (process.env.NODE_ENV == 'development') {
  // configApp.API_URL = configApp.API_URL_DEV; // Esto es para desarrollo
  configApp.API_URL = configApp.API_URL_PROD;
  configApp.APP_DEBUG = 0;
}
// configApp.APP_XORKEY = configApp.API_URL;
// if (configApp.API_URL == configApp.API_URL_PROD) {
//   configApp.APP_PUSHER_KEY = configApp.APP_PUSHER_KEY_PROD;
//   configApp.APP_PUSHER_APP_ID = configApp.APP_PUSHER_APP_ID_PROD;
//   configApp.APP_PUSHER_SECRET = configApp.APP_PUSHER_SECRET_PROD;
//   configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX =
//     configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX_PROD;
// } else {
//   configApp.APP_PUSHER_KEY = configApp.APP_PUSHER_KEY_DEV;
//   configApp.APP_PUSHER_APP_ID = configApp.APP_PUSHER_APP_ID_DEV;
//   configApp.APP_PUSHER_SECRET = configApp.APP_PUSHER_SECRET_DEV;
//   configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX =
//     configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX_DEV;
// }

export default configApp;
