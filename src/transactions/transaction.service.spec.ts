import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { Delivery } from '../deliveries/delivery.entity';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';
import { ProductService } from '../products/product.service';
import { WpiService } from './wpi.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockTransactionRepo: jest.Mocked<Repository<Transaction>>;
  let mockDeliveryRepo: jest.Mocked<Repository<Delivery>>;
  let mockCustomerRepo: jest.Mocked<Repository<Customer>>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockWpiService: jest.Mocked<WpiService>;

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
    id: 'transaction-uuid-123',
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
    const mockRepositoryMethods = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockProductServiceMethods = {
      findById: jest.fn(),
      reduceStock: jest.fn(),
      increaseStock: jest.fn(),
    };

    const mockWpiServiceMethods = {
      tokenizeCard: jest.fn(),
      createTransactionWpi: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepositoryMethods,
        },
        {
          provide: getRepositoryToken(Delivery),
          useValue: mockRepositoryMethods,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepositoryMethods,
        },
        {
          provide: ProductService,
          useValue: mockProductServiceMethods,
        },
        {
          provide: WpiService,
          useValue: mockWpiServiceMethods,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    mockTransactionRepo = module.get(getRepositoryToken(Transaction));
    mockDeliveryRepo = module.get(getRepositoryToken(Delivery));
    mockCustomerRepo = module.get(getRepositoryToken(Customer));
    mockProductService = module.get(ProductService);
    mockWpiService = module.get(WpiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('debería crear una transacción exitosamente', async () => {
      // Arrange
      mockProductService.findById.mockResolvedValue(mockProduct);
      mockDeliveryRepo.create.mockReturnValue(mockDelivery);
      mockDeliveryRepo.save.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockReturnValue(mockTransaction);
      mockTransactionRepo.save.mockResolvedValue(mockTransaction);
      mockWpiService.tokenizeCard.mockResolvedValue('tok_test_123');
      mockWpiService.createTransactionWpi.mockResolvedValue({
        data: { status: 'APPROVED' },
        id: 'wpi_transaction_123',
      });
      mockCustomerRepo.create.mockReturnValue(mockCustomer);
      mockCustomerRepo.save.mockResolvedValue(mockCustomer);
      mockProductService.reduceStock.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      // Act
      const result = await service.createTransaction(mockCreateTransactionDto);

      // Assert
      expect(mockProductService.findById).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(mockDeliveryRepo.create).toHaveBeenCalledWith({
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        country: 'Colombia',
        product: mockProduct,
        customer: mockCustomer,
      });
      expect(mockTransactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING',
          amount: 1500,
          transactionId: 'N/A',
        })
      );
      expect(mockWpiService.tokenizeCard).toHaveBeenCalledWith({
        number: '4111111111111111',
        cvc: '123',
        exp_month: '12',
        exp_year: '2025',
        card_holder: 'Juan Pérez',
      });
      expect(mockWpiService.createTransactionWpi).toHaveBeenCalledWith({
        token: 'tok_test_123',
        amountInCents: 150000,
        reference: expect.stringMatching(/^ref_\d+$/),
        customerEmail: 'juan@example.com',
      });
      expect(mockProductService.reduceStock).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('debería lanzar NotFoundException cuando el producto no existe', async () => {
      mockProductService.findById.mockResolvedValue(null);

      await expect(service.createTransaction(mockCreateTransactionDto))
        .rejects.toThrow(NotFoundException);
      expect(mockProductService.findById).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException cuando el producto no tiene stock', async () => {
      const productWithoutStock = { ...mockProduct, stock: 0 };
      mockProductService.findById.mockResolvedValue(productWithoutStock);

      await expect(service.createTransaction(mockCreateTransactionDto))
        .rejects.toThrow(NotFoundException);
      expect(mockProductService.findById).toHaveBeenCalledWith(1);
    });

    it('debería lanzar BadRequestException cuando el monto es menor a 1500', async () => {
      const dtoWithLowAmount = { ...mockCreateTransactionDto, amount: 1000 };
      mockProductService.findById.mockResolvedValue(mockProduct);

      await expect(service.createTransaction(dtoWithLowAmount))
        .rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException cuando el nombre del titular es muy corto', async () => {
      const dtoWithShortName = {
        ...mockCreateTransactionDto,
        card: { ...mockCreateTransactionDto.card, card_holder: 'Juan' },
      };
      mockProductService.findById.mockResolvedValue(mockProduct);

      await expect(service.createTransaction(dtoWithShortName))
        .rejects.toThrow(BadRequestException);
    });

    it('debería manejar errores de Wpi y marcar transacción como DECLINED', async () => {
      // Arrange
      mockProductService.findById.mockResolvedValue(mockProduct);
      mockDeliveryRepo.create.mockReturnValue(mockDelivery);
      mockDeliveryRepo.save.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockReturnValue(mockTransaction);
      mockTransactionRepo.save.mockResolvedValue(mockTransaction);
      mockWpiService.tokenizeCard.mockRejectedValue({
        response: {
          data: {
            error: {
              messages: ['Error de tarjeta'],
            },
          },
        },
      });

      // Act & Assert
      await expect(service.createTransaction(mockCreateTransactionDto))
        .rejects.toThrow(BadRequestException);

      expect(mockTransactionRepo.save).toHaveBeenCalledWith({
        ...mockTransaction,
        status: 'DECLINED',
      });
    });

    it('debería manejar errores de Wpi sin estructura de error específica', async () => {
      // Arrange
      mockProductService.findById.mockResolvedValue(mockProduct);
      mockDeliveryRepo.create.mockReturnValue(mockDelivery);
      mockDeliveryRepo.save.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockReturnValue(mockTransaction);
      mockTransactionRepo.save.mockResolvedValue(mockTransaction);
      mockWpiService.tokenizeCard.mockRejectedValue({
        response: {
          data: {
            error: {
              messages: ['Error genérico'],
            },
          },
        },
      });

      // Act & Assert
      await expect(service.createTransaction(mockCreateTransactionDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('checkTransaction', () => {
    it('debería retornar una transacción existente', async () => {
      const transactionWithRelations = {
        ...mockTransaction,
        delivery: {
          ...mockDelivery,
          product: mockProduct,
        },
      };

      mockTransactionRepo.findOne.mockResolvedValue(transactionWithRelations);

      const result = await service.checkTransaction('transaction-uuid-123');

      expect(mockTransactionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'transaction-uuid-123' },
        relations: ['delivery', 'delivery.product'],
      });
      expect(result).toEqual(transactionWithRelations);
    });

    it('debería lanzar NotFoundException cuando la transacción no existe', async () => {
      mockTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.checkTransaction('non-existent-uuid'))
        .rejects.toThrow(NotFoundException);

      expect(mockTransactionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-uuid' },
        relations: ['delivery', 'delivery.product'],
      });
    });
  });

  describe('processWpiWebhook', () => {
    it('debería retornar received: false cuando payload es undefined', async () => {
      const result = await service.processWpiWebhook(undefined);

      expect(result).toEqual({ received: false });
    });

    it('debería retornar received: false cuando faltan datos de transacción', async () => {
      const invalidPayload = {
        data: {
          transaction: {
            // Sin reference ni id
          },
        },
      };

      const result = await service.processWpiWebhook(invalidPayload);

      expect(result).toEqual({ received: false });
    });

    it('debería procesar webhook exitosamente para transacción aprobada', async () => {
      const validPayload = {
        data: {
          transaction: {
            id: 'wpi_transaction_123',
            reference: 'ref_transaction-uuid-123',
            status: 'APPROVED',
          },
        },
      };

      const transactionWithRelations = {
        ...mockTransaction,
        delivery: {
          ...mockDelivery,
          product: mockProduct,
        },
      };

      mockTransactionRepo.findOne.mockResolvedValue(transactionWithRelations);
      mockTransactionRepo.save.mockResolvedValue(transactionWithRelations);

      const result = await service.processWpiWebhook(validPayload);

      expect(mockTransactionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'transaction-uuid-123' },
        relations: ['delivery', 'delivery.product'],
      });
      expect(mockTransactionRepo.save).toHaveBeenCalledWith({
        ...transactionWithRelations,
        status: 'APPROVED',
        transactionId: 'wpi_transaction_123',
      });
      expect(result).toEqual({ received: true });
    });

    it('debería procesar webhook y aumentar stock cuando transacción es declinada', async () => {
      const validPayload = {
        data: {
          transaction: {
            id: 'wpi_transaction_123',
            reference: 'ref_transaction-uuid-123',
            status: 'DECLINED',
          },
        },
      };

      const transactionWithRelations = {
        ...mockTransaction,
        delivery: {
          ...mockDelivery,
          product: mockProduct,
        },
      };

      mockTransactionRepo.findOne.mockResolvedValue(transactionWithRelations);
      mockTransactionRepo.save.mockResolvedValue(transactionWithRelations);
      mockProductService.increaseStock.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.processWpiWebhook(validPayload);

      expect(mockTransactionRepo.save).toHaveBeenCalledWith({
        ...transactionWithRelations,
        status: 'DECLINED',
        transactionId: 'wpi_transaction_123',
      });
      expect(mockProductService.increaseStock).toHaveBeenCalledWith(1);
      expect(result).toEqual({ received: true });
    });

    it('debería retornar received: false cuando la transacción no existe en BD', async () => {
      const validPayload = {
        data: {
          transaction: {
            id: 'wpi_transaction_123',
            reference: 'ref_non-existent-transaction',
            status: 'APPROVED',
          },
        },
      };

      mockTransactionRepo.findOne.mockResolvedValue(null);

      const result = await service.processWpiWebhook(validPayload);

      expect(result).toEqual({ received: false });
    });
  });
}); 