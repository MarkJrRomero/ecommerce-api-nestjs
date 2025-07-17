import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductDto } from './dto/product.dto';

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
    type: [ProductDto],
  })
  getAll() {
    return this.productService.findAll();
  }
}
