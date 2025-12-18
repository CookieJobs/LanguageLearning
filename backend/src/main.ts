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
