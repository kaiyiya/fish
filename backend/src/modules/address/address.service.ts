import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../database/entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  /**
   * 创建地址
   */
  async create(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    // 如果设置为默认地址，先取消其他默认地址
    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const address = this.addressRepository.create({
      userId,
      ...createAddressDto,
    });

    return this.addressRepository.save(address);
  }

  /**
   * 获取用户地址列表
   */
  async getUserAddresses(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: {
        isDefault: 'DESC', // 默认地址排在前面
        created_at: 'DESC',
      },
    });
  }

  /**
   * 获取地址详情
   */
  async findOne(userId: number, id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    return address;
  }

  /**
   * 更新地址
   */
  async update(
    userId: number,
    id: number,
    updateData: Partial<CreateAddressDto>,
  ): Promise<Address> {
    const address = await this.findOne(userId, id);

    // 如果设置为默认地址，先取消其他默认地址
    if (updateData.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(address, updateData);
    return this.addressRepository.save(address);
  }

  /**
   * 删除地址
   */
  async remove(userId: number, id: number): Promise<void> {
    const result = await this.addressRepository.delete({ id, userId });
    if (!result.affected) {
      throw new NotFoundException('地址不存在');
    }
  }

  /**
   * 设置默认地址
   */
  async setDefault(userId: number, id: number): Promise<Address> {
    // 先取消所有默认地址
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    // 设置新的默认地址
    const address = await this.findOne(userId, id);
    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  /**
   * 获取默认地址
   */
  async getDefaultAddress(userId: number): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  /**
   * 逆地理编码：根据经纬度获取地址信息
   * 注意：这里使用腾讯地图API，需要配置API密钥
   * 实际项目中应该将API密钥放在环境变量中
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<{
    province: string;
    city: string;
    district: string;
    address: string;
  } | null> {
    try {
      // 使用腾讯地图逆地理编码API
      // 注意：需要申请腾讯地图API密钥，并配置在环境变量中
      const TENCENT_MAP_KEY = process.env.TENCENT_MAP_KEY || '';
      
      if (!TENCENT_MAP_KEY) {
        // 如果没有配置API密钥，返回null，让前端提示用户手动填写
        console.warn('腾讯地图API密钥未配置，无法进行逆地理编码');
        return null;
      }

      const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${TENCENT_MAP_KEY}&get_poi=0`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 0 && data.result) {
        const { address_component, formatted_addresses } = data.result;
        return {
          province: address_component?.province || '',
          city: address_component?.city || '',
          district: address_component?.district || '',
          address: formatted_addresses?.recommend || formatted_addresses?.rough || '',
        };
      }

      return null;
    } catch (error) {
      console.error('逆地理编码失败:', error);
      return null;
    }
  }
}
