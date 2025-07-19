import { CreateTransactionDto } from './create-transaction.dto';
import { CardDto } from './card.dto';
import { CreateDeliveryDto } from '../../deliveries/dto/create-delivery.dto';

describe('CreateTransactionDto', () => {
  let dto: CreateTransactionDto;
  let mockCardDto: CardDto;
  let mockDeliveryDto: CreateDeliveryDto;

  beforeEach(() => {
    dto = new CreateTransactionDto();
    mockCardDto = {
      number: '4111111111111111',
      cvc: '123',
      exp_month: '12',
      exp_year: '2025',
      card_holder: 'Juan Pérez',
    };
    mockDeliveryDto = {
      productId: 1,
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      country: 'Colombia',
      customer: {
        fullName: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '3001234567',
      },
    };
  });

  it('debería estar definido', () => {
    expect(dto).toBeDefined();
  });

  it('debería tener propiedades correctas', () => {
    dto.amount = 1500;
    dto.delivery = mockDeliveryDto;
    dto.card = mockCardDto;

    expect(dto.amount).toBe(1500);
    expect(dto.delivery).toEqual(mockDeliveryDto);
    expect(dto.card).toEqual(mockCardDto);
  });

  it('debería manejar valores decimales para amount', () => {
    dto.amount = 1500.50;
    expect(dto.amount).toBe(1500.50);
  });

  it('debería manejar amount cero', () => {
    dto.amount = 0;
    expect(dto.amount).toBe(0);
  });

  it('debería manejar amount negativo', () => {
    dto.amount = -100;
    expect(dto.amount).toBe(-100);
  });

  it('debería validar estructura completa del DTO', () => {
    dto.amount = 1500;
    dto.delivery = mockDeliveryDto;
    dto.card = mockCardDto;

    expect(dto).toHaveProperty('amount');
    expect(dto).toHaveProperty('delivery');
    expect(dto).toHaveProperty('card');
    expect(typeof dto.amount).toBe('number');
    expect(typeof dto.delivery).toBe('object');
    expect(typeof dto.card).toBe('object');
  });

  it('debería validar estructura completa del DTO', () => {
    dto.amount = 1500;
    dto.delivery = mockDeliveryDto;
    dto.card = mockCardDto;

    expect(dto).toHaveProperty('amount');
    expect(dto).toHaveProperty('delivery');
    expect(dto).toHaveProperty('card');
    expect(typeof dto.amount).toBe('number');
    expect(typeof dto.delivery).toBe('object');
    expect(typeof dto.card).toBe('object');
  });
}); 