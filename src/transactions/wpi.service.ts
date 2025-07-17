import { Injectable } from '@nestjs/common';

@Injectable()
export class WompiService {
  pay({ reference }: { reference: string }) {
    // TODO: Implementar la llamada real a Wompi usando fetch o axios
    return {
      id: `wompi_${Math.random().toString(36).substring(7)}`,
      status: 'APPROVED',
      reference,
    };
  }
}
