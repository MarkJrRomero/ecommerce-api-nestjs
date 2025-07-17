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

  findAvailable(): Promise<Product[]> {
    return this.productRepo.find({
      where: {
        stock: MoreThan(0),
      },
    });
  }
}
