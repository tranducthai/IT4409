import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/user.entity';

function isBcryptHash(value: string): boolean {
  // bcrypt hashes typically start with $2a$, $2b$, or $2y$
  return /^\$2[aby]\$/.test(value);
}

async function main() {
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);

    const users = await userRepo.find({ select: { id: true, password: true } });

    let updated = 0;
    for (const u of users) {
      if (!u.password) continue;
      if (isBcryptHash(u.password)) continue;

      const hashed = await bcrypt.hash(u.password, rounds);

      if (!dryRun) {
        await userRepo.update({ id: u.id }, { password: hashed });
      }

      updated += 1;
    }

    console.log(
      JSON.stringify(
        {
          dryRun,
          bcryptRounds: rounds,
          totalUsers: users.length,
          updated,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

void main();
