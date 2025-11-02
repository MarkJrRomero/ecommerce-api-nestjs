import { ApiProperty } from '@nestjs/swagger';
import { CreateDeliveryDto } from '../../deliveries/dto/create-delivery.dto';
import { CardDto } from './card.dto';

export class ProductItemDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  quantity: number;
}

export class CreateTransactionDto {
  @ApiProperty({ type: [ProductItemDto] })
  products: ProductItemDto[];

  @ApiProperty({ type: CreateDeliveryDto })
  delivery: CreateDeliveryDto;

  @ApiProperty()
  card: CardDto;
}
