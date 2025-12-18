import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../../common/jwt.guard'
import { DeepSeekService } from './deepseek.service'
import { PrismaService } from '../../common/prisma.service'

@Controller('story')
export class StoryController {
    constructor(
        private deepseek: DeepSeekService,
        private prisma: PrismaService
    ) { }

    @Post('generate')
    @UseGuards(JwtGuard)
    async generate(@Body() body: { words: string[] }) {
        if (!body.words || body.words.length === 0) {
            return { story: 'Please select some words first!' }
        }

        const safeList = body.words.filter(w => typeof w === 'string' && w.trim().length > 0)
        if (safeList.length === 0) return { story: 'No valid words found.' }

        try {
            const result = await this.deepseek.generateStory(safeList)
            return result // result is already { story, translation }
        } catch (e) {
            console.error('Story Generation Error:', e)
            throw e
        }
    }
}
