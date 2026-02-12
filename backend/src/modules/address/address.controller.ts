import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * 创建地址
   */
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressService.create(user.id, createAddressDto);
  }

  /**
   * 获取用户地址列表
   */
  @Get()
  async getUserAddresses(@CurrentUser() user: any) {
    return this.addressService.getUserAddresses(user.id);
  }

  /**
   * 获取默认地址
   */
  @Get('default')
  async getDefaultAddress(@CurrentUser() user: any) {
    return this.addressService.getDefaultAddress(user.id);
  }

  /**
   * 获取地址详情
   */
  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.addressService.findOne(user.id, +id);
  }

  /**
   * 更新地址
   */
  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAddressDto>,
  ) {
    return this.addressService.update(user.id, +id, updateData);
  }

  /**
   * 删除地址
   */
  @Delete(':id')
  async remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.addressService.remove(user.id, +id);
    return { message: '删除成功' };
  }

  /**
   * 设置默认地址
   */
  @Patch(':id/default')
  async setDefault(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.addressService.setDefault(user.id, +id);
  }
}
