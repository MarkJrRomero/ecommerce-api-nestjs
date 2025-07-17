import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;
}

export class CreateDeliveryDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty({ type: CreateCustomerDto })
  customer: CreateCustomerDto;

  @ApiProperty()
  productId: number;
}
