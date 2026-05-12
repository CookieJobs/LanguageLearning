// input: @nestjs/core, @nestjs/common, ./modules/app.module, dotenv
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
import { AppModule } from './modules/app.module'


async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule)
    app.setGlobalPrefix('api')
    app.enableCors({ origin: true, credentials: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    const port = process.env.API_PORT ? Number(process.env.API_PORT) : 5500
    await app.listen(port)
    process.stdout.write(`api:${port}\n`)
  } catch (e) {
    const msg = (e as any)?.stack || String(e)
    process.stderr.write(msg + '\n')
  }
}

bootstrap()
