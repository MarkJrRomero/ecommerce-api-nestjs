import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, UpdateResult } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepo.find();
  }

  findById(id: number): Promise<Product | null> {
    return this.productRepo.findOne({ where: { id } });
  }

  reduceStock(id: number): Promise<UpdateResult> {
    return this.productRepo.update(id, { stock: () => 'stock - 1' });
  }

  increaseStock(id: number): Promise<UpdateResult> {
    return this.productRepo.update(id, { stock: () => 'stock + 1' });
  }

  findAvailable(): Promise<Product[]> {
    return this.productRepo.find({
      where: {
        stock: MoreThan(0),
      },
    });
  }

  async createMockupProducts(): Promise<Product[]> {
    const mockupProducts = [
      {
        name: 'Laptop Pro 15"',
        description: 'Laptop de alto rendimiento con procesador Intel i7, 16GB RAM y SSD de 512GB',
        price: 1299.99,
        stock: 10,
        imageUrl: 'https://via.placeholder.com/400x300?text=Laptop+Pro',
      },
      {
        name: 'Smartphone Galaxy',
        description: 'Teléfono inteligente con pantalla AMOLED de 6.5", cámara de 64MP y batería de 5000mAh',
        price: 699.99,
        stock: 25,
        imageUrl: 'https://via.placeholder.com/400x300?text=Smartphone',
      },
      {
        name: 'Auriculares Inalámbricos',
        description: 'Auriculares con cancelación de ruido activa, batería de 30 horas y sonido Hi-Fi',
        price: 249.99,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/400x300?text=Auriculares',
      },
      {
        name: 'Smartwatch Fitness',
        description: 'Reloj inteligente con monitor de frecuencia cardíaca, GPS y resistencia al agua',
        price: 199.99,
        stock: 30,
        imageUrl: 'https://via.placeholder.com/400x300?text=Smartwatch',
      },
      {
        name: 'Tablet 10"',
        description: 'Tablet con pantalla Full HD, 8GB RAM, almacenamiento de 128GB y soporte para lápiz óptico',
        price: 449.99,
        stock: 15,
        imageUrl: 'https://via.placeholder.com/400x300?text=Tablet',
      },
    ];

    const createdProducts = await this.productRepo.save(mockupProducts);
    return createdProducts;
  }
}
