// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// To help with Firebase "dual package hazard" or other Metro resolution issues [2, 6]
config.resolver.unstable_enablePackageExports = false;

// May help with Firebase initializeAuth crashes on Hermes with native persistence [5, 17]
config.resolver.sourceExts.push('cjs');

module.exports = config;