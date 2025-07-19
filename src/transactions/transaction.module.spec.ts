import { Test, TestingModule } from '@nestjs/testing';
import { TransactionModule } from './transaction.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { WpiService } from './wpi.service';

describe('TransactionModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TransactionModule],
    })
    .overrideProvider('TransactionRepository')
    .useValue({})
    .overrideProvider('DeliveryRepository')
    .useValue({})
    .overrideProvider('CustomerRepository')
    .useValue({})
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

  it('debería proporcionar TransactionController', () => {
    const controller = module.get<TransactionController>(TransactionController);
    expect(controller).toBeDefined();
  });

  it('debería proporcionar TransactionService', () => {
    const service = module.get<TransactionService>(TransactionService);
    expect(service).toBeDefined();
  });

  it('debería proporcionar WpiService', () => {
    const service = module.get<WpiService>(WpiService);
    expect(service).toBeDefined();
  });

  it('debería tener TransactionController inyectado con TransactionService', () => {
    const controller = module.get<TransactionController>(TransactionController);
    expect(controller).toHaveProperty('service');
  });
}); 