import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';

describe('ProductController', () => {
  let controller: ProductController;
  let mockProductService: jest.Mocked<ProductService>;

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
    const mockServiceMethods = {
      findAll: jest.fn(),
      findById: jest.fn(),
      reduceStock: jest.fn(),
      increaseStock: jest.fn(),
      findAvailable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockServiceMethods,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    mockProductService = module.get(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería retornar todos los productos', async () => {
      mockProductService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.getAll();

      expect(mockProductService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockProducts);
    });

    it('debería retornar array vacío cuando no hay productos', async () => {
      mockProductService.findAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(mockProductService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('debería manejar errores del servicio', async () => {
      const error = new Error('Error del servicio');
      mockProductService.findAll.mockRejectedValue(error);

      await expect(controller.getAll()).rejects.toThrow('Error del servicio');
      expect(mockProductService.findAll).toHaveBeenCalledWith();
    });

    it('debería retornar productos con estructura correcta', async () => {
      mockProductService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('price');
      expect(result[0]).toHaveProperty('stock');
      expect(result[0]).toHaveProperty('imageUrl');
    });
  });
}); 