import { Transaction } from './transaction.entity';
import { Delivery } from '../deliveries/delivery.entity';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';

describe('Transaction Entity', () => {
  let transaction: Transaction;
  let mockDelivery: Delivery;

  beforeEach(() => {
    transaction = new Transaction();
    mockDelivery = {
      id: 1,
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      country: 'Colombia',
      product: {} as Product,
      customer: {} as Customer,
      transaction: {} as Transaction,
    };
  });

  it('debería estar definido', () => {
    expect(transaction).toBeDefined();
  });

  it('debería tener propiedades correctas', () => {
    transaction.id = 'transaction-uuid-123';
    transaction.status = 'PENDING';
    transaction.amount = 1500;
    transaction.transactionId = 'wpi_transaction_123';
    transaction.delivery = mockDelivery;
    transaction.createdAt = new Date('2024-01-01T00:00:00Z');

    expect(transaction.id).toBe('transaction-uuid-123');
    expect(transaction.status).toBe('PENDING');
    expect(transaction.amount).toBe(1500);
    expect(transaction.transactionId).toBe('wpi_transaction_123');
    expect(transaction.delivery).toEqual(mockDelivery);
    expect(transaction.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('debería aceptar status PENDING', () => {
    transaction.status = 'PENDING';
    expect(transaction.status).toBe('PENDING');
  });

  it('debería aceptar status APPROVED', () => {
    transaction.status = 'APPROVED';
    expect(transaction.status).toBe('APPROVED');
  });

  it('debería aceptar status DECLINED', () => {
    transaction.status = 'DECLINED';
    expect(transaction.status).toBe('DECLINED');
  });

  it('debería manejar valores decimales para amount', () => {
    transaction.amount = 1500.50;
    expect(transaction.amount).toBe(1500.50);
  });

  it('debería manejar amount cero', () => {
    transaction.amount = 0;
    expect(transaction.amount).toBe(0);
  });

  it('debería manejar amount negativo', () => {
    transaction.amount = -100;
    expect(transaction.amount).toBe(-100);
  });

  it('debería permitir delivery opcional', () => {
    transaction.delivery = {} as Delivery;
    expect(transaction.delivery).toBeDefined();
  });

  it('debería permitir transactionId vacío', () => {
    transaction.transactionId = '';
    expect(transaction.transactionId).toBe('');
  });

  it('debería permitir transactionId con valor por defecto', () => {
    transaction.transactionId = 'N/A';
    expect(transaction.transactionId).toBe('N/A');
  });
}); 