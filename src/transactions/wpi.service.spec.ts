import { Test, TestingModule } from '@nestjs/testing';
import { WpiService } from './wpi.service';
import axios from 'axios';
import * as crypto from 'crypto';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock crypto
jest.mock('crypto');

describe('WpiService', () => {
  let service: WpiService;

  const mockCardData = {
    number: '4111111111111111',
    cvc: '123',
    exp_month: '12',
    exp_year: '2025',
    card_holder: 'Juan Pérez',
  };

  const mockTransactionData = {
    token: 'tok_test_123',
    amountInCents: 150000,
    reference: 'ref_123',
    customerEmail: 'test@example.com',
  };

  beforeEach(async () => {
    // Mock environment variables
    process.env.WPI_PUBLIC_KEY = 'pk_test_123';
    process.env.WPI_SECRET_KEY = 'sk_test_123';
    process.env.WPI_BASE_URL = 'https://api.wpi.com';
    process.env.WPI_INTEGRITY_KEY = 'integrity_key_123';

    const module: TestingModule = await Test.createTestingModule({
      providers: [WpiService],
    }).compile();

    service = module.get<WpiService>(WpiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeReference', () => {
    it('debería limpiar espacios en blanco', () => {
      const result = service.sanitizeReference('  ref_123  ');
      expect(result).toBe('ref_123');
    });

    it('debería eliminar saltos de línea y tabulaciones', () => {
      const result = service.sanitizeReference('ref_123\n\t\r');
      expect(result).toBe('ref_123');
    });

    it('debería reemplazar múltiples espacios con uno solo', () => {
      const result = service.sanitizeReference('ref  123');
      expect(result).toBe('ref123');
    });

    it('debería mantener referencias válidas sin cambios', () => {
      const result = service.sanitizeReference('ref_123');
      expect(result).toBe('ref_123');
    });
  });

  describe('generateSignature', () => {
    it('debería generar una firma válida', async () => {
      const mockHash = 'mock_hash_123';
      const mockDigest = jest.fn().mockReturnValue(mockHash);
      const mockUpdate = jest.fn().mockReturnValue({ digest: mockDigest });
      const mockCreateHash = jest.fn().mockReturnValue({ update: mockUpdate });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: mockUpdate,
        digest: mockDigest,
      });

      const result = await service.generateSignature({
        amountInCents: 150000,
        reference: 'ref_123',
      });

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockUpdate).toHaveBeenCalledWith('ref_123150000COPintegrity_key_123');
      expect(mockDigest).toHaveBeenCalledWith('hex');
      expect(result).toBe(mockHash);
    });
  });

  describe('tokenizeCard', () => {
    it('debería tokenizar una tarjeta exitosamente', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'tok_test_123',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.tokenizeCard(mockCardData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.wpi.com/tokens/cards',
        mockCardData,
        {
          headers: {
            Authorization: 'Bearer pk_test_123',
          },
        }
      );
      expect(result).toBe('tok_test_123');
    });

    it('debería manejar errores de la API', async () => {
      const error = new Error('Error de API');
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.tokenizeCard(mockCardData)).rejects.toThrow('Error de API');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.wpi.com/tokens/cards',
        mockCardData,
        {
          headers: {
            Authorization: 'Bearer pk_test_123',
          },
        }
      );
    });
  });

  describe('getAcceptanceTokenWpi', () => {
    it('debería obtener el acceptance token exitosamente', async () => {
      const mockResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'acceptance_token_123',
            },
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getAcceptanceTokenWpi();

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.wpi.com/merchants/pk_test_123');
      expect(result).toBe('acceptance_token_123');
    });

    it('debería manejar errores de la API', async () => {
      const error = new Error('Error de API');
      mockedAxios.get.mockRejectedValue(error);

      await expect(service.getAcceptanceTokenWpi()).rejects.toThrow('Error de API');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.wpi.com/merchants/pk_test_123');
    });
  });

  describe('createTransactionWpi', () => {
    beforeEach(() => {
      // Mock generateSignature
      jest.spyOn(service, 'generateSignature').mockResolvedValue('mock_signature_123');
      jest.spyOn(service, 'getAcceptanceTokenWpi').mockResolvedValue('acceptance_token_123');
      jest.spyOn(service, 'sanitizeReference').mockReturnValue('ref_123');
    });

    it('debería crear una transacción exitosamente', async () => {
      const mockResponse = {
        data: {
          id: 'transaction_123',
          status: 'APPROVED',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.createTransactionWpi(mockTransactionData);

      expect(service.getAcceptanceTokenWpi).toHaveBeenCalled();
      expect(service.generateSignature).toHaveBeenCalledWith({
        amountInCents: 150000,
        reference: 'ref_123',
      });
      expect(service.sanitizeReference).toHaveBeenCalledWith('ref_123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.wpi.com/transactions',
        {
          amount_in_cents: 150000,
          currency: 'COP',
          customer_email: 'test@example.com',
          payment_method: {
            type: 'CARD',
            token: 'tok_test_123',
            installments: 1,
          },
          reference: 'ref_123',
          acceptance_token: 'acceptance_token_123',
          signature: 'mock_signature_123',
          redirect_url: 'https://www.google.com',
        },
        {
          headers: {
            Authorization: 'Bearer sk_test_123',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('debería manejar errores de la API', async () => {
      const error = new Error('Error de API');
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.createTransactionWpi(mockTransactionData)).rejects.toThrow('Error de API');
    });

    it('debería usar valores por defecto cuando las variables de entorno no están definidas', async () => {
      // Limpiar variables de entorno
      delete process.env.WPI_PUBLIC_KEY;
      delete process.env.WPI_SECRET_KEY;
      delete process.env.WPI_BASE_URL;
      delete process.env.WPI_INTEGRITY_KEY;

      const newService = new WpiService();
      const mockResponse = {
        data: {
          id: 'transaction_123',
          status: 'APPROVED',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);
      jest.spyOn(newService, 'generateSignature').mockResolvedValue('mock_signature_123');
      jest.spyOn(newService, 'getAcceptanceTokenWpi').mockResolvedValue('acceptance_token_123');
      jest.spyOn(newService, 'sanitizeReference').mockReturnValue('ref_123');

      const result = await newService.createTransactionWpi(mockTransactionData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/transactions',
        expect.objectContaining({
          amount_in_cents: 150000,
          currency: 'COP',
        }),
        {
          headers: {
            Authorization: 'Bearer ',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });
  });
}); 