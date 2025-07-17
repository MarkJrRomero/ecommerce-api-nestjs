import { Controller, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear transacción, registrar entrega y pagar con Wpi',
  })
  create(@Body() dto: CreateTransactionDto) {
    return this.service.createTransaction(dto);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Procesar webhook de Wpi',
  })
  processWebhook(@Body() payload: any) {
    return this.service.processWpiWebhook(payload);
  }
}
