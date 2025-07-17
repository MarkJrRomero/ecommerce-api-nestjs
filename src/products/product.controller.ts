import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado completo',
    type: [Product],
  })
  getAll() {
    return this.productService.findAll();
  }
}
