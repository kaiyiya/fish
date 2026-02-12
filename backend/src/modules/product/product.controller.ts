import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // 记录用户浏览行为（用于推荐算法）
    await this.productService.recordView(user.id, +id);
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
