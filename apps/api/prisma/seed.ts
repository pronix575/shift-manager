import { PrismaNeon } from '@prisma/adapter-neon';
import { hash } from 'bcryptjs';
import { config } from 'dotenv';

import { PrismaClient } from '../src/generated/prisma/client';
import { UserRole } from '../src/generated/prisma/enums';

config({ path: '../../.env' });
config({ path: '.env', override: true });

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const login = process.env.INITIAL_ADMIN_LOGIN;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!login || !password) {
    throw new Error('INITIAL_ADMIN_LOGIN and INITIAL_ADMIN_PASSWORD are required');
  }

  const existing = await prisma.passwordIdentity.findUnique({
    where: { login },
  });

  if (existing) {
    return;
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      role: UserRole.ADMIN,
      firstName: 'Администратор',
      lastName: 'Системный',
      password: {
        create: {
          login,
          passwordHash,
          mustChangePassword: true,
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
