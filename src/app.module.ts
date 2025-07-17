import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductModule } from './products/product.module';
import { Customer } from './customers/customer.entity';
import { Delivery } from './deliveries/delivery.entity';
import { TransactionModule } from './transactions/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV', 'development') === 'development',
        ssl: {
          rejectUnauthorized: false, // Requerido por Supabase
        },
      }),
    }),
    ProductModule,
    TransactionModule,
    TypeOrmModule.forFeature([Customer, Delivery]),
  ],
})
export class AppModule {}
