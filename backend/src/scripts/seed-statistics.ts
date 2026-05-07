import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Category } from '../database/entities/category.entity';
import { Product } from '../database/entities/product.entity';
import { Address } from '../database/entities/address.entity';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import * as bcrypt from 'bcryptjs';

const months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'];

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function buildDate(ym: string, day: number, hour = 10, minute = 0) {
  const [year, month] = ym.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const addressRepo = dataSource.getRepository(Address);
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);

  const categories =
    (await categoryRepo.find()) || [];
  const categorySeeds = [
    '鲫鱼',
    '鲈鱼',
    '草鱼',
    '鲤鱼',
    '黑鱼',
  ];
  for (let i = 0; i < categorySeeds.length; i += 1) {
    const exists = categories.find((c) => c.name === categorySeeds[i]);
    if (!exists) {
      const c = categoryRepo.create({ name: categorySeeds[i], sortOrder: i + 1 });
      categories.push(await categoryRepo.save(c));
    }
  }

  let users = await userRepo.find();
  if (users.length < 4) {
    const basePassword = await bcrypt.hash('123456', 10);
    const seeds = [
      { username: 'demo_user_1', phone: '18000000001' },
      { username: 'demo_user_2', phone: '18000000002' },
      { username: 'demo_user_3', phone: '18000000003' },
      { username: 'demo_user_4', phone: '18000000004' },
    ];
    for (const seedUser of seeds) {
      const exists = users.find((u) => u.phone === seedUser.phone || u.username === seedUser.username);
      if (!exists) {
        users.push(
          await userRepo.save(
            userRepo.create({
              ...seedUser,
              password: basePassword,
              role: 'user',
            }),
          ),
        );
      }
    }
  }

  let products = await productRepo.find();
  if (products.length < 8) {
    const productSeeds = [
      { name: '鲜活鲫鱼', categoryId: categories[0].id, price: 18.8, stock: 120 },
      { name: '海鲈鱼', categoryId: categories[1].id, price: 36.5, stock: 80 },
      { name: '草鱼段', categoryId: categories[2].id, price: 24.2, stock: 150 },
      { name: '鲤鱼', categoryId: categories[3].id, price: 21.6, stock: 140 },
      { name: '黑鱼片', categoryId: categories[4].id, price: 42.0, stock: 60 },
      { name: '带鱼', categoryId: categories[1].id, price: 31.2, stock: 100 },
      { name: '青鱼', categoryId: categories[2].id, price: 28.4, stock: 90 },
      { name: '武昌鱼', categoryId: categories[3].id, price: 26.8, stock: 70 },
    ];
    for (const p of productSeeds) {
      const exists = products.find((x) => x.name === p.name);
      if (!exists) {
        products.push(await productRepo.save(productRepo.create(p)));
      }
    }
  }

  let addresses = await addressRepo.find();
  if (addresses.length < users.length) {
    for (const user of users.slice(0, 4)) {
      const exists = addresses.find((a) => a.userId === user.id);
      if (!exists) {
        addresses.push(
          await addressRepo.save(
            addressRepo.create({
              userId: user.id,
              name: user.username,
              phone: user.phone,
              province: '广东省',
              city: '深圳市',
              district: '南山区',
              detail: `科技园${user.id}号`,
              isDefault: true,
            }),
          ),
        );
      }
    }
  }

  const existingOrders = await orderRepo.count();
  if (existingOrders < 20) {
    const templates = [
      { count: 3, amount: 168.5 },
      { count: 5, amount: 320.0 },
      { count: 2, amount: 96.8 },
      { count: 6, amount: 412.2 },
      { count: 4, amount: 238.9 },
      { count: 7, amount: 520.3 },
    ];

    for (let i = 0; i < months.length; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const user = randomFrom(users);
        const address = addresses.find((a) => a.userId === user.id) || randomFrom(addresses);
        const template = templates[(i + j) % templates.length];
        const order = await orderRepo.save(
          orderRepo.create({
            userId: user.id,
            addressId: address.id,
            totalAmount: template.amount + Math.round(Math.random() * 80),
            status: randomFrom(['paid', 'completed', 'shipped']),
            paymentMethod: 'wallet_mock',
            orderNo: `SEED${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          }),
        );

        const productCount = template.count;
        const selectedProducts = [...products].sort(() => Math.random() - 0.5).slice(0, productCount);
        const items = selectedProducts.map((product, idx) => {
          const qty = 1 + ((idx + j) % 3);
          const price = Number(product.price);
          return orderItemRepo.create({
            orderId: order.id,
            productId: product.id,
            quantity: qty,
            price,
            subtotal: Number((qty * price).toFixed(2)),
          });
        });
        await orderItemRepo.save(items);

        const createdAt = buildDate(months[i], 5 + j * 7 + (i % 3), 9 + j, 15);
        await orderRepo.update(order.id, {
          created_at: createdAt,
          updated_at: createdAt,
        } as any);
        await orderItemRepo
          .createQueryBuilder()
          .update(OrderItem)
          .set({ created_at: createdAt } as any)
          .where('orderId = :orderId', { orderId: order.id })
          .execute();
      }
    }

    // 近 7 天再补几单，形成短期波动
    for (let d = 0; d < 7; d += 1) {
      const user = randomFrom(users);
      const address = addresses.find((a) => a.userId === user.id) || randomFrom(addresses);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - (6 - d));
      createdAt.setHours(10 + (d % 3), 20, 0, 0);
      const amountBase = [88, 120, 54, 210, 160, 98, 240][d];
      const order = await orderRepo.save(
        orderRepo.create({
          userId: user.id,
          addressId: address.id,
          totalAmount: amountBase,
          status: d % 3 === 0 ? 'completed' : 'paid',
          paymentMethod: 'wallet_mock',
          orderNo: `SEEDDAY${Date.now()}${d}`,
        }),
      );
      const product = randomFrom(products);
      await orderItemRepo.save(
        orderItemRepo.create({
          orderId: order.id,
          productId: product.id,
          quantity: 1 + (d % 3),
          price: Number(product.price),
          subtotal: amountBase,
        }),
      );
      await orderRepo.update(order.id, {
        created_at: createdAt,
        updated_at: createdAt,
      } as any);
      await orderItemRepo
        .createQueryBuilder()
        .update(OrderItem)
        .set({ created_at: createdAt } as any)
        .where('orderId = :orderId', { orderId: order.id })
        .execute();
    }
  }

  console.log('统计波动模拟数据已补充完成');
  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
