import { Controller, Get, Post } from '@nestjs/common';
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

  @Post('mockup')
  @ApiOperation({
    summary: 'Crear 5 productos mockup por defecto',
  })
  @ApiResponse({
    status: 201,
    description: 'Productos mockup creados exitosamente',
    type: [ProductDto],
  })
  async createMockupProducts() {
    return this.productService.createMockupProducts();
  }
}
