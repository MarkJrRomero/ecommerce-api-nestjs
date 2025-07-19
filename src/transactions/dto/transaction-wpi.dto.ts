import { ApiProperty } from '@nestjs/swagger';

export class TransactionWpiDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  amountInCents: number;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  customerEmail: string;
}
