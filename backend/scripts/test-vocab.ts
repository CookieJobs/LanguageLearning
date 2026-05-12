// input: mongoose, ../src/modules/learning/vocab.schema
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import mongoose from 'mongoose'
import { VocabWordSchema } from '../src/modules/learning/vocab.schema'
async function main(){ 
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft'
  await mongoose.connect(mongoUrl)
  const VocabWord = mongoose.models.VocabWord || mongoose.model('VocabWord', VocabWordSchema)
  const count = await VocabWord.countDocuments()
  console.log('vocab count', count)
  await mongoose.disconnect()
}
main().finally(async ()=>{ await mongoose.disconnect() })
