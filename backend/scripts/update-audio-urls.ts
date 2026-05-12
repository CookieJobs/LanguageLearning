import mongoose from 'mongoose'
import { VocabWordSchema } from '../src/modules/learning/vocab.schema'

async function main() {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft'
    console.log(`Connecting to ${mongoUrl}...`)
    await mongoose.connect(mongoUrl)

    const VocabWord = (mongoose.models.VocabWord || mongoose.model('VocabWord', VocabWordSchema)) as mongoose.Model<any>

    console.log('Fetching all words...')
    const words = await VocabWord.find({})
    console.log(`Found ${words.length} words.`)

    const ops = words.map(w => {
        // Generate Youdao TTS URL (Type 2 = US English)
        const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(w.headword)}&type=2`

        return {
            updateOne: {
                filter: { _id: w._id },
                update: { $set: { audioUrl } }
            }
        }
    })

    console.log('Bulk updating...')
    const batchSize = 500
    for (let i = 0; i < ops.length; i += batchSize) {
        const chunk = ops.slice(i, i + batchSize)
        await VocabWord.bulkWrite(chunk, { ordered: false })
        console.log(`Processed ${Math.min(i + batchSize, ops.length)} / ${ops.length}`)
    }

    console.log('Done!')
    await mongoose.disconnect()
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
