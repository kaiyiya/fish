import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查手机号是否已存在
    const existingPhone = await this.findByPhone(createUserDto.phone);
    if (existingPhone) {
      throw new ConflictException('手机号已被注册');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByPhone(phone: string): Promise<User> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async adminUpdatePassword(id: number, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const res = await this.userRepository.update(id, { password: hashedPassword });

    if (!res.affected || res.affected <= 0) {
      throw new NotFoundException('用户不存在');
    }

    return this.findOne(id);
  }

  async adminFindAll(): Promise<
    Array<{
      id: number;
      username: string;
      phone: string;
      avatar: string | null;
      gender: string | null;
      age: number | null;
      role: string;
      created_at: Date;
      updated_at: Date;
    }>
  > {
    const users = await this.userRepository.find({
      order: { created_at: 'DESC' },
    });

    // 不返回 password，避免泄露
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      phone: u.phone,
      avatar: u.avatar ?? null,
      gender: u.gender ?? null,
      age: (u.age as any) ?? null,
      role: u.role,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
