// input: argon2, mongoose, ../src/modules/user/user.schema
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。

import * as argon2 from 'argon2';
import mongoose from 'mongoose';
import { UserSchema } from '../src/modules/user/user.schema';

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

  // 2. Check MongoDB
  try {
    console.log('Testing MongoDB connection...');
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft';
    await mongoose.connect(mongoUrl);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const count = await User.countDocuments();
    console.log(`✅ MongoDB connected. User count: ${count}`);
    await mongoose.disconnect();
  } catch (e) {
    console.error('❌ MongoDB failed:', e);
    process.exit(1);
  }

  console.log('✅ All checks passed.');
}

main();
