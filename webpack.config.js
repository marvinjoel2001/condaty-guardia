const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);
const { presets } = require(`${appDirectory}/babel.config.js`);

const compileNodeModules = [
  // Add every react-native package that needs compiling
  'react-native-reanimated',
  'react-native-vector-icons',
  'react-native-animatable',
  'react-native-modal',
  // 'react-native-image-picker', // Aliased to mock
  // 'react-native-version-check',
  // 'react-native-drawer-layout',
  // 'react-native-gesture-handler',
  // '@react-navigation',
  // 'react-native-safe-area-context',
  // '@react-native-community/netinfo',
  // '@react-native-async-storage/async-storage',
].map(moduleName => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, 'mk'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: ['react-native-web'],
    },
  },
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

const fileLoaderConfiguration = {
  test: /\.(ttf|eot|woff|woff2)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

module.exports = {
  entry: {
    app: path.join(appDirectory, 'index.web.js'),
  },
  output: {
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
    filename: 'rnGuard.bundle.js',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-image-picker': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-version-check': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-image-resizer': path.resolve(appDirectory, 'web-mocks.js'),
      '@bam.tech/react-native-image-resizer': path.resolve(
        appDirectory,
        'web-mocks.js',
      ),
      'react-native-vision-camera': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-reanimated': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-worklets-core': path.resolve(appDirectory, 'web-mocks.js'),
      '@shopify/react-native-skia': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-fs': path.resolve(appDirectory, 'web-mocks.js'),
      '@react-native-documents/picker': path.resolve(
        appDirectory,
        'web-mocks.js',
      ),
      'react-native-onesignal': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-splash-screen': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-sound': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-device-info': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-file-viewer': path.resolve(appDirectory, 'web-mocks.js'),
      'react-native-keyboard-controller': path.resolve(
        appDirectory,
        'web-mocks.js',
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      fileLoaderConfiguration,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(appDirectory, 'public/index.html'),
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(appDirectory, 'public'),
    },
    hot: true,
  },
};
