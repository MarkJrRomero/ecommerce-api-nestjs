# API de E-commerce con NestJS

API RESTful para gestión de productos de e-commerce construida con NestJS, TypeORM y PostgreSQL.

## Inicio Rápido

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd ecommerce-api-nestjs
```

1. **Instalar dependencias**

```bash
npm install
```

1. **Configurar variables de entorno**

```bash
# Crear archivo .env en la raíz del proyecto basado en .env.example
```

1. **Ejecutar migraciones y seed**

```bash
# Crear productos de prueba
npx ts-node src/database/seed.ts
```

1. **Iniciar el servidor**

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## 📚 Documentación

- **API Docs**: Disponible en `/api-docs` (Swagger UI)
- **Endpoint base**: `http://localhost:3000`
