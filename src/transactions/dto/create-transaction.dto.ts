import { ApiProperty } from '@nestjs/swagger';
import { CreateDeliveryDto } from '../../deliveries/dto/create-delivery.dto';
import { CardDto } from './card.dto';

export class CreateTransactionDto {

  @ApiProperty()
  amount: number;

  @ApiProperty({ type: CreateDeliveryDto })
  delivery: CreateDeliveryDto;

  @ApiProperty()
  card: CardDto;
}
