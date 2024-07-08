'use strict';

module.exports = {
  delay: false,
  bail: true,
  require: [
    'ts-node/register/transpile-only',
    'tsconfig-paths/register',
    './src/commands/mochaPrepare.js',
  ],
};
