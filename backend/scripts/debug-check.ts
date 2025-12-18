
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Checking environment...');

  // 1. Check Argon2
  try {
    console.log('Testing Argon2...');
    const hash = await argon2.hash('password');
    const valid = await argon2.verify(hash, 'password');
    if (!valid) throw new Error('Argon2 verify failed');
    console.log('✅ Argon2 is working correctly.');
  } catch (e) {
    console.error('❌ Argon2 failed:', e);
    process.exit(1);
  }

  // 2. Check Prisma
  try {
    console.log('Testing Prisma connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log(`✅ Prisma connected. User count: ${count}`);
    await prisma.$disconnect();
  } catch (e) {
    console.error('❌ Prisma failed:', e);
    process.exit(1);
  }

  console.log('✅ All checks passed.');
}

main();
