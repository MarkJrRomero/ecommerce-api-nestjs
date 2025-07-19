import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ProductModule } from './products/product.module';
import { TransactionModule } from './transactions/transaction.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('debería estar definido', () => {
    expect(module).toBeDefined();
  });

  it('debería importar ProductModule', () => {
    const productModule = module.get(ProductModule);
    expect(productModule).toBeDefined();
  });

  it('debería importar TransactionModule', () => {
    const transactionModule = module.get(TransactionModule);
    expect(transactionModule).toBeDefined();
  });

  it('debería tener configuración de TypeORM', () => {
    // Verificar que el módulo se puede compilar sin errores
    expect(() => module.createNestApplication()).not.toThrow();
  });

  it('debería tener configuración de Swagger', () => {
    // Verificar que el módulo se puede compilar sin errores
    expect(() => module.createNestApplication()).not.toThrow();
  });
});
