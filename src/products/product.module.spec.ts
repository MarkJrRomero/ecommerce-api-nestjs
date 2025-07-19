import { Test, TestingModule } from '@nestjs/testing';
import { ProductModule } from './product.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ProductModule],
    })
    .overrideProvider('ProductRepository')
    .useValue({})
    .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('debería estar definido', () => {
    expect(module).toBeDefined();
  });

  it('debería proporcionar ProductController', () => {
    const controller = module.get<ProductController>(ProductController);
    expect(controller).toBeDefined();
  });

  it('debería proporcionar ProductService', () => {
    const service = module.get<ProductService>(ProductService);
    expect(service).toBeDefined();
  });

  it('debería tener ProductController inyectado con ProductService', () => {
    const controller = module.get<ProductController>(ProductController);
    expect(controller).toHaveProperty('productService');
  });
}); 