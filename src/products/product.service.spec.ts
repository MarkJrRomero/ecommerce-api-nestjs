import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ProductService } from './product.service';
import { Product } from './product.entity';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
    id: 1,
    name: 'Producto Test',
    description: 'Descripción del producto test',
    price: 1000,
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
  };

  const mockProducts: Product[] = [
    mockProduct,
    {
      id: 2,
      name: 'Producto Test 2',
      description: 'Descripción del producto test 2',
      price: 2000,
      stock: 5,
      imageUrl: 'https://example.com/image2.jpg',
    },
  ];

  beforeEach(async () => {
    const mockRepositoryMethods = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepositoryMethods,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    mockRepository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todos los productos', async () => {
      mockRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockProducts);
    });

    it('debería retornar array vacío cuando no hay productos', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('debería manejar errores de la base de datos', async () => {
      const error = new Error('Error de base de datos');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Error de base de datos');
      expect(mockRepository.find).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('debería retornar un producto por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockProduct);
    });

    it('debería retornar null cuando el producto no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });

    it('debería manejar errores de la base de datos', async () => {
      const error = new Error('Error de base de datos');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.findById(1)).rejects.toThrow('Error de base de datos');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('reduceStock', () => {
    it('debería reducir el stock en 1', async () => {
      const mockUpdateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.reduceStock(1);

      expect(mockRepository.update).toHaveBeenCalledWith(1, { stock: expect.any(Function) });
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería manejar errores de la base de datos', async () => {
      const error = new Error('Error de base de datos');
      mockRepository.update.mockRejectedValue(error);

      await expect(service.reduceStock(1)).rejects.toThrow('Error de base de datos');
      expect(mockRepository.update).toHaveBeenCalledWith(1, { stock: expect.any(Function) });
    });
  });

  describe('increaseStock', () => {
    it('debería aumentar el stock en 1', async () => {
      const mockUpdateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.increaseStock(1);

      expect(mockRepository.update).toHaveBeenCalledWith(1, { stock: expect.any(Function) });
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería manejar errores de la base de datos', async () => {
      const error = new Error('Error de base de datos');
      mockRepository.update.mockRejectedValue(error);

      await expect(service.increaseStock(1)).rejects.toThrow('Error de base de datos');
      expect(mockRepository.update).toHaveBeenCalledWith(1, { stock: expect.any(Function) });
    });
  });

  describe('findAvailable', () => {
    it('debería retornar solo productos con stock mayor a 0', async () => {
      const availableProducts = mockProducts.filter(p => p.stock > 0);
      mockRepository.find.mockResolvedValue(availableProducts);

      const result = await service.findAvailable();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          stock: expect.any(Object), // MoreThan(0)
        },
      });
      expect(result).toEqual(availableProducts);
    });

    it('debería retornar array vacío cuando no hay productos disponibles', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAvailable();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          stock: expect.any(Object), // MoreThan(0)
        },
      });
      expect(result).toEqual([]);
    });

    it('debería manejar errores de la base de datos', async () => {
      const error = new Error('Error de base de datos');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAvailable()).rejects.toThrow('Error de base de datos');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          stock: expect.any(Object), // MoreThan(0)
        },
      });
    });
  });
}); 