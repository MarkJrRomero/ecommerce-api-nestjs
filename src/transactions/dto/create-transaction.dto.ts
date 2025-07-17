import { ApiProperty } from '@nestjs/swagger';
import { CreateDeliveryDto } from '../../deliveries/dto/create-delivery.dto';

export class CreateTransactionDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  amount: number;

  @ApiProperty({ type: CreateDeliveryDto })
  delivery: CreateDeliveryDto;
}
