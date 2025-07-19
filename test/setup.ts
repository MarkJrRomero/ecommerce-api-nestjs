// Configuración global para Jest
import 'reflect-metadata';

// Configurar timeouts más largos para pruebas de integración
jest.setTimeout(30000);

// Mock de console.log para evitar ruido en las pruebas
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configurar variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.WPI_PUBLIC_KEY = 'pk_test_123';
process.env.WPI_SECRET_KEY = 'sk_test_123';
process.env.WPI_BASE_URL = 'https://api.wpi.com';
process.env.WPI_INTEGRITY_KEY = 'integrity_key_123'; 