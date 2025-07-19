  import { Injectable } from '@nestjs/common';
  import axios from 'axios';
  import { CardDto } from './dto/card.dto';
  import { TransactionWpiDto } from './dto/transaction-wpi.dto';
  import * as crypto from 'crypto';

  @Injectable()
  export class WpiService {
    private publicKey = process.env.WPI_PUBLIC_KEY || '';
    private privateKey = process.env.WPI_SECRET_KEY || '';
    private baseUrl = process.env.WPI_BASE_URL || '';
    private integrityKey = process.env.WPI_INTEGRITY_KEY || '';

    //Utilidades

    sanitizeReference(ref: string): string {
      return ref
        .trim() 
        .replace(/\s+/g, '') 
        .replace(/[\r\n\t]/g, ''); 
    }

    async generateSignature({ amountInCents, reference }: {
      amountInCents: number;
      reference: string;
    }) {
      const raw = `${reference}${amountInCents}${'COP'}${this.integrityKey}`;
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      return hash;
    }

    // Paso 1: Tokenizar tarjeta
    async tokenizeCard(cardData: CardDto) {
      const response = await axios.post(`${this.baseUrl}/tokens/cards`, cardData, {
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
        },
      });

      return response.data.data.id;
    }

    // Paso 2: Obtener acceptance_token
    async getAcceptanceTokenWpi() {
      const response = await axios.get(
        `${this.baseUrl}/merchants/${this.publicKey}`,
      );
      return response.data.data.presigned_acceptance.acceptance_token;
    }

    // Paso 4: Crear transacción
    async createTransactionWpi(data: TransactionWpiDto) {
      const acceptanceToken = await this.getAcceptanceTokenWpi();

      const signature = await this.generateSignature({
        amountInCents: data.amountInCents,
        reference: this.sanitizeReference(data.reference),
      });

      const response = await axios.post(
        `${this.baseUrl}/transactions`,
        {
          amount_in_cents: data.amountInCents,
          currency: 'COP',
          customer_email: data.customerEmail,
          payment_method: {
            type: 'CARD',
            token: data.token,
            installments: 1,
          },
          reference: this.sanitizeReference(data.reference),
          acceptance_token: acceptanceToken,
          signature: signature.toString(),
          redirect_url: 'https://www.google.com',
        },
        {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        },
      );

      return response.data;
  
    }
  }
