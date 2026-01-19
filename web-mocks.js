// Fix OneSignal mock to be robust
const mockOneSignal = {
  initialize: () => {},
  login: () => {},
  setConsentGiven: () => {},
  InAppMessages: {
    addTrigger: () => {},
    removeTrigger: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  Notifications: {
    canRequestPermission: () => Promise.resolve(true),
    permissionNative: () => Promise.resolve(2),
    getPermissionAsync: () => Promise.resolve(true),
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  User: {
    getTags: () => Promise.resolve({}),
    addTags: () => {},
    logout: () => {},
    pushSubscription: {
      getOptedInAsync: () => Promise.resolve(true),
      getIdAsync: () => Promise.resolve('mock-id'),
      getTokenAsync: () => Promise.resolve('mock-token'),
      optIn: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    },
  },
  Debug: {
    setLogLevel: () => {},
    setAlertLevel: () => {},
  },
  logout: () => {},
};

module.exports = {
  // React Native Reanimated mocks
  default: {
    View: require('react-native').View,
    Text: require('react-native').Text,
    Image: require('react-native').Image,
    ScrollView: require('react-native').ScrollView,
    createAnimatedComponent: component => component,
  },
  useSharedValue: initialValue => ({ value: initialValue }),
  useAnimatedStyle: styleFactory => styleFactory(),
  withSpring: value => value,
  withTiming: value => value,
  withSequence: (...args) => args[args.length - 1],
  withDelay: (_, value) => value,
  runOnJS: fn => fn,
  runOnUI: fn => fn,
  Easing: {
    inOut: fn => fn,
    ease: fn => fn,
  },

  // Common mocks
  addListener: () => {},
  removeListeners: () => {},

  // Camera/Image mocks
  Camera: () => null,
  useCameraDevices: () => ({}),
  useCameraDevice: () => ({}),
  useCameraPermission: () => ({
    hasPermission: true,
    requestPermission: () => Promise.resolve(true),
  }),
  useFrameProcessor: () => {},
  CodeScanner: {},

  // Image Picker
  launchCamera: () => Promise.resolve({ assets: [] }),
  launchImageLibrary: () => Promise.resolve({ assets: [] }),

  // Version Check
  getCountry: () => 'US',
  getPackageName: () => 'com.example.app',
  getCurrentBuildNumber: () => 1,
  getCurrentVersion: () => '1.0.0',
  getStoreUrl: () => Promise.resolve(''),
  getLatestVersion: () => Promise.resolve('1.0.0'),
  needUpdate: () => Promise.resolve({ isNeeded: false }),

  // FS mocks
  mkdir: () => Promise.resolve(),
  moveFile: () => Promise.resolve(),
  copyFile: () => Promise.resolve(),
  pathForBundle: () => '',
  pathForGroup: () => '',
  getFSInfo: () => Promise.resolve({}),
  getAllExternalFilesDirs: () => Promise.resolve([]),
  unlink: () => Promise.resolve(),
  exists: () => Promise.resolve(false),
  stopDownload: () => {},
  resumeDownload: () => {},
  isResumable: () => {},
  stopUpload: () => {},
  completeHandlerIOS: () => {},
  readDir: () => Promise.resolve([]),
  readDirAssets: () => Promise.resolve([]),
  existsAssets: () => Promise.resolve(false),
  readdir: () => Promise.resolve([]),
  setReadable: () => Promise.resolve(),
  stat: () => Promise.resolve({}),
  readFile: () => Promise.resolve(''),
  read: () => Promise.resolve(''),
  readFileAssets: () => Promise.resolve(''),
  hash: () => Promise.resolve(''),
  copyFileAssets: () => Promise.resolve(),
  copyFileAssetsIOS: () => Promise.resolve(),
  copyAssetsVideoIOS: () => Promise.resolve(),
  writeFile: () => Promise.resolve(),
  appendFile: () => Promise.resolve(),
  write: () => Promise.resolve(),
  downloadFile: () => ({ jobId: 1, promise: Promise.resolve() }),
  uploadFiles: () => ({ jobId: 1, promise: Promise.resolve() }),
  touch: () => Promise.resolve(),
  MainBundlePath: '',
  CachesDirectoryPath: '',
  DocumentDirectoryPath: '',
  ExternalDirectoryPath: '',
  ExternalStorageDirectoryPath: '',
  TemporaryDirectoryPath: '',
  LibraryDirectoryPath: '',
  PicturesDirectoryPath: '',

  // Image Resizer
  createResizedImage: () =>
    Promise.resolve({ uri: '', path: '', name: '', size: 0 }),

  // Worklets
  useWorklet: () => {},

  // Document Picker
  pick: () => Promise.resolve([]),
  types: {},

  // OneSignal
  OneSignal: mockOneSignal,
  LogLevel: {
    None: 0,
    Fatal: 1,
    Error: 2,
    Warn: 3,
    Info: 4,
    Debug: 5,
    Verbose: 6,
  },

  // Other potential crashers
  SplashScreen: {
    hide: () => {},
    show: () => {},
  },
  Sound: {
    setCategory: () => {},
  },
  DeviceInfo: {
    getVersion: () => '1.0.0',
    getBuildNumber: () => '1',
    getBundleId: () => 'com.example.app',
    getSystemName: () => 'Web',
    getSystemVersion: () => '1.0',
  },
  RNFileViewer: {
    open: () => Promise.resolve(),
  },
  KeyboardController: {
    setInputMode: () => {},
    setDefaultMode: () => {},
  },
};

// Also support default export for libraries that use it (like react-native-version-check)
module.exports.default = module.exports;
