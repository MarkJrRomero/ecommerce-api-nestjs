// Polyfill para crypto en entornos donde no está disponible
if (typeof globalThis.crypto === 'undefined') {
  const crypto = require('crypto');
  globalThis.crypto = crypto;
} 