import { ApiProperty } from '@nestjs/swagger';

export class CardDto {
  @ApiProperty()
  number: string;

  @ApiProperty()
  exp_month: string;

  @ApiProperty()
  cvc: string;
  @ApiProperty()
  exp_year: string;

  @ApiProperty()
  card_holder: string;
}
