import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { config } from 'dotenv';
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Requerido por Supabase
  },
  entities: [Product],
  synchronize: process.env.NODE_ENV === 'development',
});

AppDataSource.initialize()
  .then(async () => {
    const repo = AppDataSource.getRepository(Product);

    const dummyProducts = [
      {
        name: 'Gorra Negra',
        description: 'Gorra ajustable de algodón',
        price: 49.99,
        stock: 10,
      },
      {
        name: 'Camiseta Blanca',
        description: 'Camiseta blanca de manga corta',
        price: 69.99,
        stock: 8,
      },
      {
        name: 'Mug Personalizado',
        description: 'Mug de cerámica',
        price: 29.99,
        stock: 15,
      },
    ];

    for (const product of dummyProducts) {
      await repo.save(product);
    }

    console.log('Seeded successfully');
    process.exit();
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
