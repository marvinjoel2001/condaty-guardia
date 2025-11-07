const configApp = {
  API_URL: 'https://phplaravel-1383823-5943224.cloudwaysapps.com/api',
  API_URL_PROD: 'https://phplaravel-1383823-5943224.cloudwaysapps.com/api',
  API_URL_DEV: 'https://phplaravel-1214481-5270819.cloudwaysapps.com/api',
  // API_URL_DEV: 'https://unnotched-unabsorbingly-naomi.ngrok-free.dev/api',
  API_URL_TEST: 'https://phplaravel-1214481-5534746.cloudwaysapps.com/api',
  API_URL_DEMO: 'https://phplaravel-1383823-5546919.cloudwaysapps.com/api',
  APP_NAME: 'Condaty Guards',
  APP_DESCRIPTION: 'Guardias Control de Accesos',
  APP_LOGO: '/assets/images/logo/logo.svg',
  APP_LOGIN_USER: 'CI',
  APP_USER: '/guards/',
  APP_LOGIN_PASS: 'Password',
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
  APP_PUSHER_BEAMS_INTEREST_PREFIX: 'condatyprod',
  APP_PUSHER_BEAMS_INTERESTS: 'guards,gral,alerts-1,alerts-3',
  APP_SIGNAL_KEY: '13cc913d-247b-4dc8-b5f1-54e64d173818',
  APP_INSTANTDB_APP_ID: '324b0c54-bf82-437e-9a31-fbc637ab61d2',
  APP_INSTANTDB_APP_ID_DEV: '8c5fd947-ecd0-4774-8d1a-1e503c1ec981',
  APP_INSTANTDB_APP_ID_TEST: 'd3a70e0a-21ae-449f-b153-37a05b6ec300',
  APP_INSTANTDB_APP_ID_DEMO: 'f0c317b9-4d4c-413d-b960-b4f922b43aff',
  APP_DEBUG: 0,
};
// configApp.API_URL = configApp.API_URL_PROD;
//configApp.API_URL = configApp.API_URL_DEV;
configApp.API_URL = configApp.API_URL_TEST;
// configApp.API_URL = configApp.API_URL_DEMO;

if (process.env.NODE_ENV == 'development') {
  configApp.API_URL = configApp.API_URL_DEV; // Esto es para desarrollo en virtual
  // configApp.API_URL = configApp.API_URL_DEMO;
  // configApp.API_URL = configApp.API_URL_TEST;
}
if (configApp.API_URL == configApp.API_URL_DEV) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatydev';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_DEV;
}
if (configApp.API_URL == configApp.API_URL_TEST) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatytest';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_TEST;
}
if (configApp.API_URL == configApp.API_URL_DEMO) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatydemos';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_DEMO;
}
export default configApp;
