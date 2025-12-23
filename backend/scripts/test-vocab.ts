// input: @prisma/client
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){ const count = await prisma.vocabWord.count(); console.log('vocab count', count) }
main().finally(async ()=>{ await prisma.$disconnect() })
