module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'cjs',
        targets: {
          node: true,
        },
      },
    ],
    '@babel/preset-typescript',
  ],
};
