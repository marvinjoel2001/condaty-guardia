const configApp = {
  API_URL: 'https://phplaravel-1383823-5943224.cloudwaysapps.com/api',
  API_URL_PROD: 'https://phplaravel-1383823-5943224.cloudwaysapps.com/api',
  API_URL_DEV: 'https://phplaravel-1214481-5270819.cloudwaysapps.com/api',
  API_URL_TEST: 'https://phplaravel-1214481-5534746.cloudwaysapps.com/api',
  API_URL_DEMO: 'https://phplaravel-1383823-5546919.cloudwaysapps.com/api',
  API_URL_FER: 'https://unnotched-unabsorbingly-naomi.ngrok-free.dev/api',
  API_URL_PRE: 'https://phplaravel-1214481-6017582.cloudwaysapps.com/api',
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
  APP_INSTANTDB_APP_ID_PRE: '2a52bda1-77f8-4649-9f28-87bb86c08b5f',
  APP_DEBUG: 0,
  BUNNY_STORAGE: {
    PROD: {
      username: 'condaty-prod',
      password: 'f16d9823-0629-4763-b6c0f3d53015-8bd3-4e05',
      hostname: 'br.storage.bunnycdn.com',
      port: 21,
      connectionType: 'Passive' as const,
      storageZoneName: 'condaty-prod',
      apiKey: 'f16d9823-0629-4763-b6c0f3d53015-8bd3-4e05',
      cdnUrl: 'https://condaty-prod.bunnycdn.com',
    },
    DEV: {
      username: 'devdondaty',
      password: 'f7e20cac-35e9-485f-bcf0f00cf366-9c68-4e88',
      hostname: 'br.storage.bunnycdn.com',
      port: 21,
      connectionType: 'Passive' as const,
      storageZoneName: 'devdondaty',
      apiKey: 'f7e20cac-35e9-485f-bcf0f00cf366-9c68-4e88',
      cdnUrl: 'https://devcondaty.b-cdn.net',
    },
    TEST: {
      username: 'condaty-test',
      password: 'c49983f2-08a0-49f4-8baba779927a-7bcc-441a',
      hostname: 'br.storage.bunnycdn.com',
      port: 21,
      connectionType: 'Passive' as const,
      storageZoneName: 'condaty-test',
      apiKey: 'c49983f2-08a0-49f4-8baba779927a-7bcc-441a',
      cdnUrl: 'https://condaty-test.bunnycdn.com',
    },
    DEMO: {
      username: 'condaty-demo',
      password: '02e6e362-57ed-4517-b695cad33f36-a9f1-4120',
      hostname: 'br.storage.bunnycdn.com',
      port: 21,
      connectionType: 'Passive' as const,
      storageZoneName: 'condaty-demo',
      apiKey: '02e6e362-57ed-4517-b695cad33f36-a9f1-4120',
      cdnUrl: 'https://condaty-demo.bunnycdn.com',
    },
  },
  storageStrategy: 'bunny', // 'bunny' o 'cloudinary' según entorno
  cloudinary: {
    cloudName: 'djdo4zsfn',
    uploadPreset: 'condatyprod',
    folder: 'condaty-mobile',
  },
  NEXT_API_URL: {
    PROD: 'https://admin.condaty.com',
    PRE: 'https://condaty-pre.vercel.app',
    TEST: 'https://condaty2025test.vercel.app',
    DEV: 'https://condatydev.vercel.app',
    DEMO: 'https://condaty-demo.vercel.app', // Agregado DEMO
  },
  NEXT_API_BASE_URL: '', // Se inicializa vacío y se asigna dinámicamente
};

// configApp.API_URL = configApp.API_URL_TEST;
// configApp.API_URL = configApp.API_URL_PRE;
configApp.API_URL = configApp.API_URL_PROD;

if (process.env.NODE_ENV == 'development') {
  // configApp.API_URL = configApp.API_URL_DEV; // Esto es para desarrollo en virtual
  // configApp.API_URL = configApp.API_URL_DEMO;
  // configApp.API_URL = configApp.API_URL_FER;
}
if (configApp.API_URL == configApp.API_URL_DEV) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatydev';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_DEV;
  configApp.cloudinary.uploadPreset = 'condatydev';
  configApp.NEXT_API_BASE_URL = configApp.NEXT_API_URL.DEV;
}
if (configApp.API_URL == configApp.API_URL_TEST) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatytest';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_TEST;
  configApp.cloudinary.uploadPreset = 'condatytest';
  configApp.NEXT_API_BASE_URL = configApp.NEXT_API_URL.TEST;
}
if (configApp.API_URL == configApp.API_URL_DEMO) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatydemos';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_DEMO;
  configApp.cloudinary.uploadPreset = 'condatydemo';
  configApp.NEXT_API_BASE_URL = configApp.NEXT_API_URL.DEMO;
}

if (configApp.API_URL == configApp.API_URL_PRE) {
  configApp.APP_DEBUG = 0;
  configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX = 'condatypre';
  configApp.APP_INSTANTDB_APP_ID = configApp.APP_INSTANTDB_APP_ID_PRE;
  configApp.cloudinary.uploadPreset = 'condatypre';
  configApp.NEXT_API_BASE_URL = configApp.NEXT_API_URL.PRE;
}

if (configApp.API_URL == configApp.API_URL_PROD) {
  configApp.NEXT_API_BASE_URL = configApp.NEXT_API_URL.PROD;
  configApp.APP_DEBUG = 3;
}

// UNA SOLA LÍNEA MÁGICA (esto es todo lo nuevo que necesitas)
(configApp as any).bunny =
  configApp.API_URL === configApp.API_URL_PROD
    ? configApp.BUNNY_STORAGE.PROD
    : configApp.API_URL === configApp.API_URL_DEV
    ? configApp.BUNNY_STORAGE.DEV
    : configApp.API_URL === configApp.API_URL_TEST
    ? configApp.BUNNY_STORAGE.TEST
    : configApp.API_URL === configApp.API_URL_DEMO
    ? configApp.BUNNY_STORAGE.DEMO
    : configApp.BUNNY_STORAGE.DEV; // fallback

export default configApp;
