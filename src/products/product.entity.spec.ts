import { Product } from './product.entity';

describe('Product Entity', () => {
  let product: Product;

  beforeEach(() => {
    product = new Product();
  });

  it('debería estar definido', () => {
    expect(product).toBeDefined();
  });

  it('debería tener propiedades correctas', () => {
    product.id = 1;
    product.name = 'Producto Test';
    product.description = 'Descripción del producto test';
    product.price = 1000;
    product.stock = 10;
    product.imageUrl = 'https://example.com/image.jpg';

    expect(product.id).toBe(1);
    expect(product.name).toBe('Producto Test');
    expect(product.description).toBe('Descripción del producto test');
    expect(product.price).toBe(1000);
    expect(product.stock).toBe(10);
    expect(product.imageUrl).toBe('https://example.com/image.jpg');
  });

  it('debería permitir imageUrl opcional', () => {
    product.id = 1;
    product.name = 'Producto Test';
    product.description = 'Descripción del producto test';
    product.price = 1000;
    product.stock = 10;
    // imageUrl no se asigna

    expect(product.id).toBe(1);
    expect(product.name).toBe('Producto Test');
    expect(product.description).toBe('Descripción del producto test');
    expect(product.price).toBe(1000);
    expect(product.stock).toBe(10);
    expect(product.imageUrl).toBeUndefined();
  });

  it('debería manejar valores decimales para price', () => {
    product.price = 1500.50;

    expect(product.price).toBe(1500.50);
  });

  it('debería manejar stock cero', () => {
    product.stock = 0;

    expect(product.stock).toBe(0);
  });

  it('debería manejar stock negativo', () => {
    product.stock = -5;

    expect(product.stock).toBe(-5);
  });
}); 