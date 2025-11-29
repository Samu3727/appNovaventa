const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuración para web
config.resolver.sourceExts.push('web.js', 'web.jsx', 'web.ts', 'web.tsx');

module.exports = config;
