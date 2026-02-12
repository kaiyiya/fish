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
}
