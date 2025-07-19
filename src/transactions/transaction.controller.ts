import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UUID } from 'crypto';

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

  @Get(':uuid')
  @ApiOperation({
    summary: 'Verificar transacción',
  })
  checkTransaction(@Param('uuid') uuid: UUID) {
    return this.service.checkTransaction(uuid);
  }
}
