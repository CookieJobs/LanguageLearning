import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){ const count = await prisma.vocabWord.count(); console.log('vocab count', count) }
main().finally(async ()=>{ await prisma.$disconnect() })
