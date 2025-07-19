import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './transaction.entity';
import { Delivery } from '../deliveries/delivery.entity';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';

describe('TransactionController', () => {
  let controller: TransactionController;
  let mockTransactionService: jest.Mocked<TransactionService>;

  const mockProduct: Product = {
    id: 1,
    name: 'Producto Test',
    description: 'Descripción del producto test',
    price: 1000,
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
  };

  const mockCustomer: Customer = {
    id: 1,
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '3001234567',
    deliveries: [],
  };

  const mockDelivery: Delivery = {
    id: 1,
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    country: 'Colombia',
    product: mockProduct,
    customer: mockCustomer,
    transaction: {} as Transaction,
  };

  const mockTransaction: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'PENDING',
    amount: 1500,
    transactionId: 'N/A',
    delivery: mockDelivery,
    createdAt: new Date(),
  };

  const mockCreateTransactionDto: CreateTransactionDto = {
    amount: 1500,
    card: {
      number: '4111111111111111',
      cvc: '123',
      exp_month: '12',
      exp_year: '2025',
      card_holder: 'Juan Pérez',
    },
    delivery: {
      productId: 1,
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      country: 'Colombia',
      customer: mockCustomer,
    },
  };

  beforeEach(async () => {
    const mockServiceMethods = {
      createTransaction: jest.fn(),
      checkTransaction: jest.fn(),
      processWpiWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockServiceMethods,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    mockTransactionService = module.get(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una transacción exitosamente', async () => {
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);

      const result = await controller.create(mockCreateTransactionDto);

      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(mockCreateTransactionDto);
      expect(result).toEqual(mockTransaction);
    });

    it('debería manejar errores del servicio', async () => {
      const error = new Error('Error del servicio');
      mockTransactionService.createTransaction.mockRejectedValue(error);

      await expect(controller.create(mockCreateTransactionDto)).rejects.toThrow('Error del servicio');
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(mockCreateTransactionDto);
    });

    it('debería validar que el DTO se pasa correctamente', async () => {
      mockTransactionService.createTransaction.mockResolvedValue(mockTransaction);

      const result = await controller.create(mockCreateTransactionDto);

      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1500,
          card: expect.objectContaining({
            number: '4111111111111111',
            cvc: '123',
            exp_month: '12',
            exp_year: '2025',
            card_holder: 'Juan Pérez',
          }),
          delivery: expect.objectContaining({
            productId: 1,
            address: 'Calle 123 #45-67',
            city: 'Bogotá',
            country: 'Colombia',
                  customer: expect.objectContaining({
        fullName: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '3001234567',
      }),
          }),
        })
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('processWebhook', () => {
    it('debería procesar webhook exitosamente', async () => {
      const mockPayload = {
        data: {
          transaction: {
            id: 'wpi_transaction_123',
            reference: 'ref_transaction-uuid-123',
            status: 'APPROVED',
          },
        },
      };

      const expectedResponse = { received: true };
      mockTransactionService.processWpiWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.processWebhook(mockPayload);

      expect(mockTransactionService.processWpiWebhook).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual(expectedResponse);
    });

    it('debería manejar payloads inválidos', async () => {
      const invalidPayload = {
        data: {
          transaction: {
            // Sin datos requeridos
          },
        },
      };

      const expectedResponse = { received: false };
      mockTransactionService.processWpiWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.processWebhook(invalidPayload);

      expect(mockTransactionService.processWpiWebhook).toHaveBeenCalledWith(invalidPayload);
      expect(result).toEqual(expectedResponse);
    });

    it('debería manejar payload undefined', async () => {
      const expectedResponse = { received: false };
      mockTransactionService.processWpiWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.processWebhook(undefined);

      expect(mockTransactionService.processWpiWebhook).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('debería manejar errores del servicio', async () => {
      const mockPayload = { data: { transaction: { id: '123' } } };
      const error = new Error('Error del servicio');
      mockTransactionService.processWpiWebhook.mockRejectedValue(error);

      await expect(controller.processWebhook(mockPayload)).rejects.toThrow('Error del servicio');
      expect(mockTransactionService.processWpiWebhook).toHaveBeenCalledWith(mockPayload);
    });
  });

  describe('checkTransaction', () => {
    it('debería verificar una transacción existente', async () => {
      const transactionWithRelations = {
        ...mockTransaction,
        delivery: {
          ...mockDelivery,
          product: mockProduct,
        },
      };

      mockTransactionService.checkTransaction.mockResolvedValue(transactionWithRelations);

      const result = await controller.checkTransaction('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTransactionService.checkTransaction).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(transactionWithRelations);
    });

    it('debería manejar transacciones que no existen', async () => {
      const error = new Error('No se encontró la transacción');
      mockTransactionService.checkTransaction.mockRejectedValue(error);

      await expect(controller.checkTransaction('123e4567-e89b-12d3-a456-426614174001')).rejects.toThrow('No se encontró la transacción');
      expect(mockTransactionService.checkTransaction).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
    });

    it('debería validar que el UUID se pasa correctamente', async () => {
      const transactionWithRelations = {
        ...mockTransaction,
        delivery: {
          ...mockDelivery,
          product: mockProduct,
        },
      };

      mockTransactionService.checkTransaction.mockResolvedValue(transactionWithRelations);

      const result = await controller.checkTransaction('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTransactionService.checkTransaction).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toHaveProperty('id', '123e4567-e89b-12d3-a456-426614174000');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('delivery');
    });

    it('debería manejar errores del servicio', async () => {
      const error = new Error('Error del servicio');
      mockTransactionService.checkTransaction.mockRejectedValue(error);

      await expect(controller.checkTransaction('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow('Error del servicio');
      expect(mockTransactionService.checkTransaction).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });
}); 