module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.json',
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
          '.node',
        ],
        alias: {
          '@src/': './src',
        },
      },
    ],
  ],
};
